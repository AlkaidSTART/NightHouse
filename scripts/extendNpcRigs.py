"""Add shoulder and grouped finger deformation to the shipped NPC GLBs.

Run with Blender's Python to use mathutils. Existing geometry, texture data and
animation clips are retained. Each input must be an original NPC export.
"""

import argparse
import json
from pathlib import Path
import struct
import sys

from mathutils import Matrix, Vector


class CharacterGlb:
    def __init__(self, path):
        raw = path.read_bytes()
        magic, version, length, json_length, json_type = struct.unpack_from("<4s4I", raw)
        bin_length, bin_type = struct.unpack_from("<2I", raw, 20 + json_length)
        if (
            (magic, version, json_type, bin_type) != (b"glTF", 2, 0x4E4F534A, 0x004E4942)
            or length != len(raw)
            or 28 + json_length + bin_length != length
        ):
            raise ValueError(f"Expected a single-buffer GLB: {path}")
        self.doc = json.loads(raw[20:20 + json_length])
        self.data = bytearray(raw[28 + json_length:])

    def layout(self, index):
        accessor = self.doc["accessors"][index]
        view = self.doc["bufferViews"][accessor["bufferView"]]
        components = {"VEC3": 3, "VEC4": 4, "MAT4": 16}[accessor["type"]]
        component_type = {5121: "B", 5123: "H", 5126: "f"}[accessor["componentType"]]
        packed = struct.Struct(f"<{components}{component_type}")
        start = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
        return accessor, packed, start, view.get("byteStride", packed.size)

    def read(self, index):
        accessor, packed, start, stride = self.layout(index)
        return [packed.unpack_from(self.data, start + i * stride) for i in range(accessor["count"])]

    def rewrite(self, index, rows):
        accessor, packed, start, stride = self.layout(index)
        if len(rows) != accessor["count"]:
            raise ValueError("Accessor row count changed")
        for i, row in enumerate(rows):
            packed.pack_into(self.data, start + i * stride, *row)

    def extend_bind_matrices(self, index, binds):
        accessor, packed, _, _ = self.layout(index)
        view = self.doc["bufferViews"][accessor["bufferView"]]
        self.data.extend(b"\0" * (-len(self.data) % 4))
        view["byteOffset"] = len(self.data)
        view["byteLength"] = packed.size * len(binds)
        accessor["count"] = len(binds)
        for inverse in binds:
            self.data.extend(packed.pack(*(value for col in inverse.col for value in col)))

    def write(self, path):
        self.doc["buffers"][0]["byteLength"] = len(self.data)
        metadata = json.dumps(self.doc, separators=(",", ":"), ensure_ascii=False).encode()
        metadata += b" " * (-len(metadata) % 4)
        total = 28 + len(metadata) + len(self.data)
        path.write_bytes(
            struct.pack("<4s4I", b"glTF", 2, total, len(metadata), 0x4E4F534A)
            + metadata + struct.pack("<2I", len(self.data), 0x004E4942) + self.data
        )


def smoothstep(value):
    value = min(max(value, 0), 1)
    return value * value * (3 - 2 * value)


def quantile(values, fraction):
    ordered = sorted(values)
    return ordered[round((len(ordered) - 1) * fraction)]


def transfer_weights(points, joints, weights, donor, recipient, influence):
    changed = 0
    for i, (point, indices, values) in enumerate(zip(points, joints, weights)):
        entries = {joint: weight for joint, weight in zip(indices, values) if weight > 0}
        # Keep the four existing nonzero influences at harder seams.
        if donor not in entries or len(entries) == 4:
            continue
        share = entries[donor] * influence(point)
        if share < 0.001:
            continue
        entries[donor] -= share
        entries[recipient] = share
        ordered = sorted(entries.items(), key=lambda pair: -pair[1])
        ordered += [(0, 0)] * (4 - len(ordered))
        joints[i], weights[i] = zip(*ordered)
        changed += 1
    if changed < 25:
        raise ValueError(f"Unexpectedly few vertices for joint {recipient}: {changed}")
    return changed


def finger_bind(hand_inverse, points, joints, weights, donor, side):
    hand = [
        hand_inverse @ point
        for point, indices, values in zip(points, joints, weights)
        if any(joint == donor and value > 0.55 for joint, value in zip(indices, values))
    ]
    low, middle, high = (quantile((p.y for p in hand), q) for q in (0.42, 0.62, 0.90))
    knuckles = [p for p in hand if abs(p.y - middle) < 0.008]
    tips = [p for p in hand if p.y >= high]
    pivot = sum(knuckles, Vector((0, 0, 0))) / len(knuckles)
    direction = (sum(tips, Vector((0, 0, 0))) / len(tips) - pivot).normalized()
    # A positive local X rotation curls both hands toward the body.
    inward = hand_inverse.to_3x3() @ Vector((-side, 0, 0))
    flex = (inward - direction * inward.dot(direction)).normalized()
    across = direction.cross(flex).normalized()
    rotation = Matrix((across, direction, flex)).transposed().to_quaternion()
    return pivot, rotation, low, high


