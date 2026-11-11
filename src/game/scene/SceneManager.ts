import * as pc from 'playcanvas';
import type { Vec3Tuple } from '../../shared/types/save';
import type {
  SceneDefinition,
  SceneDoor,
  SceneMaterialId,
  SceneNpcSpot,
} from '../../shared/types/scene';
import { DOOR_THICKNESS, doorCenter } from './sceneGeometry.ts';

export interface SceneInteractableHandle {
  id: string;
  entity: pc.Entity;
  radius: number;
  prompt: string;
  message: string;
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

type TextureSetId =
  | 'plaster'
  | 'wood'
  | 'fabric'
  | 'tile'
  | 'grime'
  | 'docLetter'
  | 'docPhoto';

interface TextureSetPaths {
  baseColor: string;
  normal?: string;
  roughness?: string;
  ao?: string;
}

const TEXTURE_SETS: Record<TextureSetId, TextureSetPaths> = {
  plaster: {
    baseColor: '/assets/textures/T_Wall_OldPlaster_01_BaseColor.png',
    normal: '/assets/textures/T_Wall_OldPlaster_01_Normal.png',
    roughness: '/assets/textures/T_Wall_OldPlaster_01_Roughness.png',
    ao: '/assets/textures/T_Wall_OldPlaster_01_AO.png',
  },
  wood: {
    baseColor: '/assets/textures/T_Floor_WoodWorn_01_BaseColor.png',
    normal: '/assets/textures/T_Floor_WoodWorn_01_Normal.png',
    roughness: '/assets/textures/T_Floor_WoodWorn_01_Roughness.png',
    ao: '/assets/textures/T_Floor_WoodWorn_01_AO.png',
  },
  fabric: {
    baseColor: '/assets/textures/T_Fabric_Worn_01_BaseColor.png',
    normal: '/assets/textures/T_Fabric_Worn_01_Normal.png',
    roughness: '/assets/textures/T_Fabric_Worn_01_Roughness.png',
    ao: '/assets/textures/T_Fabric_Worn_01_AO.png',
  },
  tile: {
    baseColor: '/assets/textures/T_Tile_Bathroom_01_BaseColor.png',
    normal: '/assets/textures/T_Tile_Bathroom_01_Normal.png',
    roughness: '/assets/textures/T_Tile_Bathroom_01_Roughness.png',
    ao: '/assets/textures/T_Tile_Bathroom_01_AO.png',
  },
  grime: {
    baseColor: '/assets/textures/T_Grime_DustWear_Set_01_BaseColor.png',
    normal: '/assets/textures/T_Grime_DustWear_Set_01_Normal.png',
    roughness: '/assets/textures/T_Grime_DustWear_Set_01_Roughness.png',
    ao: '/assets/textures/T_Grime_DustWear_Set_01_AO.png',
  },
  docLetter: {
    baseColor: '/assets/textures/documents/TEX_Document_LetterPage.png',
  },
  docPhoto: {
    baseColor: '/assets/textures/documents/TEX_Document_PhotoImage.png',
  },
};

interface MaterialSpec {
  /** 贴图未就绪时的回退颜色。 */
  color: Vec3Tuple;
  /** 贴图就绪后乘在 diffuseMap 上的色调系数。 */
  mapTint?: Vec3Tuple;
  emissive?: Vec3Tuple;
  gloss?: number;
  metalness?: number;
  bumpiness?: number;
  textureSet?: TextureSetId;
  /** 世界空间平铺尺度（米 / 次重复）；未定义或 <= 0 时每个面保持 0..1 UV。 */
  tileSize?: number;
}

const MATERIALS: Record<SceneMaterialId, MaterialSpec> = {
  wall: {
    color: [0.2, 0.2, 0.22],
    mapTint: [0.46, 0.46, 0.49],
    gloss: 0.9,
    bumpiness: 0.75,
    textureSet: 'plaster',
    tileSize: 2.4,
  },
  floor: {
    color: [0.16, 0.12, 0.09],
    mapTint: [0.85, 0.78, 0.72],
    gloss: 0.95,
    bumpiness: 0.8,
    textureSet: 'wood',
    tileSize: 2.2,
  },
  ceiling: {
    color: [0.11, 0.11, 0.12],
    mapTint: [0.3, 0.3, 0.33],
    gloss: 0.85,
    bumpiness: 0.5,
    textureSet: 'plaster',
    tileSize: 2.8,
  },
  ground: {
    color: [0.06, 0.07, 0.07],
    mapTint: [0.28, 0.32, 0.3],
    gloss: 0.85,
    bumpiness: 0.9,
    textureSet: 'grime',
    tileSize: 3.5,
  },
  roof: {
    color: [0.08, 0.08, 0.1],
    mapTint: [0.32, 0.34, 0.4],
    gloss: 0.85,
    bumpiness: 0.7,
    textureSet: 'grime',
    tileSize: 3.0,
  },
  wood: {
    color: [0.26, 0.18, 0.11],
    mapTint: [0.95, 0.8, 0.66],
    gloss: 0.95,
    bumpiness: 0.65,
    textureSet: 'wood',
    tileSize: 1.4,
  },
  fabric: {
    color: [0.2, 0.14, 0.15],
    mapTint: [0.92, 0.82, 0.84],
    gloss: 0.9,
    bumpiness: 0.6,
    textureSet: 'fabric',
    tileSize: 1.2,
  },
  tile: {
    color: [0.26, 0.29, 0.28],
    mapTint: [0.7, 0.74, 0.72],
    gloss: 0.95,
    bumpiness: 0.85,
    textureSet: 'tile',
    tileSize: 1.4,
  },
  stone: {
    color: [0.3, 0.3, 0.31],
    mapTint: [0.75, 0.75, 0.78],
    gloss: 0.9,
    bumpiness: 0.85,
    textureSet: 'grime',
    tileSize: 2.0,
  },
  metal: {
    color: [0.32, 0.28, 0.2],
    mapTint: [0.9, 0.78, 0.56],
    gloss: 0.95,
    metalness: 0.65,
    bumpiness: 0.55,
    textureSet: 'grime',
    tileSize: 1.0,
  },
  paper: {
    color: [0.62, 0.56, 0.44],
    mapTint: [0.85, 0.82, 0.76],
    emissive: [0.06, 0.05, 0.03],
    gloss: 0.2,
    textureSet: 'docLetter',
  },
  photo: {
    color: [0.55, 0.5, 0.42],
    mapTint: [0.88, 0.85, 0.8],
    emissive: [0.05, 0.04, 0.03],
    gloss: 0.3,
    textureSet: 'docPhoto',
  },
  mirror: {
    color: [0.3, 0.36, 0.4],
    emissive: [0.04, 0.05, 0.06],
    gloss: 0.88,
    metalness: 0.85,
  },
  foliage: {
    color: [0.07, 0.1, 0.07],
    mapTint: [0.24, 0.38, 0.26],
    gloss: 0.85,
    bumpiness: 0.8,
    textureSet: 'fabric',
    tileSize: 1.5,
  },
  sea: {
    color: [0.02, 0.04, 0.07],
    gloss: 0.75,
    metalness: 0.2,
  },
  door: {
    color: [0.22, 0.13, 0.08],
    mapTint: [0.78, 0.6, 0.46],
    gloss: 0.95,
    bumpiness: 0.75,
    textureSet: 'wood',
    tileSize: 1.6,
  },
  windowLit: { color: [0.9, 0.7, 0.4], emissive: [0.95, 0.68, 0.34] },
  windowDark: { color: [0.02, 0.025, 0.035], gloss: 0.7 },
  npcArthur: { color: [0.2, 0.3, 0.55], emissive: [0.06, 0.1, 0.2] },
  npcHousekeeper: { color: [0.5, 0.42, 0.2], emissive: [0.18, 0.14, 0.05] },
  npcDoctor: { color: [0.22, 0.45, 0.32], emissive: [0.06, 0.16, 0.1] },
};

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

/** 把内容层的场景定义搭成 PlayCanvas 实体，并负责释放。 */
export class SceneManager {
  private readonly app: pc.Application;
  private readonly entities: pc.Entity[] = [];
  private readonly materials = new Map<SceneMaterialId, pc.StandardMaterial>();
  private readonly meshes = new Map<string, pc.Mesh>();
  private readonly textures = new Map<string, pc.Texture>();
  private readonly pendingTextureCallbacks = new Map<
    string,
    Array<(texture: pc.Texture) => void>
  >();
  private readonly doorPivots = new Map<string, { pivot: pc.Entity; swing: number }>();
  private destroyed = false;

