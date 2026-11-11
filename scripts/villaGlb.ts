import {
  MATERIALS,
  TEXTURE_SETS,
  type MaterialSpec,
  type TextureSetId,
} from '../src/content/scenes/sceneMaterials.ts';
import { DOOR_THICKNESS } from '../src/game/scene/sceneGeometry.ts';
import type { Vec3Tuple } from '../src/shared/types/save';
import type {
  SceneBox,
  SceneDefinition,
  SceneDoor,
  SceneLight,
  SceneMaterialId,
} from '../src/shared/types/scene';

/**
 * 把场景定义导出为单个 GLB（glTF 2.0 二进制）。
 *
 * 不依赖任何 glTF 库：场景只有长方体、空物体和灯光，手写写出器比引入依赖更小、更可审计。
 * 节点命名沿用《场景建模方案 V0.2》§4.2：`DOOR_` / `INT_` / `NPC_` / `LIGHT_` / `SPAWN_` / `COL_`，
 * 这样 Blender 阶段可以直接按同名空物体接管摆放点。
 */

const GLB_MAGIC = 0x46546c67; // 'glTF'
const CHUNK_JSON = 0x4e4f534a; // 'JSON'
const CHUNK_BIN = 0x004e4942; // 'BIN\0'

const FLOAT = 5126;
const UNSIGNED_SHORT = 5123;
const ARRAY_BUFFER = 34962;
const ELEMENT_ARRAY_BUFFER = 34963;

/**
 * 有贴图的材质粗糙度。游戏里是「粗糙度贴图 × gloss」，glTF 需要把粗糙度通道打包进
 * metallicRoughness 贴图才能还原；这里用与游戏观感接近的常量，避免再生成一套打包贴图。
 */
const TEXTURED_ROUGHNESS: Record<TextureSetId, number> = {
  plaster: 0.88,
  wood: 0.64,
  woodGrain: 0.52,
  stone: 0.72,
  roof: 0.58,
  ground: 0.62,
  foliage: 0.82,
  hedge: 0.8,
  bark: 0.88,
  fabric: 0.86,
  tile: 0.42,
  grime: 0.54,
  docLetter: 0.85,
  docPhoto: 0.8,
};

type Json = Record<string, unknown>;

/** 以 4 字节对齐追加数据的二进制缓冲。 */
class BinaryBuilder {
  private readonly parts: Uint8Array[] = [];
  private size = 0;

  append(data: Uint8Array): { offset: number; length: number } {
    this.pad();
    const offset = this.size;
    this.parts.push(data);
    this.size += data.byteLength;
    return { offset, length: data.byteLength };
  }

  finish(): Uint8Array {
    this.pad();
    const out = new Uint8Array(this.size);
    let cursor = 0;
    for (const part of this.parts) {
      out.set(part, cursor);
      cursor += part.byteLength;
    }
    return out;
  }

  private pad(): void {
    const remainder = this.size % 4;
    if (remainder !== 0) {
      const padding = new Uint8Array(4 - remainder);
      this.parts.push(padding);
      this.size += padding.byteLength;
    }
  }
}

interface FaceVertex {
  position: Vec3Tuple;
  /** 以米为单位的面内坐标；再按 tileSize 换算成 UV。 */
  u: number;
  v: number;
}

interface Face {
  normal: Vec3Tuple;
  /** 从外侧看逆时针：左下、右下、右上、左上。 */
  vertices: [FaceVertex, FaceVertex, FaceVertex, FaceVertex];
}