def extend_rig(source, output):
    glb = CharacterGlb(source)
    doc = glb.doc
    nodes = doc["nodes"]
    lookup = {node["name"]: i for i, node in enumerate(nodes)}
    if "Clavicle.L" in lookup or "Fingers.L" in lookup:
        raise ValueError(f"Already extended: {source}")
    skin, = doc["skins"]
    mesh, = doc["meshes"]
    primitive, = mesh["primitives"]
    attrs = primitive["attributes"]
    joint_ids = skin["joints"]
    bind_index = skin["inverseBindMatrices"]
    binds = [
        Matrix([row[i:i + 4] for i in range(0, 16, 4)]).transposed()
        for row in glb.read(bind_index)
    ]
    points = [Vector(point) for point in glb.read(attrs["POSITION"])]
    joints = glb.read(attrs["JOINTS_0"])
    weights = glb.read(attrs["WEIGHTS_0"])

    def add_joint(name, parent, offset, rotation=None, child=None):
        node = {"name": name, "translation": list(offset)}
        transform = Matrix.Translation(offset)
        if rotation is not None:
            node["rotation"] = [rotation.x, rotation.y, rotation.z, rotation.w]
            transform @= rotation.to_matrix().to_4x4()
        index = len(nodes)
        nodes.append(node)
        siblings = nodes[parent].setdefault("children", [])
        if child is None:
            siblings.append(index)
        else:
            siblings[siblings.index(child)] = index
            node["children"] = [child]
        binds.append(transform.inverted() @ binds[joint_ids.index(parent)])
        joint_ids.append(index)
        return len(joint_ids) - 1

    translations = {}
    coverage = {}
    for label, sign in (("L", 1), ("R", -1)):
        shoulder = lookup[f"UpperArm.{label}"]
        arm_joint = joint_ids.index(shoulder)
        arm_inverse = binds[arm_joint]
        shoulder_name = f"Clavicle.{label}"
        shoulder_offset = Vector(nodes[shoulder]["translation"]) * 0.36
        clavicle = add_joint(shoulder_name, lookup["Chest"], shoulder_offset, child=shoulder)
        nodes[shoulder]["translation"] = list(Vector(nodes[shoulder]["translation"]) - shoulder_offset)
        translations[shoulder] = shoulder_offset
        coverage[shoulder_name] = transfer_weights(
            points, joints, weights, arm_joint, clavicle,
            lambda p: 0.55 * smoothstep((0.075 - (arm_inverse @ p).y) / 0.065),
        )

        hand = lookup[f"Hand.{label}"]
        hand_joint = joint_ids.index(hand)
        hand_inverse = binds[hand_joint]
        pivot, rotation, low, high = finger_bind(hand_inverse, points, joints, weights, hand_joint, sign)
        fingers_name = f"Fingers.{label}"
        fingers = add_joint(fingers_name, hand, pivot, rotation)
        coverage[fingers_name] = transfer_weights(
            points, joints, weights, hand_joint, fingers,
            lambda p: 0.96 * smoothstep(((hand_inverse @ p).y - low) / (high - low)),
        )

    # Compensate each upper-arm translation in its new parent space, including Walk.
    # The other animation channels and the original inverse bind matrices stay intact.
    translation_outputs = {}
    for animation in doc["animations"]:
        for channel in animation["channels"]:
            target = channel["target"]
            if target["path"] != "translation" or target["node"] not in translations:
                continue
            sampler = animation["samplers"][channel["sampler"]]
            old_index = sampler["output"]
            offset = translations[target["node"]]
            key = (old_index, target["node"], sampler.get("interpolation") == "CUBICSPLINE")
            if key not in translation_outputs:
                accessor, packed, _, _ = glb.layout(old_index)
                glb.data.extend(b"\0" * (-len(glb.data) % 4))
                view = len(doc["bufferViews"])
                doc["bufferViews"].append({
                    "buffer": 0, "byteOffset": len(glb.data),
                    "byteLength": packed.size * accessor["count"],
                })
                for i, row in enumerate(glb.read(old_index)):
                    is_tangent = key[2] and i % 3 != 1
                    glb.data.extend(packed.pack(*(row if is_tangent else Vector(row) - offset)))
                translation_outputs[key] = len(doc["accessors"])
                doc["accessors"].append({
                    "bufferView": view, "componentType": 5126,
                    "count": accessor["count"], "type": "VEC3",
                })
            sampler["output"] = translation_outputs[key]

    glb.rewrite(attrs["JOINTS_0"], joints)
    glb.rewrite(attrs["WEIGHTS_0"], weights)
    glb.extend_bind_matrices(bind_index, binds)
    glb.write(output)
    print(f"{source.name}: {len(joint_ids)} joints, weighted vertices {coverage}", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
    extend_rig(args.source, args.output)
