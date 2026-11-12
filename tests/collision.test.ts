import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CollisionWorld,
  MAX_DROP,
  PLAYER_HEIGHT,
  PLAYER_RADIUS,
} from '../src/game/collision/CollisionWorld.ts';
import { isOccluded } from '../src/game/interaction/occlusion.ts';
import type { Vec3Tuple } from '../src/shared/types/save';

function flatWorld(): CollisionWorld {
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
  return world;
}

test('墙体挡住玩家，且不会穿过', () => {
  const world = flatWorld();
  world.addBox('wall', [2, 0, -5], [2.2, 3, 5]);
  const out: Vec3Tuple = [0, 0, 0];
  world.move(out, 0, 0, 0, 5, 0, PLAYER_RADIUS);
  assert.ok(Math.abs(out[0] - (2 - PLAYER_RADIUS)) < 1e-3, `停在 ${out[0]}`);
});

test('斜向撞墙时沿墙滑动', () => {
  const world = flatWorld();
  world.addBox('wall', [2, 0, -5], [2.2, 3, 5]);
  const out: Vec3Tuple = [0, 0, 0];
  world.move(out, 1.5, 0, 0, 2, 2, PLAYER_RADIUS);
  assert.ok(out[0] <= 2 - PLAYER_RADIUS + 1e-3);
  assert.ok(out[2] > 1.5, `应沿墙滑动，实际 z=${out[2]}`);
});

test('低于跨步高度的障碍不阻挡，高于的阻挡', () => {
  const world = flatWorld();
  world.addBox('low', [2, 0, -5], [2.2, 0.3, 5]);
  world.addBox('high', [4, 0, -5], [4.2, 0.5, 5]);
  const out: Vec3Tuple = [0, 0, 0];
  world.move(out, 0, 0, 0, 6, 0, PLAYER_RADIUS);
  assert.ok(Math.abs(out[0] - (4 - PLAYER_RADIUS)) < 1e-3, `停在 ${out[0]}`);
});

test('斜坡连续上行，并在顶端接到平台', () => {
  const world = flatWorld();
  world.addSurface({
    id: 'ramp',
    minX: 0,
    maxX: 3,
    minZ: -1,
    maxZ: 1,
    y0: 0,
    y1: 1.7,
    axis: 'x',
  });
  world.addSurface({
    id: 'landing',
    minX: 3,
    maxX: 5,
    minZ: -1,
    maxZ: 1,
    y0: 1.7,
    y1: 1.7,
    axis: 'x',
  });
  const out: Vec3Tuple = [0, 0, 0];
  world.move(out, -1, 0, 0, 5, 0, PLAYER_RADIUS);
  assert.ok(Math.abs(out[0] - 4) < 1e-6);
  assert.ok(Math.abs(out[1] - 1.7) < 1e-6, `高度 ${out[1]}`);
});

test('落差超过上限时停在边缘，不会坠落', () => {
  const world = new CollisionWorld();
  world.addSurface({ id: 'upper', minX: 0, maxX: 2, minZ: -1, maxZ: 1, y0: 3, y1: 3, axis: 'x' });
  world.addSurface({ id: 'lower', minX: -5, maxX: 5, minZ: -5, maxZ: 5, y0: 3 - MAX_DROP - 0.5, y1: 3 - MAX_DROP - 0.5, axis: 'x' });
  const out: Vec3Tuple = [0, 0, 0];
  world.move(out, 1, 3, 0, 3, 0, PLAYER_RADIUS);
  assert.ok(out[0] <= 2 + 1e-6, `越过了边缘：${out[0]}`);
  assert.equal(out[1], 3);
});

test('空中移动不做落差限制，也不吸附地面', () => {
  const world = new CollisionWorld();
  world.addSurface({ id: 'ledge', minX: 0, maxX: 2, minZ: -1, maxZ: 1, y0: 3, y1: 3, axis: 'x' });
  world.addSurface({ id: 'lower', minX: -5, maxX: 8, minZ: -5, maxZ: 5, y0: 0, y1: 0, axis: 'x' });
  const out: Vec3Tuple = [0, 0, 0];
  world.moveAirborne(out, 1, 3, 0, 4, 0, PLAYER_RADIUS);
  assert.ok(Math.abs(out[0] - 5) < 1e-6, `x=${out[0]}`);
  assert.equal(out[1], 3, '脚底高度应由调用方的重力控制');
});

