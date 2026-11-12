import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import { characterArchive } from '../src/content/characters.ts';
import { buildVillaGlb } from '../scripts/villaGlb.ts';

// 导出脚本的验收：GLB 结构自洽，且节点与场景数据一一对应。

interface GltfNode {
  name: string;
  mesh?: number;
  translation?: number[];
  children?: number[];
}

interface GltfAccessor {
  bufferView: number;
  componentType: number;
  count: number;
  type: string;
  min?: number[];
  max?: number[];
}

interface GltfJson {
  nodes: GltfNode[];
  meshes: { primitives: { attributes: Record<string, number>; indices: number; material: number }[] }[];
  materials: { name: string }[];
  textures: { source: number }[];
  images: { bufferView: number }[];
  accessors: GltfAccessor[];
  bufferViews: { byteOffset: number; byteLength: number }[];
  buffers: { byteLength: number }[];
  skins?: { joints: number[] }[];
  animations?: { name?: string; channels: unknown[] }[];
}

const FAKE_PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);

function parseGlb(glb: Uint8Array): { json: GltfJson; bin: Uint8Array } {
  const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
  assert.equal(view.getUint32(0, true), 0x46546c67, '不是 glTF 魔数');
  assert.equal(view.getUint32(4, true), 2);
  assert.equal(view.getUint32(8, true), glb.byteLength, '总长度不符');

  const jsonLength = view.getUint32(12, true);
  assert.equal(view.getUint32(16, true), 0x4e4f534a);
  assert.equal(jsonLength % 4, 0);
  const json = JSON.parse(
    new TextDecoder().decode(glb.subarray(20, 20 + jsonLength)),
  ) as GltfJson;

  const binHeader = 20 + jsonLength;
  const binLength = view.getUint32(binHeader, true);
  assert.equal(view.getUint32(binHeader + 4, true), 0x004e4942);
  assert.equal(binLength % 4, 0);
  assert.equal(binHeader + 8 + binLength, glb.byteLength);
  const bin = glb.subarray(binHeader + 8, binHeader + 8 + binLength);
  assert.equal(json.buffers[0]?.byteLength, binLength);
  return { json, bin };
}

function readFloats(json: GltfJson, bin: Uint8Array, accessorIndex: number): Float32Array {
  const accessor = json.accessors[accessorIndex];
  assert.ok(accessor, `缺少 accessor ${accessorIndex}`);
  const view = json.bufferViews[accessor.bufferView];
  assert.ok(view);
  const copy = bin.slice(view.byteOffset, view.byteOffset + view.byteLength);
  return new Float32Array(copy.buffer);
}

function readIndices(json: GltfJson, bin: Uint8Array, accessorIndex: number): Uint16Array {
  const accessor = json.accessors[accessorIndex];
  assert.ok(accessor);
  const view = json.bufferViews[accessor.bufferView];
  assert.ok(view);
  const copy = bin.slice(view.byteOffset, view.byteOffset + view.byteLength);
  return new Uint16Array(copy.buffer);
}

const glb = buildVillaGlb(villaGreybox, () => FAKE_PNG);
const { json, bin } = parseGlb(glb);
const nodeByName = new Map(json.nodes.map((node) => [node.name, node]));

test('GLB：文件头、分块与缓冲区长度自洽', () => {
  assert.ok(json.nodes.length > 0);
  for (const view of json.bufferViews) {
    assert.ok(view.byteOffset % 4 === 0, 'bufferView 未 4 字节对齐');
    assert.ok(view.byteOffset + view.byteLength <= bin.byteLength, 'bufferView 越界');
  }
});

test('GLB：节点名唯一，场景数据中的每个摆放点都有同名节点和正确位置', () => {
  assert.equal(nodeByName.size, json.nodes.length, '节点重名');

  const expectPosition = (id: string, position: readonly number[]): void => {
    const node = nodeByName.get(id);
    assert.ok(node, `缺少节点 ${id}`);
    assert.deepEqual(node.translation, [...position], `${id} 位置不符`);
  };
  for (const item of villaGreybox.interactables) expectPosition(item.id, item.position);
  for (const spot of villaGreybox.npcSpots) expectPosition(spot.id, spot.position);
  for (const light of villaGreybox.lights) expectPosition(light.id, light.position);
  for (const spawn of villaGreybox.spawns) expectPosition(spawn.id, spawn.position);
  for (const door of villaGreybox.doors) {
    expectPosition(door.id, door.hinge);
    assert.ok(nodeByName.has(`${door.id}_leaf`), `${door.id} 缺少门扇`);
    assert.ok(nodeByName.has(`${door.id}_anchor`), `${door.id} 缺少交互锚点`);
  }
});

