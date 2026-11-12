import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as pc from 'playcanvas';
import { villaGreybox } from '../src/content/scenes/villaGreybox.ts';
import {
  loadCharacterContainer,
  loadSceneModel,
  MARKER_GROUPS,
  stripMarkerGroups,
  type AssetHost,
  type ContainerLikeResource,
} from '../src/game/scene/SceneModelLoader.ts';

interface FakeHostState {
  host: AssetHost;
  added: pc.Asset[];
  loaded: pc.Asset[];
  removed: pc.Asset[];
}

function createFakeHost(onLoadCall?: (asset: pc.Asset) => void): FakeHostState {
  const added: pc.Asset[] = [];
  const loaded: pc.Asset[] = [];
  const removed: pc.Asset[] = [];

  const host: AssetHost = {
    assets: {
      add(asset: pc.Asset): void {
        added.push(asset);
      },
      load(asset: pc.Asset): void {
        loaded.push(asset);
        onLoadCall?.(asset);
      },
      remove(asset: pc.Asset): boolean {
        removed.push(asset);
        return true;
      },
    },
  };

  return { host, added, loaded, removed };
}

function buildMockGlbHierarchy(): pc.Entity {
  const root = new pc.Entity('villa_greybox');
  const geo = new pc.Entity('GEO');
  geo.addChild(new pc.Entity('floor_house'));
  root.addChild(geo);

  const doorsGroup = new pc.Entity('DOORS');
  for (const door of villaGreybox.doors) {
    const doorPivot = new pc.Entity(door.id);
    doorPivot.addChild(new pc.Entity(`${door.id}_leaf`));
    doorPivot.addChild(new pc.Entity(`${door.id}_anchor`));
    doorsGroup.addChild(doorPivot);
  }
  root.addChild(doorsGroup);

  for (const groupName of MARKER_GROUPS) {
    const group = new pc.Entity(groupName);
    group.addChild(new pc.Entity(`${groupName}_sample`));
    root.addChild(group);
  }

  return root;
}

test('SceneModelLoader：stripMarkerGroups 移除标记空物体组但保留 GEO 与 DOORS', () => {
  const root = buildMockGlbHierarchy();
  stripMarkerGroups(root);

  assert.ok(root.findByName('GEO'), '应保留 GEO 组');
  assert.ok(root.findByName('DOORS'), '应保留 DOORS 组');
  for (const marker of MARKER_GROUPS) {
    assert.equal(root.findByName(marker), null, `应移除 ${marker} 组`);
  }
});

test('SceneModelLoader：成功加载 GLB、查找门扇并在 dispose 时释放实体与全部子资源（幂等）', async () => {
  const subRender = new pc.Asset('sub_render', 'render');
  const subMaterial = new pc.Asset('sub_material', 'material');
  const subTexture = new pc.Asset('sub_texture', 'texture');
  const unloadedNames: string[] = [];

  const trackUnload = (asset: pc.Asset): void => {
    const originalUnload = asset.unload.bind(asset);
    asset.unload = (): void => {
      unloadedNames.push(asset.name);
      originalUnload();
    };
  };
  trackUnload(subRender);
  trackUnload(subMaterial);
  trackUnload(subTexture);

  let receivedOptions: { castShadows?: boolean; receiveShadows?: boolean } | undefined;

  const fakeState = createFakeHost((asset) => {
    trackUnload(asset);
    const resource: ContainerLikeResource = {
      renders: [subRender],
      materials: [subMaterial],
      textures: [subTexture],
      instantiateRenderEntity(options) {
        receivedOptions = options;
        return buildMockGlbHierarchy();
      },
    };
    asset.resource = resource;
    asset.fire('load', asset);
  });

  const controller = new AbortController();
  const url = villaGreybox.modelUrl ?? '/assets/scenes/scene_villa_full.glb';
  const model = await loadSceneModel(fakeState.host, url, controller.signal);

  assert.deepEqual(receivedOptions, {
    castShadows: false,
    receiveShadows: false,
  });
  assert.equal(fakeState.added.length, 1);
  assert.equal(fakeState.loaded.length, 1);

  for (const marker of MARKER_GROUPS) {
    assert.equal(model.root.findByName(marker), null);
  }

  for (const door of villaGreybox.doors) {
    const leaf = model.findDoorLeaf(door.id);
    assert.ok(leaf, `应找到 ${door.id}_leaf`);
    assert.equal(leaf.name, `${door.id}_leaf`);
  }
  assert.equal(model.findDoorLeaf('DOOR_nonexistent'), null);

  let rootDestroyed = false;
  model.root.once('destroy', () => {
    rootDestroyed = true;
  });

  model.dispose();
  assert.equal(rootDestroyed, true, 'dispose 应销毁根实体');
  assert.equal(
    fakeState.removed.length,
    4,
    'dispose 应从 AssetRegistry 移除容器资源与 3 个子资源',
  );
  assert.deepEqual(unloadedNames, [
    'sub_render',
    'sub_material',
    'sub_texture',
    url,
  ]);

  // 重复调用 dispose 应保持幂等，不重复卸载
  model.dispose();
  assert.equal(fakeState.removed.length, 4);
  assert.equal(unloadedNames.length, 4);
});