/** 单位原点在最小角的长方体六个面。 */
function boxFaces(sx: number, sy: number, sz: number): Face[] {
  const vertex = (x: number, y: number, z: number, u: number, v: number): FaceVertex => ({
    position: [x, y, z],
    u,
    v,
  });
  return [
    {
      normal: [1, 0, 0],
      vertices: [
        vertex(sx, 0, sz, 0, 0),
        vertex(sx, 0, 0, sz, 0),
        vertex(sx, sy, 0, sz, sy),
        vertex(sx, sy, sz, 0, sy),
      ],
    },
    {
      normal: [-1, 0, 0],
      vertices: [
        vertex(0, 0, 0, 0, 0),
        vertex(0, 0, sz, sz, 0),
        vertex(0, sy, sz, sz, sy),
        vertex(0, sy, 0, 0, sy),
      ],
    },
    {
      normal: [0, 0, 1],
      vertices: [
        vertex(0, 0, sz, 0, 0),
        vertex(sx, 0, sz, sx, 0),
        vertex(sx, sy, sz, sx, sy),
        vertex(0, sy, sz, 0, sy),
      ],
    },
    {
      normal: [0, 0, -1],
      vertices: [
        vertex(sx, 0, 0, 0, 0),
        vertex(0, 0, 0, sx, 0),
        vertex(0, sy, 0, sx, sy),
        vertex(sx, sy, 0, 0, sy),
      ],
    },
    {
      normal: [0, 1, 0],
      vertices: [
        vertex(0, sy, sz, 0, 0),
        vertex(sx, sy, sz, sx, 0),
        vertex(sx, sy, 0, sx, sz),
        vertex(0, sy, 0, 0, sz),
      ],
    },
    {
      normal: [0, -1, 0],
      vertices: [
        vertex(0, 0, 0, 0, 0),
        vertex(sx, 0, 0, sx, 0),
        vertex(sx, 0, sz, sx, sz),
        vertex(0, 0, sz, 0, sz),
      ],
    },
  ];
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}

type Quaternion = [x: number, y: number, z: number, w: number];

/** 与 PlayCanvas `Quat.setFromEulerAngles` 相同的欧拉角约定（角度制）。 */
function quaternionFromEuler(ex: number, ey: number, ez: number): Quaternion {
  const half = Math.PI / 360;
  const sx = Math.sin(ex * half);
  const cx = Math.cos(ex * half);
  const sy = Math.sin(ey * half);
  const cy = Math.cos(ey * half);
  const sz = Math.sin(ez * half);
  const cz = Math.cos(ez * half);
  return [
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz,
  ];
}