test('空中移动仍会被墙挡住', () => {
  const world = flatWorld();
  world.addBox('wall', [2, 0, -5], [2.2, 3, 5]);
  const out: Vec3Tuple = [0, 0, 0];
  world.moveAirborne(out, 0, 0.5, 0, 5, 0, PLAYER_RADIUS);
  assert.ok(Math.abs(out[0] - (2 - PLAYER_RADIUS)) < 1e-3, `停在 ${out[0]}`);
});

test('蹲下可以从低矮横梁下通过，站立不能', () => {
  const world = flatWorld();
  world.addBox('beam', [2, 1.4, -5], [4, 3, 5]);
  const standing: Vec3Tuple = [0, 0, 0];
  world.move(standing, 0, 0, 0, 6, 0, PLAYER_RADIUS, PLAYER_HEIGHT);
  assert.ok(standing[0] < 2, `站立不应穿过，x=${standing[0]}`);
  const crouched: Vec3Tuple = [0, 0, 0];
  world.move(crouched, 0, 0, 0, 6, 0, PLAYER_RADIUS, 1.2);
  assert.ok(crouched[0] > 4, `蹲下应能通过，x=${crouched[0]}`);
});

test('头顶高度返回最低障碍底面，并忽略台阶高度的盒子', () => {
  const world = flatWorld();
  world.addBox('low', [-1, 0, -1], [1, 0.3, 1]);
  world.addBox('beam', [-1, 1.5, -1], [1, 3, 1]);
  assert.equal(world.ceilingHeight(0, 0, 0, PLAYER_RADIUS), 1.5);
  assert.equal(world.ceilingHeight(5, 0, 0, PLAYER_RADIUS), null);
  assert.equal(world.ceilingHeight(0, 0, 2, PLAYER_RADIUS), null);
});

test('没有地面的地方不能走过去', () => {
  const world = new CollisionWorld();
  world.addSurface({ id: 'island', minX: 0, maxX: 2, minZ: -1, maxZ: 1, y0: 0, y1: 0, axis: 'x' });
  const out: Vec3Tuple = [0, 0, 0];
  world.move(out, 1, 0, 0, 0, 4, PLAYER_RADIUS);
  assert.ok(out[2] <= 1 + 1e-6);
});

test('停用的碰撞盒不再阻挡', () => {
  const world = flatWorld();
  world.addBox('door', [2, 0, -5], [2.2, 3, 5]);
  world.setEnabled('door', false);
  const out: Vec3Tuple = [0, 0, 0];
  world.move(out, 0, 0, 0, 5, 0, PLAYER_RADIUS);
  assert.ok(Math.abs(out[0] - 5) < 1e-6);
  assert.throws(() => world.setEnabled('missing', true));
});

test('射线返回最近的命中距离', () => {
  const world = flatWorld();
  world.addBox('far', [5, 0, -1], [6, 3, 1]);
  world.addBox('near', [2, 0, -1], [3, 3, 1]);
  assert.equal(world.raycast(0, 1, 0, 1, 0, 0, 10), 2);
  assert.equal(world.raycast(0, 1, 0, -1, 0, 0, 10), null);
  assert.equal(world.raycast(0, 1, 0, 1, 0, 0, 1.5), null);
  world.setEnabled('near', false);
  assert.equal(world.raycast(0, 1, 0, 1, 0, 0, 10), 5);
});

test('遮挡判定：贴面的目标不被自身载体挡住，墙后的目标被挡住', () => {
  assert.equal(isOccluded(null, 2), false);
  assert.equal(isOccluded(1.95, 2), false);
  assert.equal(isOccluded(1.7, 2), true);
});
