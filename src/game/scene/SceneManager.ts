import * as pc from 'playcanvas';
import type { Vec3Tuple } from '../../shared/types/save';

export interface SceneInteractableDescriptor {
  id: string;
  entity: pc.Entity;
  radius: number;
  prompt: string;
  message: string;
}

export interface GreyboxScene {
  sceneId: string;
  interactables: SceneInteractableDescriptor[];
}

export class SceneManager {
  private readonly app: pc.Application;
  private readonly entities: pc.Entity[] = [];
  private readonly materials: pc.StandardMaterial[] = [];

  constructor(app: pc.Application) {
    this.app = app;
  }

  buildGreybox(): GreyboxScene {
    const floorMaterial = this.createMaterial([0.14, 0.11, 0.09]);
    const wallMaterial = this.createMaterial([0.17, 0.17, 0.19]);
    const ceilingMaterial = this.createMaterial([0.08, 0.08, 0.09]);
    const woodMaterial = this.createMaterial([0.24, 0.17, 0.11]);
    const fabricMaterial = this.createMaterial([0.16, 0.13, 0.13]);

    this.createBox('floor', [0, -0.1, 0], [14, 0.2, 12], floorMaterial);
    this.createBox('ceiling', [0, 3.1, 0], [14, 0.2, 12], ceilingMaterial);

    this.createBox('wall_north_left', [-4.1, 1.5, -6], [5.8, 3, 0.2], wallMaterial);
    this.createBox('wall_north_right', [4.1, 1.5, -6], [5.8, 3, 0.2], wallMaterial);
    this.createBox('wall_north_lintel', [0, 2.65, -6], [2.4, 0.7, 0.2], wallMaterial);
    this.createBox('wall_south', [0, 1.5, 6], [14, 3, 0.2], wallMaterial);
    this.createBox('wall_east', [7, 1.5, 0], [0.2, 3, 12], wallMaterial);
    this.createBox('wall_west', [-7, 1.5, 0], [0.2, 3, 12], wallMaterial);

    this.createBox('table_top', [-3, 0.9, -3.5], [2.2, 0.12, 1], woodMaterial);
    this.createBox('table_leg_a', [-3.95, 0.45, -3.9], [0.12, 0.9, 0.12], woodMaterial);
    this.createBox('table_leg_b', [-2.05, 0.45, -3.9], [0.12, 0.9, 0.12], woodMaterial);
    this.createBox('table_leg_c', [-3.95, 0.45, -3.1], [0.12, 0.9, 0.12], woodMaterial);
    this.createBox('table_leg_d', [-2.05, 0.45, -3.1], [0.12, 0.9, 0.12], woodMaterial);

    this.createBox('sofa_seat', [3, 0.4, 2.6], [3, 0.4, 1.1], fabricMaterial);
    this.createBox('sofa_back', [3, 0.95, 3.05], [3, 0.85, 0.25], fabricMaterial);
    this.createBox('sofa_arm_left', [1.55, 0.65, 2.6], [0.25, 0.5, 1.1], fabricMaterial);
    this.createBox('sofa_arm_right', [4.45, 0.65, 2.6], [0.25, 0.5, 1.1], fabricMaterial);

    this.createBox('shelf_frame', [5.8, 1.1, -4.8], [2.4, 2.2, 0.4], woodMaterial);

    this.createLight('light_table', 'omni', [-3, 2.3, -3], [1, 0.82, 0.6], 1.6, 9);
    this.createLight('light_room', 'omni', [3, 2.6, 1], [0.62, 0.7, 0.9], 0.9, 14);
    this.createLight('light_moon', 'directional', [0, 6, 0], [0.4, 0.46, 0.62], 0.5, 0);

    const noteMaterial = this.createMaterial([0.72, 0.65, 0.5]);
    noteMaterial.emissive = new pc.Color(0.35, 0.28, 0.15);
    noteMaterial.update();

    const note = this.createBox('prop_note_demo', [-3, 0.98, -3.5], [0.34, 0.02, 0.44], noteMaterial);

    return {
      sceneId: 'villa_greybox',
      interactables: [
        {
          id: 'prop_note_demo',
          entity: note,
          radius: 0.42,
          prompt: '查看桌上的字条',
          message: '示例交互：后续将在这里接入线索查看面板。',
        },
      ],
    };
  }

  destroy(): void {
    for (const entity of this.entities) {
      entity.destroy();
    }
    this.entities.length = 0;

    for (const material of this.materials) {
      material.destroy();
    }
    this.materials.length = 0;
  }

  private createMaterial(rgb: Vec3Tuple, gloss = 0.2): pc.StandardMaterial {
    const material = new pc.StandardMaterial();
    material.diffuse = new pc.Color(rgb[0], rgb[1], rgb[2]);
    material.gloss = gloss;
    material.metalness = 0;
    material.useMetalness = true;
    material.update();
    this.materials.push(material);
    return material;
  }

  private createBox(
    name: string,
    position: Vec3Tuple,
    scale: Vec3Tuple,
    material: pc.StandardMaterial,
  ): pc.Entity {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type: 'box', material });
    entity.setPosition(position[0], position[1], position[2]);
    entity.setLocalScale(scale[0], scale[1], scale[2]);
    this.app.root.addChild(entity);
    this.entities.push(entity);
    return entity;
  }

  private createLight(
    name: string,
    type: 'omni' | 'directional',
    position: Vec3Tuple,
    rgb: Vec3Tuple,
    intensity: number,
    range: number,
  ): pc.Entity {
    const entity = new pc.Entity(name);
    entity.addComponent('light', {
      type,
      color: new pc.Color(rgb[0], rgb[1], rgb[2]),
      intensity,
      range,
      castShadows: false,
    });
    entity.setPosition(position[0], position[1], position[2]);
    entity.setEulerAngles(-60, 30, 0);
    this.app.root.addChild(entity);
    this.entities.push(entity);
    return entity;
  }
}