function multiplyQuaternion(a: Quaternion, b: Quaternion): Quaternion {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

interface MeshRecord {
  index: number;
}

class GltfWriter {
  readonly binary = new BinaryBuilder();
  readonly bufferViews: Json[] = [];
  readonly accessors: Json[] = [];
  readonly meshes: Json[] = [];
  readonly materials: Json[] = [];
  readonly textures: Json[] = [];
  readonly images: Json[] = [];
  readonly nodes: Json[] = [];
  readonly lights: Json[] = [];

  private readonly meshCache = new Map<string, MeshRecord>();
  private readonly materialCache = new Map<SceneMaterialId, number>();
  private readonly textureCache = new Map<string, number>();

  private readonly loadTexture: (url: string) => Uint8Array;

  constructor(loadTexture: (url: string) => Uint8Array) {
    this.loadTexture = loadTexture;
  }

  addNode(node: Json): number {
    this.nodes.push(node);
    return this.nodes.length - 1;
  }

  /** 同材质、同尺寸的长方体共用一个网格，椅子之类的重复件不会重复占体积。 */
  boxMesh(materialId: SceneMaterialId, sx: number, sy: number, sz: number): number {
    const key = `${materialId}|${round(sx)}|${round(sy)}|${round(sz)}`;
    const cached = this.meshCache.get(key);
    if (cached) {
      return cached.index;
    }

    const tileSize = MATERIALS[materialId].tileSize ?? 0;
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const min: Vec3Tuple = [Infinity, Infinity, Infinity];
    const max: Vec3Tuple = [-Infinity, -Infinity, -Infinity];

    for (const face of boxFaces(sx, sy, sz)) {
      const base = positions.length / 3;
      const us = face.vertices.map((vertex) => vertex.u);
      const vs = face.vertices.map((vertex) => vertex.v);
      const uExtent = Math.max(...us) || 1;
      const vExtent = Math.max(...vs) || 1;
      for (const vertex of face.vertices) {
        positions.push(...vertex.position);
        normals.push(...face.normal);
        // 有 tileSize 时按世界尺寸平铺；否则整面一张图（信纸、照片）。
        // glTF 的 v 轴向下，所以取 1 - v 让贴图「上」对应世界「上」。
        const u = tileSize > 0 ? vertex.u / tileSize : vertex.u / uExtent;
        const v = tileSize > 0 ? vertex.v / tileSize : vertex.v / vExtent;
        uvs.push(u, 1 - v);
        for (let axis = 0; axis < 3; axis += 1) {
          const value = vertex.position[axis] ?? 0;
          min[axis] = Math.min(min[axis] ?? value, value);
          max[axis] = Math.max(max[axis] ?? value, value);
        }
      }
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    const position = this.accessor(new Float32Array(positions), FLOAT, 'VEC3', ARRAY_BUFFER, {
      min,
      max,
    });
    const normal = this.accessor(new Float32Array(normals), FLOAT, 'VEC3', ARRAY_BUFFER);
    const uv = this.accessor(new Float32Array(uvs), FLOAT, 'VEC2', ARRAY_BUFFER);
    const index = this.accessor(
      new Uint16Array(indices),
      UNSIGNED_SHORT,
      'SCALAR',
      ELEMENT_ARRAY_BUFFER,
    );

    this.meshes.push({
      name: `box_${key.replaceAll('|', '_')}`,
      primitives: [
        {
          attributes: { POSITION: position, NORMAL: normal, TEXCOORD_0: uv },
          indices: index,
          material: this.material(materialId),
        },
      ],
    });
    const record: MeshRecord = { index: this.meshes.length - 1 };
    this.meshCache.set(key, record);
    return record.index;
  }

  private accessor(
    data: Float32Array | Uint16Array,
    componentType: number,
    type: 'SCALAR' | 'VEC2' | 'VEC3',
    target: number,
    bounds?: { min: Vec3Tuple; max: Vec3Tuple },
  ): number {
    const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const { offset, length } = this.binary.append(bytes);
    this.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: length, target });
    const components = type === 'SCALAR' ? 1 : type === 'VEC2' ? 2 : 3;
    this.accessors.push({
      bufferView: this.bufferViews.length - 1,
      componentType,
      count: data.length / components,
      type,
      ...(bounds ? { min: bounds.min, max: bounds.max } : {}),
    });
    return this.accessors.length - 1;
  }

  private material(id: SceneMaterialId): number {
    const cached = this.materialCache.get(id);
    if (cached !== undefined) {
      return cached;
    }

    const spec: MaterialSpec = MATERIALS[id];
    const textureSet = spec.textureSet ? TEXTURE_SETS[spec.textureSet] : undefined;
    const tint = textureSet ? (spec.mapTint ?? [1, 1, 1]) : spec.color;

    const pbr: Json = {
      baseColorFactor: [tint[0], tint[1], tint[2], 1],
      metallicFactor: spec.metalness ?? 0,
      roughnessFactor: spec.textureSet
        ? TEXTURED_ROUGHNESS[spec.textureSet]
        : round(1 - (spec.gloss ?? 0.25)),
    };
    const material: Json = { name: `MAT_${id}`, pbrMetallicRoughness: pbr };

    if (textureSet) {
      pbr.baseColorTexture = { index: this.texture(textureSet.baseColor) };
      if (textureSet.normal) {
        material.normalTexture = {
          index: this.texture(textureSet.normal),
          scale: spec.bumpiness ?? 0.7,
        };
      }
      if (textureSet.ao) {
        material.occlusionTexture = { index: this.texture(textureSet.ao), strength: 1 };
      }
    }
    if (spec.emissive) {
      material.emissiveFactor = [...spec.emissive];
    }

    this.materials.push(material);
    const index = this.materials.length - 1;
    this.materialCache.set(id, index);
    return index;
  }

  private texture(url: string): number {
    const cached = this.textureCache.get(url);
    if (cached !== undefined) {
      return cached;
    }
    const bytes = this.loadTexture(url);
    const { offset, length } = this.binary.append(bytes);
    this.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: length });
    this.images.push({
      name: url.split('/').pop() ?? url,
      bufferView: this.bufferViews.length - 1,
      mimeType: 'image/png',
    });
    this.textures.push({ sampler: 0, source: this.images.length - 1 });
    const index = this.textures.length - 1;
    this.textureCache.set(url, index);
    return index;
  }
}

