import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as pc from 'playcanvas';
import {
  NPC_ANCHOR_HEIGHT,
  NPC_INTERACTION_RADIUS,
} from '../src/game/interaction/npcAim.ts';
import { InteractionSystem } from '../src/game/interaction/InteractionSystem.ts';

const EYE_HEIGHT = 1.7;

function createSystem(targetY: number, radius: number, targetX = 0): InteractionSystem {
  const system = new InteractionSystem(3);
  const target = new pc.Entity('npc');
  target.setPosition(targetX, targetY, -1.3);
  system.register({
    id: 'npc',
    entity: target,
    radius,
    getPrompt: () => '交谈：霍尔太太',
    canInteract: () => true,
    interact: () => undefined,
  });
  return system;
}

function createCamera(): pc.Entity {
  const camera = new pc.Entity('camera');
  camera.setPosition(0, EYE_HEIGHT, 0);
  return camera;
}

test('平视即可选中 NPC，不需要低头看脚', () => {
  const system = createSystem(
    NPC_ANCHOR_HEIGHT,
    NPC_INTERACTION_RADIUS,
  );
  const camera = createCamera();
  assert.equal(
    system.update(camera, camera.getPosition()),
    '交谈：霍尔太太',
  );
});

test('旧的腰部锚点与 0.5 半径在平视时选不中', () => {
  const system = createSystem(0.875, 0.5);
  const camera = createCamera();
  assert.equal(system.update(camera, camera.getPosition()), null);
});

test('偏离瞄准锥或超过交互距离的 NPC 不显示提示', () => {
  const camera = createCamera();
  const side = createSystem(NPC_ANCHOR_HEIGHT, NPC_INTERACTION_RADIUS, 2);
  assert.equal(side.update(camera, camera.getPosition()), null);

  const far = new InteractionSystem(3);
  const target = new pc.Entity('far_npc');
  target.setPosition(0, NPC_ANCHOR_HEIGHT, -4);
  far.register({
    id: 'far_npc',
    entity: target,
    radius: NPC_INTERACTION_RADIUS,
    getPrompt: () => '交谈：格雷医生',
    canInteract: () => true,
    interact: () => undefined,
  });
  assert.equal(far.update(camera, camera.getPosition()), null);
});
