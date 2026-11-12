import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  advanceDoorSwing,
  createDoorSwingState,
  retargetDoorSwing,
} from '../src/game/scene/doorSwing.ts';

const EPSILON = 1e-6;

test('门扇缓动到目标角度并精确落位', () => {
  const swing = createDoorSwingState(0);
  retargetDoorSwing(swing, 90);

  // 0.62 s 行程的一半应位于正中间（easeInOutCubic 在 t = 0.5 时等于 0.5）。
  assert.ok(Math.abs((advanceDoorSwing(swing, 0.31) ?? 0) - 45) < EPSILON);
  assert.equal(advanceDoorSwing(swing, 0.31), 90);
  assert.equal(advanceDoorSwing(swing, 1), null, '落位后不应继续刷新');
});

test('中途反向从当前角度折返，而不是跳回起点', () => {
  const swing = createDoorSwingState(0);
  retargetDoorSwing(swing, 90);
  advanceDoorSwing(swing, 0.31);

  retargetDoorSwing(swing, 0);
  const midway = advanceDoorSwing(swing, 0.1);
  assert.ok(midway !== null && midway > 0 && midway < 45);

  assert.equal(advanceDoorSwing(swing, 10), 0);
});

test('朝同一目标重复触发不会重置进度', () => {
  const swing = createDoorSwingState(0);
  retargetDoorSwing(swing, 90);
  advanceDoorSwing(swing, 0.31);
  const elapsed = swing.elapsed;

  retargetDoorSwing(swing, 90);
  assert.equal(swing.elapsed, elapsed);
  assert.equal(advanceDoorSwing(swing, 0.31), 90);
});