function boxNode(writer: GltfWriter, box: SceneBox): number {
  const size: Vec3Tuple = [
    box.max[0] - box.min[0],
    box.max[1] - box.min[1],
    box.max[2] - box.min[2],
  ];
  return writer.addNode({
    name: box.id,
    mesh: writer.boxMesh(box.material, size[0], size[1], size[2]),
    translation: [...box.min],
    extras: { collide: box.collide, material: box.material },
  });
}

/** 不渲染的边界盒：只留一个带尺寸的空物体，对应 Blender 里的 COL_ 盒子。 */
function collisionNode(box: SceneBox): Json {
  return {
    name: `COL_${box.id}`,
    translation: [
      (box.min[0] + box.max[0]) / 2,
      (box.min[1] + box.max[1]) / 2,
      (box.min[2] + box.max[2]) / 2,
    ],
    extras: {
      size: [
        box.max[0] - box.min[0],
        box.max[1] - box.min[1],
        box.max[2] - box.min[2],
      ],
    },
  };
}

function doorNode(writer: GltfWriter, door: SceneDoor): number {
  const alongX = door.axis === 'x';
  const sx = alongX ? door.width : DOOR_THICKNESS;
  const sz = alongX ? DOOR_THICKNESS : door.width;
  // 门扇以关闭姿态导出；合页在 pivot 原点，门扇沿 axis 正方向延伸。
  const leaf = writer.addNode({
    name: `${door.id}_leaf`,
    mesh: writer.boxMesh('door', sx, door.height, sz),
    translation: alongX ? [0, 0, -DOOR_THICKNESS / 2] : [-DOOR_THICKNESS / 2, 0, 0],
  });
  const center: Vec3Tuple = alongX
    ? [door.width / 2, 1.4, 0]
    : [0, 1.4, door.width / 2];
  const anchor = writer.addNode({ name: `${door.id}_anchor`, translation: center });
  return writer.addNode({
    name: door.id,
    translation: [...door.hinge],
    children: [leaf, anchor],
    extras: {
      label: door.name,
      axis: door.axis,
      width: door.width,
      height: door.height,
      swing: door.swing,
      startsOpen: door.startsOpen,
      sealed: door.sealed,
    },
  });
}

function lightNode(writer: GltfWriter, light: SceneLight): number {
  writer.lights.push({
    type: 'point',
    color: [...light.color],
    intensity: light.intensity,
    range: light.range,
    name: light.id,
  });
  return writer.addNode({
    name: light.id,
    translation: [...light.position],
    extensions: { KHR_lights_punctual: { light: writer.lights.length - 1 } },
  });
}

/** 与 SceneManager 中的月光保持同一方向与颜色。 */
function moonLightNode(writer: GltfWriter): number {
  writer.lights.push({
    type: 'directional',
    color: [0.4, 0.46, 0.62],
    intensity: 0.45,
    name: 'LIGHT_moon',
  });
  // PlayCanvas 的方向光朝局部 −Y，glTF 朝局部 −Z：补一个绕 X 轴 −90° 的旋转保持世界方向一致。
  const rotation = multiplyQuaternion(
    quaternionFromEuler(-55, 25, 0),
    quaternionFromEuler(-90, 0, 0),
  );
  return writer.addNode({
    name: 'LIGHT_moon',
    rotation,
    extensions: { KHR_lights_punctual: { light: writer.lights.length - 1 } },
  });
}

