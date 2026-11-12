import * as pc from 'playcanvas';
import { MATERIALS, TEXTURE_SETS, type MaterialSpec } from '../../content/scenes/sceneMaterials.ts';
import type { Vec3Tuple } from '../../shared/types/save';
import type {
  SceneDefinition,
  SceneDoor,
  SceneMaterialId,
  SceneNpcSpot,
} from '../../shared/types/scene';
import {
  loadCharacterContainer,
  loadSceneModel,
  type CharacterContainer,
  type SceneModel,
} from './SceneModelLoader.ts';
import { DOOR_THICKNESS, doorCenter } from './sceneGeometry.ts';
import {
  advanceDoorSwing,
  createDoorSwingState,
  retargetDoorSwing,
  type DoorSwingState,
} from './doorSwing.ts';

export interface SceneInteractableHandle {
  id: string;
  entity: pc.Entity;
  radius: number;
  prompt: string;
  message: string;
  kind: 'prop' | 'npc';
  npcId?: SceneNpcSpot['npcId'];
}

export interface SceneDoorHandle {
  door: SceneDoor;
  /** 位于门扇中心的交互锚点，不随门扇转动。 */
  anchor: pc.Entity;
}

export interface BuiltScene {
  sceneId: string;
  interactables: SceneInteractableHandle[];
  doors: SceneDoorHandle[];
}

interface DoorEntry {
  pivot: pc.Entity;
  /** 当前显示的门扇：先是代码生成的方盒，GLB 就绪后换成 GLB 里的门扇。 */
  leaf: pc.Entity;
  swing: number;
  motion: DoorSwingState;
}

interface NpcSpotHandle {
  spot: SceneNpcSpot;
  root: pc.Entity;
  placeholder: pc.Entity;
  characterInstance: pc.Entity | null;
}

const NPC_MATERIAL: Record<SceneNpcSpot['npcId'], SceneMaterialId> = {
  npc_arthur: 'npcArthur',
  npc_housekeeper: 'npcHousekeeper',
  npc_doctor: 'npcDoctor',
};

const NPC_NAME: Record<SceneNpcSpot['npcId'], string> = {
  npc_arthur: '亚瑟',
  npc_housekeeper: '霍尔太太',
  npc_doctor: '格雷医生',
};

const NPC_PLACEHOLDER_HEIGHT = 1.75;
const DOOR_ANCHOR_HEIGHT = 1.4;
const UNIT_BOX_KEY = 'unit_box';

/**
 * 把内容层的场景定义搭成 PlayCanvas 实体，并负责释放。
 *
 * 先用代码生成的方盒立即搭出可玩的场景；`loadModel` 加载 GLB 成功后再整体换成 GLB 的几何，
 * 失败则保留方盒。交互点、站位、灯光、碰撞始终来自内容数据，不依赖 GLB。
 */
export class SceneManager {
  private readonly app: pc.Application;
  private readonly entities: pc.Entity[] = [];
  /** 代码生成的场景几何（不含 NPC 站位占位），GLB 接管时整体移除。 */
  private readonly proceduralVisuals: pc.Entity[] = [];
  private readonly materials = new Map<SceneMaterialId, pc.StandardMaterial>();
  private readonly meshes = new Map<string, pc.Mesh>();
  private readonly textures = new Map<string, pc.Texture>();
  private readonly pendingTextureCallbacks = new Map<
    string,
    Array<(texture: pc.Texture) => void>
  >();
  private readonly doorPivots = new Map<string, DoorEntry>();
  private readonly npcSpotHandles = new Map<string, NpcSpotHandle>();
  private readonly characterContainers = new Map<string, CharacterContainer>();
  private readonly loadAbort = new AbortController();
  private readonly characterLoadAbort = new AbortController();
  private model: SceneModel | null = null;
  private proceduralReleased = false;
  private destroyed = false;

  constructor(app: pc.Application) {
    this.app = app;
  }

