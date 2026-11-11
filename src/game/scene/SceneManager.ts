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

interface MaterialSpec {
  color: Vec3Tuple;
  emissive?: Vec3Tuple;
}

const MATERIALS: Record<SceneMaterialId, MaterialSpec> = {
  wall: { color: [0.2, 0.2, 0.22] },
  floor: { color: [0.16, 0.12, 0.09] },
  ceiling: { color: [0.11, 0.11, 0.12] },
  ground: { color: [0.06, 0.07, 0.07] },
  roof: { color: [0.08, 0.08, 0.1] },
  wood: { color: [0.26, 0.18, 0.11] },
  fabric: { color: [0.2, 0.14, 0.15] },
  stone: { color: [0.3, 0.3, 0.31] },
  metal: { color: [0.32, 0.28, 0.2] },
  paper: { color: [0.62, 0.56, 0.44], emissive: [0.1, 0.08, 0.05] },
  mirror: { color: [0.3, 0.36, 0.4], emissive: [0.04, 0.05, 0.06] },
  foliage: { color: [0.07, 0.1, 0.07] },
  sea: { color: [0.02, 0.04, 0.07] },
  door: { color: [0.22, 0.13, 0.08] },
  windowLit: { color: [0.9, 0.7, 0.4], emissive: [0.95, 0.68, 0.34] },
  windowDark: { color: [0.02, 0.025, 0.035] },
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
  private readonly doorPivots = new Map<string, { pivot: pc.Entity; swing: number }>();

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
    for (const entity of this.entities) {
      entity.destroy();
    }
    this.entities.length = 0;
    this.doorPivots.clear();

    for (const material of this.materials.values()) {
      material.destroy();
    }
    this.materials.clear();
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

    const leaf = new pc.Entity(`${door.id}_leaf`);
    leaf.addComponent('render', {
      type: 'box',
      material: this.getMaterial('door'),
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
    material: SceneMaterialId,
  ): pc.Entity {
    const entity = this.track(new pc.Entity(name));
    entity.addComponent('render', {
      type: 'box',
      material: this.getMaterial(material),
    });
    entity.setPosition(
      (min[0] + max[0]) / 2,
      (min[1] + max[1]) / 2,
      (min[2] + max[2]) / 2,
    );
    entity.setLocalScale(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
    return entity;
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
    material.gloss = 0.2;
    material.metalness = 0;
    material.useMetalness = true;
    material.update();
    this.materials.set(id, material);
    return material;
  }
}