test('SceneModelLoader：加载失败时卸载资源并 reject', async () => {
  let unloaded = 0;
  const fakeState = createFakeHost((asset) => {
    asset.unload = (): void => {
      unloaded += 1;
    };
    asset.fire('error', '404 Not Found');
  });

  const controller = new AbortController();
  await assert.rejects(
    loadSceneModel(fakeState.host, '/missing.glb', controller.signal),
    /场景模型加载失败/,
  );
  assert.equal(fakeState.removed.length, 1);
  assert.equal(unloaded, 1);
});

test('SceneModelLoader：已经在取消状态的信号直接 reject 且不发起加载', async () => {
  const fakeState = createFakeHost();
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    loadSceneModel(fakeState.host, '/scene.glb', controller.signal),
    /场景模型加载已取消/,
  );
  assert.equal(fakeState.added.length, 0);
  assert.equal(fakeState.loaded.length, 0);
});

test('SceneModelLoader：加载途中被取消时释放资源并忽略后续 load 事件', async () => {
  let pendingAsset: pc.Asset | null = null;
  let unloaded = 0;
  const fakeState = createFakeHost((asset) => {
    asset.unload = (): void => {
      unloaded += 1;
    };
    pendingAsset = asset;
  });

  const controller = new AbortController();
  const promise = loadSceneModel(fakeState.host, '/slow.glb', controller.signal);
  controller.abort();

  await assert.rejects(promise, /场景模型加载已取消/);
  assert.equal(fakeState.removed.length, 1);
  assert.equal(unloaded, 1);

  // 即使底层加载器晚一步触发 load，也不应再次处理或抛错
  assert.ok(pendingAsset);
  (pendingAsset as pc.Asset).fire('load', pendingAsset);
  assert.equal(fakeState.removed.length, 1);
});

test('CharacterModelLoader：成功加载容器、多次实例化实体并剔除标记节点，并在 dispose 时释放资源', async () => {
  const subRender = new pc.Asset('npc_render', 'render');
  const subMaterial = new pc.Asset('npc_material', 'material');
  const unloadedNames: string[] = [];

  const trackUnload = (asset: pc.Asset): void => {
    const originalUnload = asset.unload.bind(asset);
    asset.unload = (): void => {
      unloadedNames.push(asset.name);
      originalUnload();
    };
  };
  trackUnload(subRender);
  trackUnload(subMaterial);

  let instanceCount = 0;
  const fakeState = createFakeHost((asset) => {
    trackUnload(asset);
    const resource: ContainerLikeResource = {
      renders: [subRender],
      materials: [subMaterial],
      instantiateRenderEntity() {
        instanceCount += 1;
        return buildMockGlbHierarchy();
      },
    };
    asset.resource = resource;
    asset.fire('load', asset);
  });

  const controller = new AbortController();
  const url = '/assets/models/characters/SK_NPC_Arthur_01.glb';
  const container = await loadCharacterContainer(fakeState.host, url, controller.signal);

  assert.equal(fakeState.added.length, 1);
  assert.equal(fakeState.loaded.length, 1);

  // 支持针对同一角色的多个站位分别实例化
  const inst1 = container.instantiate();
  const inst2 = container.instantiate();
  assert.equal(instanceCount, 2);

  for (const marker of MARKER_GROUPS) {
    assert.equal(inst1.findByName(marker), null);
    assert.equal(inst2.findByName(marker), null);
  }

  inst1.destroy();
  inst2.destroy();

  container.dispose();
  assert.equal(fakeState.removed.length, 3);
  assert.deepEqual(unloadedNames, ['npc_render', 'npc_material', url]);

  // 重复调用 dispose 保持幂等
  container.dispose();
  assert.equal(fakeState.removed.length, 3);

  // 释放后再次 instantiate 应抛错
  assert.throws(() => container.instantiate(), /角色模型容器已被释放/);
});

test('CharacterModelLoader：加载失败时清理并 reject', async () => {
  let unloaded = 0;
  const fakeState = createFakeHost((asset) => {
    asset.unload = (): void => {
      unloaded += 1;
    };
    asset.fire('error', '404 Not Found');
  });

  const controller = new AbortController();
  await assert.rejects(
    loadCharacterContainer(fakeState.host, '/missing_npc.glb', controller.signal),
    /角色模型加载失败/,
  );
  assert.equal(fakeState.removed.length, 1);
  assert.equal(unloaded, 1);
});