  build(scene: SceneDefinition): BuiltScene {
    for (const box of scene.boxes) {
      if (box.visible) {
        this.proceduralVisuals.push(
          this.createBox(box.id, box.min, box.max, box.material),
        );
      }
    }

    for (const light of scene.lights) {
      const entity = this.track(new pc.Entity(light.id));
      entity.addComponent('light', {
        type: 'omni',
        color: new pc.Color(light.color[0], light.color[1], light.color[2]),
        intensity: light.intensity,
        range: light.range,
        castShadows: false,
      });
      entity.setPosition(light.position[0], light.position[1], light.position[2]);
    }

    // 冷蓝月光：室外与窗边的基调，不投影。
    const moon = this.track(new pc.Entity('LIGHT_moon'));
    moon.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.4, 0.46, 0.62),
      intensity: 0.6,
      castShadows: false,
    });
    moon.setEulerAngles(-55, 25, 0);

    const interactables: SceneInteractableHandle[] = [];
    for (const item of scene.interactables) {
      const entity = this.track(new pc.Entity(item.id));
      entity.setPosition(item.position[0], item.position[1], item.position[2]);
      interactables.push({
        id: item.id,
        entity,
        radius: item.radius,
        prompt: item.prompt,
        message: item.message,
        kind: 'prop',
      });
    }

    for (const spot of scene.npcSpots) {
      interactables.push(this.createNpcSpot(spot));
    }

    const doors = scene.doors.map((door) => this.createDoor(door));

    return { sceneId: scene.id, interactables, doors };
  }

  /**
   * 加载场景 GLB 并替换代码生成的几何。
   * reject 时场景保持原样（方盒版本），调用方只需要决定是否提示玩家。
   * 门扇不齐全时整体放弃，不做「一半 GLB 一半方盒」的混合状态。
   */
  async loadModel(url: string): Promise<void> {
    if (this.destroyed || this.model) {
      return;
    }
    const model = await loadSceneModel(this.app, url, this.loadAbort.signal);
    if (this.destroyed) {
      model.dispose();
      return;
    }

    const leaves = new Map<string, pc.Entity>();
    for (const doorId of this.doorPivots.keys()) {
      const leaf = model.findDoorLeaf(doorId);
      if (!leaf) {
        model.dispose();
        throw new Error(`场景模型缺少门扇节点：${doorId}_leaf`);
      }
      leaves.set(doorId, leaf);
    }

    this.model = model;
    this.app.root.addChild(model.root);

    for (const entity of this.proceduralVisuals) {
      entity.destroy();
    }
    this.proceduralVisuals.length = 0;

    for (const [doorId, entry] of this.doorPivots) {
      const leaf = leaves.get(doorId);
      if (!leaf) {
        continue;
      }
      // 门扇保留 GLB 里的局部变换（合页在 pivot 原点），挂到已有的合页 pivot 上继续转动。
      entry.leaf.destroy();
      leaf.reparent(entry.pivot);
      entry.leaf = leaf;
    }

    this.releaseProceduralResources();
  }

  /**
   * 加载 NPC 角色模型并替换占位方盒。
   * 每个角色类型的 GLB 只加载一次容器资源，并在该角色的所有站位上分别实例化。
   * 角色模型在 Blender 中正面指向 +Z，挂载到 root 后绕 Y 轴转 180° 使其与向前的偏航角对齐。
   */
  async loadCharacterModels(
    urls: Partial<Record<SceneNpcSpot['npcId'], string>>,
  ): Promise<void> {
    if (this.destroyed) {
      return;
    }

    const uniqueRoles = new Set<SceneNpcSpot['npcId']>();
    for (const handle of this.npcSpotHandles.values()) {
      uniqueRoles.add(handle.spot.npcId);
    }

    const loadTasks: Promise<void>[] = [];
    for (const npcId of uniqueRoles) {
      const url = urls[npcId];
      if (!url) {
        continue;
      }
      loadTasks.push(
        (async () => {
          try {
            const container = await loadCharacterContainer(
              this.app,
              url,
              this.characterLoadAbort.signal,
            );
            if (this.destroyed) {
              container.dispose();
              return;
            }
            this.characterContainers.set(npcId, container);

            for (const handle of this.npcSpotHandles.values()) {
              if (handle.spot.npcId !== npcId || handle.characterInstance) {
                continue;
              }
              const instance = container.instantiate();
              instance.setLocalEulerAngles(0, 180, 0);
              instance.setLocalPosition(0, 0, 0);
              handle.root.addChild(instance);
              handle.characterInstance = instance;

              // 移除占位方盒
              handle.placeholder.destroy();
            }
          } catch (error) {
            console.warn(`NPC 模型加载失败 [${npcId} 挂载至 ${url}]：`, error);
          }
        })(),
      );
    }

    await Promise.allSettled(loadTasks);
  }

  setDoorOpen(doorId: string, open: boolean): void {
    const entry = this.doorPivots.get(doorId);
    if (!entry) {
      return;
    }
    retargetDoorSwing(entry.motion, open ? 90 * entry.swing : 0);
  }

  /** 推进门扇的开合动画。由游戏循环每帧调用。 */
  update(dt: number): void {
    for (const entry of this.doorPivots.values()) {
      const angle = advanceDoorSwing(entry.motion, dt);
      if (angle !== null) {
        entry.pivot.setLocalEulerAngles(0, angle, 0);
      }
    }
  }

  destroy(): void {
    this.destroyed = true;
    // 取消仍在进行的场景模型与角色模型加载
    this.loadAbort.abort();
    this.characterLoadAbort.abort();
    this.pendingTextureCallbacks.clear();

    for (const container of this.characterContainers.values()) {
      container.dispose();
    }
    this.characterContainers.clear();
    this.npcSpotHandles.clear();

    for (const entity of this.entities) {
      entity.destroy();
    }
    this.entities.length = 0;
    this.proceduralVisuals.length = 0;
    this.doorPivots.clear();

    // 先销毁实体再释放容器资源，避免渲染组件引用已销毁的网格。
    this.model?.dispose();
    this.model = null;

    for (const mesh of this.meshes.values()) {
      mesh.destroy();
    }
    this.meshes.clear();

    for (const material of this.materials.values()) {
      material.destroy();
    }
    this.materials.clear();

    for (const texture of this.textures.values()) {
      texture.destroy();
    }
    this.textures.clear();
  }

  /**
   * GLB 接管后，代码生成几何用到的网格、材质和贴图不再需要。
   * NPC 站位占位仍是代码生成的，保留它们的材质和共用的单位方盒网格。
   */
  private releaseProceduralResources(): void {
    this.proceduralReleased = true;
    this.pendingTextureCallbacks.clear();

    for (const [key, mesh] of this.meshes) {
      if (key !== UNIT_BOX_KEY) {
        mesh.destroy();
        this.meshes.delete(key);
      }
    }

    const npcMaterials = new Set<SceneMaterialId>(Object.values(NPC_MATERIAL));
    for (const [id, material] of this.materials) {
      if (!npcMaterials.has(id)) {
        material.destroy();
        this.materials.delete(id);
      }
    }

    for (const texture of this.textures.values()) {
      texture.destroy();
    }
    this.textures.clear();
  }

  private createNpcSpot(spot: SceneNpcSpot): SceneInteractableHandle {
    const [x, y, z] = spot.position;
    const root = this.track(new pc.Entity(spot.id));
    root.setPosition(x, y, z);
    if (spot.yaw !== undefined) {
      root.setEulerAngles(0, spot.yaw, 0);
    }

    // 默认创建方盒占位（作为 root 的子节点，位于脚底之上）
    const placeholder = this.track(new pc.Entity(`${spot.id}_placeholder`));
    const sx = 0.44;
    const sy = NPC_PLACEHOLDER_HEIGHT;
    const sz = 0.3;
    const mesh = this.getBoxMesh(
      sx,
      sy,
      sz,
      MATERIALS[NPC_MATERIAL[spot.npcId]].tileSize ?? 0,
    );
    placeholder.addComponent('render', {
      meshInstances: [
        new pc.MeshInstance(mesh, this.getMaterial(NPC_MATERIAL[spot.npcId])),
      ],
      castShadows: false,
      receiveShadows: false,
    });
    placeholder.setLocalPosition(0, NPC_PLACEHOLDER_HEIGHT / 2, 0);
    root.addChild(placeholder);

    // 交互对准锚点位于胸口高度（y + NPC_PLACEHOLDER_HEIGHT / 2），保持与灰盒射线对准判定一致
    const anchor = this.track(new pc.Entity(`${spot.id}_anchor`));
    anchor.setLocalPosition(0, NPC_PLACEHOLDER_HEIGHT / 2, 0);
    root.addChild(anchor);

    this.npcSpotHandles.set(spot.id, {
      spot,
      root,
      placeholder,
      characterInstance: null,
    });

    const name = NPC_NAME[spot.npcId];
    return {
      id: spot.id,
      entity: anchor,
      radius: 0.5,
      prompt: `交谈：${name}`,
      message: spot.pending
        ? `占位：${name}的站位。${spot.pending}。`
        : `占位：${name}的站位。`,
      kind: 'npc',
      npcId: spot.npcId,
    };
  }

  private createDoor(door: SceneDoor): SceneDoorHandle {
    const pivot = this.track(new pc.Entity(`${door.id}_pivot`));
    pivot.setPosition(door.hinge[0], door.hinge[1], door.hinge[2]);

    const sx = door.axis === 'x' ? door.width : DOOR_THICKNESS;
    const sz = door.axis === 'x' ? DOOR_THICKNESS : door.width;
    const mesh = this.getBoxMesh(sx, door.height, sz, MATERIALS.door.tileSize ?? 0);

    const leaf = new pc.Entity(`${door.id}_leaf`);
    leaf.addComponent('render', {
      type: 'asset',
      meshInstances: [new pc.MeshInstance(mesh, this.getMaterial('door'))],
    });
    if (door.axis === 'x') {
      leaf.setLocalPosition(door.width / 2, door.height / 2, 0);
      leaf.setLocalScale(door.width, door.height, DOOR_THICKNESS);
    } else {
      leaf.setLocalPosition(0, door.height / 2, door.width / 2);
      leaf.setLocalScale(DOOR_THICKNESS, door.height, door.width);
    }
    pivot.addChild(leaf);

    // 初始状态直接落位，避免载入场景时所有敞开的门一起从 0° 摆过去。
    const initialAngle = door.startsOpen && !door.sealed ? 90 * door.swing : 0;
    pivot.setLocalEulerAngles(0, initialAngle, 0);
    this.doorPivots.set(door.id, {
      pivot,
      leaf,
      swing: door.swing,
      motion: createDoorSwingState(initialAngle),
    });

    const anchor = this.track(new pc.Entity(`${door.id}_anchor`));
    const center = doorCenter(door);
    // 锚点放在视线高度而不是门扇几何中心，平视门时才能对准。
    anchor.setPosition(center[0], door.hinge[1] + DOOR_ANCHOR_HEIGHT, center[2]);

    return { door, anchor };
  }

  private createBox(
    name: string,
    min: Vec3Tuple,
    max: Vec3Tuple,
    materialId: SceneMaterialId,
  ): pc.Entity {
    const sx = max[0] - min[0];
    const sy = max[1] - min[1];
    const sz = max[2] - min[2];
    const tileSize = MATERIALS[materialId].tileSize ?? 0;
    const mesh = this.getBoxMesh(sx, sy, sz, tileSize);

    const entity = this.track(new pc.Entity(name));
    entity.addComponent('render', {
      type: 'asset',
      meshInstances: [new pc.MeshInstance(mesh, this.getMaterial(materialId))],
    });
    entity.setPosition(
      (min[0] + max[0]) / 2,
      (min[1] + max[1]) / 2,
      (min[2] + max[2]) / 2,
    );
    entity.setLocalScale(sx, sy, sz);
    return entity;
  }

  /**
   * 生成或复用带世界空间 UV 平铺与切线向量的单位盒网格。
   * 实体依然使用 setLocalScale(sx, sy, sz)，而各面的 UV 按物理尺寸 / tileSize 缩放，
   * 从而所有同材质物体可共用同一个 StandardMaterial 实例且不会出现拉伸。
   */
  private getBoxMesh(sx: number, sy: number, sz: number, tileSize: number): pc.Mesh {
    const key =
      tileSize > 0
        ? `${Math.round(sx * 50)}_${Math.round(sy * 50)}_${Math.round(sz * 50)}_${tileSize}`
        : UNIT_BOX_KEY;
    const cached = this.meshes.get(key);
    if (cached) {
      return cached;
    }

    const geometry = new pc.BoxGeometry();
    if (
      tileSize > 0 &&
      geometry.positions &&
      geometry.normals &&
      geometry.uvs &&
      geometry.indices
    ) {
      const uvs = Array.from(geometry.uvs);
      const vertexCount = geometry.positions.length / 3;
      for (let i = 0; i < vertexCount; i += 1) {
        const nx = geometry.normals[i * 3] ?? 0;
        const ny = geometry.normals[i * 3 + 1] ?? 0;
        let uScale: number;
        let vScale: number;
        if (Math.abs(nx) > 0.5) {
          uScale = sz / tileSize;
          vScale = sy / tileSize;
        } else if (Math.abs(ny) > 0.5) {
          uScale = sx / tileSize;
          vScale = sz / tileSize;
        } else {
          uScale = sx / tileSize;
          vScale = sy / tileSize;
        }
        uvs[i * 2] = (uvs[i * 2] ?? 0) * Math.max(0.05, uScale);
        uvs[i * 2 + 1] = (uvs[i * 2 + 1] ?? 0) * Math.max(0.05, vScale);
      }
      geometry.uvs = uvs;
      geometry.tangents = pc.calculateTangents(
        geometry.positions,
        geometry.normals,
        uvs,
        geometry.indices,
      );
    }

    const mesh = pc.Mesh.fromGeometry(this.app.graphicsDevice, geometry);
    this.meshes.set(key, mesh);
    return mesh;
  }

  private track(entity: pc.Entity): pc.Entity {
    this.app.root.addChild(entity);
    this.entities.push(entity);
    return entity;
  }

  private getMaterial(id: SceneMaterialId): pc.StandardMaterial {
    const existing = this.materials.get(id);
    if (existing) {
      return existing;
    }
    const spec = MATERIALS[id];
    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(spec.color[0], spec.color[1], spec.color[2]);
    if (spec.emissive) {
      material.emissive = new pc.Color(
        spec.emissive[0],
        spec.emissive[1],
        spec.emissive[2],
      );
    }
    material.gloss = spec.gloss ?? 0.25;
    material.metalness = spec.metalness ?? 0;
    material.useMetalness = true;
    material.update();

    if (spec.textureSet) {
      this.applyTextureSet(material, spec);
    }

    this.materials.set(id, material);
    return material;
  }

  private applyTextureSet(material: pc.StandardMaterial, spec: MaterialSpec): void {
    if (!spec.textureSet) {
      return;
    }
    const paths = TEXTURE_SETS[spec.textureSet];
    const tint = spec.mapTint ?? [1, 1, 1];

    this.loadTexture(paths.baseColor, true, (texture) => {
      material.diffuseMap = texture;
      material.diffuse = new pc.Color(tint[0], tint[1], tint[2]);
      material.update();
    });

    if (paths.normal) {
      this.loadTexture(paths.normal, false, (texture) => {
        material.normalMap = texture;
        material.bumpiness = spec.bumpiness ?? 0.7;
        material.update();
      });
    }

    if (paths.roughness) {
      this.loadTexture(paths.roughness, false, (texture) => {
        material.glossMap = texture;
        material.glossMapChannel = 'r';
        material.glossInvert = true;
        material.update();
      });
    }

    if (paths.ao) {
      this.loadTexture(paths.ao, false, (texture) => {
        material.aoMap = texture;
        material.aoMapChannel = 'r';
        material.update();
      });
    }
  }

  private loadTexture(
    url: string,
    srgb: boolean,
    onLoad: (texture: pc.Texture) => void,
  ): void {
    const cached = this.textures.get(url);
    if (cached) {
      onLoad(cached);
      return;
    }

    const pending = this.pendingTextureCallbacks.get(url);
    if (pending) {
      pending.push(onLoad);
      return;
    }
    this.pendingTextureCallbacks.set(url, [onLoad]);

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const callbacks = this.pendingTextureCallbacks.get(url);
      this.pendingTextureCallbacks.delete(url);
      // GLB 接管后，代码生成几何的材质已销毁，不能再往上挂贴图。
      if (this.destroyed || this.proceduralReleased) {
        return;
      }

      const texture = new pc.Texture(this.app.graphicsDevice, {
        name: url,
        srgb,
        mipmaps: true,
        minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
        magFilter: pc.FILTER_LINEAR,
        addressU: pc.ADDRESS_REPEAT,
        addressV: pc.ADDRESS_REPEAT,
        anisotropy: 4,
      });
      texture.setSource(image);
      this.textures.set(url, texture);

      if (callbacks) {
        for (const callback of callbacks) {
          callback(texture);
        }
      }
    };
    image.onerror = () => {
      this.pendingTextureCallbacks.delete(url);
      console.warn(`贴图加载失败，保持回退材质颜色: ${url}`);
    };
    image.src = url;
  }
}