test('GLB：可见方盒导出为网格，不可见边界盒导出为 COL_ 空物体', () => {
  for (const box of villaGreybox.boxes) {
    if (box.visible) {
      const node = nodeByName.get(box.id);
      assert.ok(node, `缺少方盒 ${box.id}`);
      assert.ok(node.mesh !== undefined, `${box.id} 没有网格`);
      assert.deepEqual(node.translation, [...box.min]);
    } else {
      const node = nodeByName.get(`COL_${box.id}`);
      assert.ok(node, `缺少碰撞空物体 COL_${box.id}`);
      assert.equal(node.mesh, undefined);
    }
  }
});

test('GLB：网格几何有效——包围盒、索引范围与三角形朝向', () => {
  for (const mesh of json.meshes) {
    for (const primitive of mesh.primitives) {
      const positions = readFloats(json, bin, primitive.attributes.POSITION ?? -1);
      const normals = readFloats(json, bin, primitive.attributes.NORMAL ?? -1);
      const indices = readIndices(json, bin, primitive.indices);
      const accessor = json.accessors[primitive.attributes.POSITION ?? -1];
      assert.ok(accessor?.min && accessor.max);

      for (let axis = 0; axis < 3; axis += 1) {
        let low = Infinity;
        let high = -Infinity;
        for (let i = axis; i < positions.length; i += 3) {
          low = Math.min(low, positions[i] ?? 0);
          high = Math.max(high, positions[i] ?? 0);
        }
        assert.ok(Math.abs(low - (accessor.min[axis] ?? NaN)) < 1e-5, 'min 与数据不符');
        assert.ok(Math.abs(high - (accessor.max[axis] ?? NaN)) < 1e-5, 'max 与数据不符');
      }

      for (let t = 0; t < indices.length; t += 3) {
        const a = indices[t] ?? 0;
        const b = indices[t + 1] ?? 0;
        const c = indices[t + 2] ?? 0;
        assert.ok(Math.max(a, b, c) < positions.length / 3, '索引越界');
        const p = (i: number, k: number): number => positions[i * 3 + k] ?? 0;
        const e1 = [p(b, 0) - p(a, 0), p(b, 1) - p(a, 1), p(b, 2) - p(a, 2)];
        const e2 = [p(c, 0) - p(a, 0), p(c, 1) - p(a, 1), p(c, 2) - p(a, 2)];
        const cross = [
          (e1[1] ?? 0) * (e2[2] ?? 0) - (e1[2] ?? 0) * (e2[1] ?? 0),
          (e1[2] ?? 0) * (e2[0] ?? 0) - (e1[0] ?? 0) * (e2[2] ?? 0),
          (e1[0] ?? 0) * (e2[1] ?? 0) - (e1[1] ?? 0) * (e2[0] ?? 0),
        ];
        const facing =
          (cross[0] ?? 0) * (normals[a * 3] ?? 0) +
          (cross[1] ?? 0) * (normals[a * 3 + 1] ?? 0) +
          (cross[2] ?? 0) * (normals[a * 3 + 2] ?? 0);
        assert.ok(facing > 0, '三角形绕序与法线相反（会被背面剔除）');
      }
    }
  }
});

test('GLB：材质、贴图与图片引用都有效', () => {
  for (const mesh of json.meshes) {
    for (const primitive of mesh.primitives) {
      assert.ok(json.materials[primitive.material], '网格引用了不存在的材质');
    }
  }
  for (const texture of json.textures) {
    const image = json.images[texture.source];
    assert.ok(image, '贴图引用了不存在的图片');
    assert.ok(json.bufferViews[image.bufferView], '图片没有数据');
  }
});

test('GLB：同材质同尺寸的方盒共用网格', () => {
  const meshUsers = new Map<number, number>();
  for (const node of json.nodes) {
    if (node.mesh !== undefined) {
      meshUsers.set(node.mesh, (meshUsers.get(node.mesh) ?? 0) + 1);
    }
  }
  const meshNodeCount = [...meshUsers.values()].reduce((sum, count) => sum + count, 0);
  assert.ok(json.meshes.length < meshNodeCount, '没有发生网格复用');
});

