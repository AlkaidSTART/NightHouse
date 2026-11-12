import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as pc from 'playcanvas';
import { PlayerHands } from '../src/game/player/PlayerHands.ts';
import type { AssetHost, ContainerLikeResource } from '../src/game/scene/SceneModelLoader.ts';

function buildMockHandsHierarchy(): pc.Entity {
  const root = new pc.Entity('PlayerHandsRig');
  const boneNames = [
    'forearm_L',
    'hand_L',
    'forearm_R',
    'hand_R',
    'thumb_01_R',
    'index_01_L',
    'index_01_R',
    'index_02_R',
    'middle_01_L',
    'middle_01_R',
    'middle_02_R',
    'ring_01_L',
    'ring_01_R',
    'ring_02_R',
    'pinky_01_L',
    'pinky_01_R',
    'pinky_02_R',
  ];
  for (const name of boneNames) {
    const bone = new pc.Entity(name);
    bone.setLocalPosition(0.1, 0.2, 0.3);
    root.addChild(bone);
  }
  return root;
}

test('PlayerHands 加载骨骼并在交互时驱动右手微动与释放资源', async () => {
  const removed: pc.Asset[] = [];
  let loadedAsset: pc.Asset | null = null;
  const mockRoot = buildMockHandsHierarchy();

  const host: AssetHost = {
    assets: {
      add(): void {},
      load(asset: pc.Asset): void {
        loadedAsset = asset;
        const fakeResource: ContainerLikeResource = {
          instantiateRenderEntity: () => mockRoot,
        };
        asset.resource = fakeResource;
        asset.fire('load', asset);
      },
      remove(asset: pc.Asset): boolean {
        removed.push(asset);
        return true;
      },
    },
  };

  const camera = new pc.Entity('camera');
  const hands = new PlayerHands(host, camera, '/assets/models/characters/sk_player_hands.glb');

  // 等待微任务 load() 完成
  await new Promise((resolve) => setTimeout(resolve, 10));

  assert.equal(camera.children.includes(mockRoot), true);
  const forearmR = mockRoot.findByName('forearm_R') as pc.Entity;
  const indexR = mockRoot.findByName('index_01_R') as pc.Entity;

  // 静息偏移：收拢肩距、稍向前、稍向下（父空间 X 右 / Y 前 / Z 上）
  const relaxed = forearmR.getLocalPosition();
  assert.ok(Math.abs(relaxed.x - 0.07) < 1e-6, `肩距应向内收拢，x=${relaxed.x}`);
  assert.ok(Math.abs(relaxed.y - 0.23) < 1e-6, `应稍微前移，y=${relaxed.y}`);
  assert.ok(Math.abs(relaxed.z - 0.25) < 1e-6, `应稍微下移，z=${relaxed.z}`);

  // 手指静息时保持向掌心弯曲（局部 X 负向）
  const baseCurl = indexR.getLocalRotation().x;
  assert.ok(baseCurl < 0, `静息手指应轻微弯曲，x=${baseCurl}`);

  const restY = relaxed.y;
  hands.update(0.016);
  hands.triggerInteract();
  hands.update(0.15);

  const interactY = forearmR.getLocalPosition().y;
  assert.ok(interactY > restY, `交互时右手应沿局部 +Y（世界前方）探出，restY=${restY}, interactY=${interactY}`);
  assert.ok(
    indexR.getLocalRotation().x < baseCurl,
    '交互时手指应进一步向掌心弯曲',
  );

  hands.dispose();
  assert.ok(loadedAsset !== null);
  assert.equal(removed.includes(loadedAsset), true);
  assert.equal(camera.children.includes(mockRoot), false);
});