  constructor(app: pc.Application) {
    this.app = app;
  }

  build(scene: SceneDefinition): BuiltScene {
    for (const box of scene.boxes) {
      if (box.visible) {
        this.createBox(box.id, box.min, box.max, box.material);
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
      intensity: 0.45,
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
      });
    }

    for (const spot of scene.npcSpots) {
      interactables.push(this.createNpcSpot(spot));
    }

    const doors = scene.doors.map((door) => this.createDoor(door));

    return { sceneId: scene.id, interactables, doors };
  }

  setDoorOpen(doorId: string, open: boolean): void {
    const entry = this.doorPivots.get(doorId);
    if (!entry) {
      return;
    }
    entry.pivot.setLocalEulerAngles(0, open ? 90 * entry.swing : 0, 0);
  }

  destroy(): void {
    this.destroyed = true;
    this.pendingTextureCallbacks.clear();

    for (const entity of this.entities) {
      entity.destroy();
    }
    this.entities.length = 0;
    this.doorPivots.clear();

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

  private createNpcSpot(spot: SceneNpcSpot): SceneInteractableHandle {
    const [x, y, z] = spot.position;
    const entity = this.createBox(
      spot.id,
      [x - 0.22, y, z - 0.15],
      [x + 0.22, y + NPC_PLACEHOLDER_HEIGHT, z + 0.15],
      NPC_MATERIAL[spot.npcId],
    );
    const name = NPC_NAME[spot.npcId];
    return {
      id: spot.id,
      entity,
      radius: 0.5,
      prompt: `站位：${name} · ${spot.label}`,
      message: spot.pending
        ? `占位：${name}的站位。${spot.pending}。`
        : `占位：${name}的站位。`,
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
    this.doorPivots.set(door.id, { pivot, swing: door.swing });
    this.setDoorOpen(door.id, door.startsOpen && !door.sealed);

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
        : 'unit_box';
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
      if (this.destroyed) {
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