test('Blender 导出的 scene_villa_full.glb：节点齐全、门扇位置准确且精模面数在预算内', () => {
  const fileBytes = readFileSync(
    resolve('public/assets/scenes/scene_villa_full.glb'),
  );
  const exported = parseGlb(
    new Uint8Array(fileBytes.buffer, fileBytes.byteOffset, fileBytes.byteLength),
  );
  const exportedNodes = new Map(
    exported.json.nodes.map((node) => [node.name, node]),
  );

  for (const door of villaGreybox.doors) {
    const pivot = exportedNodes.get(door.id);
    assert.ok(pivot, `scene_villa_full.glb 缺少门节点 ${door.id}`);
    assert.ok(
      exportedNodes.has(`${door.id}_leaf`),
      `scene_villa_full.glb 缺少门扇 ${door.id}_leaf`,
    );
    assert.ok(
      exportedNodes.has(`${door.id}_anchor`),
      `scene_villa_full.glb 缺少门交互锚点 ${door.id}_anchor`,
    );
    const t = pivot.translation ?? [0, 0, 0];
    for (let k = 0; k < 3; k += 1) {
      assert.ok(
        Math.abs((t[k] ?? 0) - (door.hinge[k] ?? 0)) < 1e-3,
        `${door.id} 合页位置偏移`,
      );
    }
  }

  for (const box of villaGreybox.boxes) {
    if (box.visible) {
      const node = exportedNodes.get(box.id);
      assert.ok(node, `scene_villa_full.glb 缺少可见物体 ${box.id}`);
      assert.ok(node.mesh !== undefined, `${box.id} 缺少网格引用`);
    } else {
      assert.ok(
        exportedNodes.has(`COL_${box.id}`),
        `scene_villa_full.glb 缺少碰撞标记 COL_${box.id}`,
      );
    }
  }

  let totalTriangles = 0;
  for (const mesh of exported.json.meshes) {
    for (const primitive of mesh.primitives) {
      const idxAccessor = exported.json.accessors[primitive.indices];
      assert.ok(idxAccessor, '缺少索引 accessor');
      totalTriangles += Math.floor(idxAccessor.count / 3);
    }
  }
  // 精模三角面应显著高于纯方盒版本（>10000），同时远低于 §4.5 的 30 万面预算上限
  assert.ok(
    totalTriangles > 10000 && totalTriangles < 300000,
    `精模三角面数异常：${totalTriangles}`,
  );
});

test('导出的 NPC 角色 GLB：文件齐全、身高符合设定且面数与贴图在预算内', () => {
  const urls = villaGreybox.characterModelUrls;
  assert.ok(urls, 'villaGreybox 缺少 characterModelUrls');

  for (const entry of characterArchive) {
    const modelUrl = urls[entry.id];
    assert.ok(modelUrl, `缺少角色 ${entry.id} 的 GLB 映射`);
    const filePath = resolve('public', modelUrl.replace(/^\/+/, ''));
    const fileBytes = readFileSync(filePath);
    const exported = parseGlb(
      new Uint8Array(fileBytes.buffer, fileBytes.byteOffset, fileBytes.byteLength),
    );

    assert.ok(exported.json.meshes.length > 0, `${modelUrl} 缺少网格`);
    assert.ok(exported.json.materials.length > 0, `${modelUrl} 缺少材质`);
    assert.ok(exported.json.images.length > 0, `${modelUrl} 缺少贴图`);

    // 绑定骨骼与两段动作是 NPC 有呼吸和说话动作的前提。
    assert.equal(exported.json.skins?.length, 1, `${modelUrl} 缺少蒙皮`);
    assert.equal(exported.json.skins?.[0]?.joints.length, 17, `${modelUrl} 骨骼数不符`);
    for (const mesh of exported.json.meshes) {
      for (const primitive of mesh.primitives) {
        assert.ok(
          primitive.attributes.JOINTS_0 !== undefined &&
            primitive.attributes.WEIGHTS_0 !== undefined,
          `${modelUrl} 的网格缺少蒙皮权重`,
        );
      }
    }
    const animationNames = (exported.json.animations ?? [])
      .map((animation) => animation.name)
      .sort();
    assert.deepEqual(animationNames, ['Idle', 'Talk'], `${modelUrl} 动作不齐`);
    for (const animation of exported.json.animations ?? []) {
      assert.ok(animation.channels.length >= 17 * 3, `${modelUrl} 动作通道不足`);
    }

    let minY = Infinity;
    let maxY = -Infinity;
    let totalTriangles = 0;
    for (const mesh of exported.json.meshes) {
      for (const primitive of mesh.primitives) {
        const posAccessor =
          exported.json.accessors[primitive.attributes.POSITION ?? -1];
        assert.ok(posAccessor?.min && posAccessor.max, `${modelUrl} 缺少包围盒`);
        minY = Math.min(minY, posAccessor.min[1] ?? Infinity);
        maxY = Math.max(maxY, posAccessor.max[1] ?? -Infinity);

        const idxAccessor = exported.json.accessors[primitive.indices];
        assert.ok(idxAccessor, `${modelUrl} 缺少索引 accessor`);
        totalTriangles += Math.floor(idxAccessor.count / 3);
      }
    }

    const height = maxY - minY;
    assert.ok(
      Math.abs(minY) < 0.02,
      `${modelUrl} 脚底未落地（minY=${minY.toFixed(4)}）`,
    );
    assert.ok(
      Math.abs(height - entry.heightM) < 0.02,
      `${modelUrl} 身高 ${height.toFixed(3)}m 与设定 ${entry.heightM}m 不符`,
    );
    assert.ok(
      totalTriangles > 5000 && totalTriangles <= 50000,
      `${modelUrl} 三角面数超出游戏预算：${totalTriangles}`,
    );
  }
});