function group(writer: GltfWriter, name: string, children: number[]): number {
  return writer.addNode({ name, children });
}

function pad4(bytes: Uint8Array, fill: number): Uint8Array {
  const remainder = bytes.byteLength % 4;
  if (remainder === 0) {
    return bytes;
  }
  const out = new Uint8Array(bytes.byteLength + (4 - remainder));
  out.fill(fill);
  out.set(bytes);
  return out;
}

export function buildVillaGlb(
  scene: SceneDefinition,
  loadTexture: (url: string) => Uint8Array,
): Uint8Array {
  const writer = new GltfWriter(loadTexture);

  const geometry: number[] = [];
  const collision: number[] = [];
  for (const box of scene.boxes) {
    if (box.visible) {
      geometry.push(boxNode(writer, box));
    } else {
      collision.push(writer.addNode(collisionNode(box)));
    }
  }

  const doors = scene.doors.map((door) => doorNode(writer, door));

  const interactables = scene.interactables.map((item) =>
    writer.addNode({
      name: item.id,
      translation: [...item.position],
      extras: { radius: item.radius, prompt: item.prompt },
    }),
  );

  const npcSpots = scene.npcSpots.map((spot) =>
    writer.addNode({
      name: spot.id,
      translation: [...spot.position],
      extras: {
        npcId: spot.npcId,
        label: spot.label,
        ...(spot.pending ? { pending: spot.pending } : {}),
      },
    }),
  );

  const spawns = scene.spawns.map((spawn) => {
    const half = (spawn.yaw * Math.PI) / 360;
    return writer.addNode({
      name: spawn.id,
      translation: [...spawn.position],
      rotation: [0, Math.sin(half), 0, Math.cos(half)],
      extras: { yawDegrees: spawn.yaw },
    });
  });

  const lights = [...scene.lights.map((light) => lightNode(writer, light)), moonLightNode(writer)];

  const root = writer.addNode({
    name: scene.id,
    children: [
      group(writer, 'GEO', geometry),
      group(writer, 'DOORS', doors),
      group(writer, 'INT', interactables),
      group(writer, 'NPC', npcSpots),
      group(writer, 'SPAWN', spawns),
      group(writer, 'LIGHT', lights),
      group(writer, 'COL', collision),
    ],
    // 区域与可行走面不是几何体，放在根节点 extras 里供 Blender 阶段参考。
    extras: { regions: scene.regions, walkSurfaces: scene.surfaces },
  });

  const bin = writer.binary.finish();
  const json: Json = {
    asset: {
      version: '2.0',
      generator: 'midnight-villa scripts/exportVillaGlb.ts',
    },
    extensionsUsed: ['KHR_lights_punctual'],
    extensions: { KHR_lights_punctual: { lights: writer.lights } },
    scene: 0,
    scenes: [{ name: scene.id, nodes: [root] }],
    nodes: writer.nodes,
    meshes: writer.meshes,
    materials: writer.materials,
    textures: writer.textures,
    images: writer.images,
    samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }],
    accessors: writer.accessors,
    bufferViews: writer.bufferViews,
    buffers: [{ byteLength: bin.byteLength }],
  };

  const jsonBytes = pad4(new TextEncoder().encode(JSON.stringify(json)), 0x20);
  const total = 12 + 8 + jsonBytes.byteLength + 8 + bin.byteLength;
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint32(0, GLB_MAGIC, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, total, true);
  view.setUint32(12, jsonBytes.byteLength, true);
  view.setUint32(16, CHUNK_JSON, true);
  out.set(jsonBytes, 20);
  const binHeader = 20 + jsonBytes.byteLength;
  view.setUint32(binHeader, bin.byteLength, true);
  view.setUint32(binHeader + 4, CHUNK_BIN, true);
  out.set(bin, binHeader + 8);
  return out;
}
