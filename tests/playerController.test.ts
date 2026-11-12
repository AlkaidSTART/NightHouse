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
  offset: pc.Entity;
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
  const offset = new pc.Entity('player_camera_offset');
  const camera = new pc.Entity('player_camera');
  root.addChild(offset);
  offset.addChild(camera);
  const keyboard = new FakeKeyboard();
  const app = { keyboard } as unknown as pc.Application;

  const controller = new PlayerController({
    app,
    canvas,
    root,
    offset,
    camera,
    sensitivity: 1,
    rotation: [0, 0, 0],
    collision: world,
    eyeHeight: EYE_HEIGHT,
  });
  controller.setPaused(false);

  return {
    root,
    offset,
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

test('行走时相机产生步伐摇晃，停下后恢复稳定', () => {
  const harness = createHarness();
  const offset = harness.offset;

  harness.keyboard.press(pc.KEY_W);
  let maxVertical = 0;
  let maxLateral = 0;
  let maxRoll = 0;
  for (let index = 0; index < 60; index += 1) {
    harness.step();
    const position = offset.getLocalPosition();
    const angles = offset.getLocalEulerAngles();
    maxVertical = Math.max(maxVertical, Math.abs(position.y));
    maxLateral = Math.max(maxLateral, Math.abs(position.x));
    maxRoll = Math.max(maxRoll, Math.abs(angles.z));
  }

  assert.ok(maxVertical > 0.01, `应有垂直起伏，实际 ${maxVertical}`);
  assert.ok(maxLateral > 0.005, `应有横向摆动，实际 ${maxLateral}`);
  assert.ok(maxRoll < 1e-9, `不应滚转视线，实际 ${maxRoll}`);
  assert.equal(harness.controller.camera.getLocalPosition().y, 0, '相机本体不应被摇晃改写');

  harness.keyboard.release(pc.KEY_W);
  harness.step(90);
  const settled = offset.getLocalPosition();
  assert.ok(
    Math.abs(settled.x) < 1e-3 && Math.abs(settled.y) < 1e-3,
    `停下后应回到中位，实际 ${settled.x}, ${settled.y}`,
  );
  assert.ok(Math.abs(offset.getLocalEulerAngles().z) < 1e-2);
});

test('摇晃幅度由随机函数抽样，不同步幅强度不同', () => {
  const original = Math.random;
  const measure = (value: number): number => {
    Math.random = () => value;
    try {
      const harness = createHarness();
      harness.keyboard.press(pc.KEY_W);
      let maxVertical = 0;
      for (let index = 0; index < 90; index += 1) {
        harness.step();
        maxVertical = Math.max(
          maxVertical,
          Math.abs(harness.offset.getLocalPosition().y),
        );
      }
      return maxVertical;
    } finally {
      Math.random = original;
    }
  };

  const strong = measure(1);
  const mild = measure(0);
  assert.ok(
    strong > mild + 0.005,
    `随机幅度应带来差异，最大 ${strong} 与最小 ${mild}`,
  );
  assert.ok(mild > 0.01, `最小幅度也应可见，实际 ${mild}`);
});

test('系统偏好减少动态效果时关闭步伐摇晃', () => {
  const globals = globalThis as unknown as Record<string, unknown>;
  globals.window = { matchMedia: () => ({ matches: true }) };
  try {
    const harness = createHarness();
    harness.keyboard.press(pc.KEY_W);
    let maxOffset = 0;
    for (let index = 0; index < 60; index += 1) {
      harness.step();
      const position = harness.offset.getLocalPosition();
      maxOffset = Math.max(maxOffset, Math.abs(position.x), Math.abs(position.y));
    }
    assert.ok(maxOffset < 1e-9, `关闭摇晃后相机不应偏移，实际 ${maxOffset}`);
  } finally {
    delete globals.window;
  }
});

test('落地产生冲击震动，并在衰减后归零', () => {
  const harness = createHarness();
  const initialY = harness.root.getPosition().y;

  harness.keyboard.press(pc.KEY_SPACE);
  harness.step();
  harness.step(20);

  let landed = false;
  for (let index = 0; index < 60; index += 1) {
    harness.step();
    if (harness.controller.getFeetPosition()[1] === 0) {
      landed = true;
      break;
    }
  }
  assert.ok(landed, '应已完成落地');

  const angles = harness.offset.getLocalEulerAngles();
  const shakeMagnitude = Math.max(
    Math.abs(angles.x),
    Math.abs(angles.y),
    Math.abs(angles.z),
  );
  assert.ok(shakeMagnitude > 0.01, `落地应触发震动，实际 ${shakeMagnitude}`);

  harness.step(180);
  const settled = harness.offset.getLocalEulerAngles();
  assert.ok(
    Math.abs(settled.x) < 1e-3 &&
      Math.abs(settled.y) < 1e-3 &&
      Math.abs(settled.z) < 1e-3,
    '震动应在衰减后归零',
  );
  assert.ok(Math.abs(harness.root.getPosition().y - initialY) < 1e-6);
});
