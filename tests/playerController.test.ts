import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as pc from 'playcanvas';
import { CollisionWorld } from '../src/game/collision/CollisionWorld.ts';
import { PlayerController } from '../src/game/player/PlayerController.ts';

const DT = 1 / 60;
const EYE_HEIGHT = 1.7;

class FakeKeyboard {
  private readonly down = new Set<number>();
  private readonly edges = new Set<number>();

  isPressed(key: number): boolean {
    return this.down.has(key);
  }

  wasPressed(key: number): boolean {
    return this.edges.has(key);
  }

  press(key: number): void {
    this.down.add(key);
    this.edges.add(key);
  }

  release(key: number): void {
    this.down.delete(key);
  }

  endFrame(): void {
    this.edges.clear();
  }
}

interface Harness {
  root: pc.Entity;
  keyboard: FakeKeyboard;
  controller: PlayerController;
  step(frames?: number): void;
}

function createHarness(options: { beamMinY?: number } = {}): Harness {
  const world = new CollisionWorld();
  world.addSurface({
    id: 'ground',
    minX: -10,
    maxX: 10,
    minZ: -10,
    maxZ: 10,
    y0: 0,
    y1: 0,
    axis: 'x',
  });
  if (options.beamMinY !== undefined) {
    world.addBox('beam', [-1, options.beamMinY, -1], [1, 3, 1]);
  }

  const canvas = {} as HTMLCanvasElement;
  const globals = globalThis as unknown as Record<string, unknown>;
  globals.document = {
    pointerLockElement: canvas,
    addEventListener(): void {},
    removeEventListener(): void {},
  };

  const root = new pc.Entity('player');
  root.setPosition(0, EYE_HEIGHT, 0);
  const camera = new pc.Entity('player_camera');
  const keyboard = new FakeKeyboard();
  const app = { keyboard } as unknown as pc.Application;

  const controller = new PlayerController({
    app,
    canvas,
    root,
    camera,
    sensitivity: 1,
    rotation: [0, 0, 0],
    collision: world,
    eyeHeight: EYE_HEIGHT,
  });
  controller.setPaused(false);

  return {
    root,
    keyboard,
    controller,
    step(frames = 1): void {
      for (let index = 0; index < frames; index += 1) {
        controller.update(DT);
        keyboard.endFrame();
      }
    },
  };
}

test('跳跃会离地并回到起始高度', () => {
  const harness = createHarness();
  const initialY = harness.root.getPosition().y;

  harness.keyboard.press(pc.KEY_SPACE);
  harness.step();
  assert.ok(harness.root.getPosition().y > initialY + 0.05, '起跳后应离地');

  harness.step(60);
  assert.ok(
    Math.abs(harness.root.getPosition().y - initialY) < 1e-6,
    `应落回 ${initialY}，实际 ${harness.root.getPosition().y}`,
  );
  assert.equal(harness.controller.getFeetPosition()[1], 0);
});

test('C 切换蹲下并降低视线，再按一次恢复站立', () => {
  const harness = createHarness();

  harness.keyboard.press(pc.KEY_C);
  harness.step(30);
  const crouchedY = harness.root.getPosition().y;
  assert.ok(crouchedY < EYE_HEIGHT - 0.5, `蹲下视线应明显降低，实际 ${crouchedY}`);
  assert.equal(harness.controller.getFeetPosition()[1], 0);

  harness.keyboard.press(pc.KEY_C);
  harness.step(30);
  assert.ok(
    Math.abs(harness.root.getPosition().y - EYE_HEIGHT) < 1e-3,
    `应恢复站立视线，实际 ${harness.root.getPosition().y}`,
  );
});

test('蹲下状态下不能跳跃', () => {
  const harness = createHarness();
  harness.keyboard.press(pc.KEY_C);
  harness.step(20);

  harness.keyboard.press(pc.KEY_SPACE);
  harness.step();
  assert.equal(harness.controller.getFeetPosition()[1], 0);

  harness.step(30);
  assert.equal(harness.controller.getFeetPosition()[1], 0);
});

test('头顶横梁限制跳跃高度', () => {
  const harness = createHarness({ beamMinY: 2 });
  const initialY = harness.root.getPosition().y;

  harness.keyboard.press(pc.KEY_SPACE);
  harness.step();
  const ceilingY = harness.root.getPosition().y;
  harness.step(40);

  assert.ok(
    ceilingY < initialY + 0.25,
    `应被横梁挡住，实际最高 ${ceilingY}，起始 ${initialY}`,
  );
  assert.ok(Math.abs(harness.root.getPosition().y - initialY) < 1e-6);
});

test('低矮空间内无法站起', () => {
  const harness = createHarness({ beamMinY: 1.2 });
  harness.keyboard.press(pc.KEY_C);
  harness.step(20);

  harness.keyboard.press(pc.KEY_C);
  harness.step(30);
  assert.ok(
    harness.root.getPosition().y < EYE_HEIGHT - 0.5,
    '头顶空间不足时应保持蹲下',
  );
});
