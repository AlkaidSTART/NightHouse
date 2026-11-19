import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildObjectiveMarker } from '../src/game/navigation/objectiveMarker.ts';

test('目标投影：视野内保留锚点，视野外提示转向且不会溢出屏幕', () => {
  const center = buildObjectiveMarker('drawer', '抽屉', 45, 65, true, 2.4);
  assert.ok(center);
  assert.equal(center.x, 45);
  assert.equal(center.y, 65);
  assert.equal(center.direction, 'onscreen');
  for (const [x, y, direction] of [
    [-120, 45, 'left'], [220, 45, 'right'], [50, -60, 'up'], [50, 180, 'down'],
  ] as const) {
    const marker = buildObjectiveMarker('drawer', '抽屉', x, y, true, 2);
    assert.ok(marker);
    assert.equal(marker.direction, direction);
    assert.ok(marker.x >= 10 && marker.x <= 90 && marker.y >= 20 && marker.y <= 70);
  }
});

test('目标投影：身后目标只提示转身，不把反向投影显示成眼前目标', () => {
  const marker = buildObjectiveMarker('drawer', '抽屉', 700, -100, false, 4);
  assert.ok(marker);
  assert.equal(marker.direction, 'behind');
  assert.equal(marker.x, 50);
  assert.equal(marker.y, 65);
});

test('目标投影：退化投影或非法距离不产生破损的界面坐标', () => {
  assert.equal(buildObjectiveMarker('x', 'x', NaN, 50, true, 1), null);
  assert.equal(buildObjectiveMarker('x', 'x', 50, Infinity, true, 1), null);
  assert.equal(buildObjectiveMarker('x', 'x', 50, 50, true, -1), null);
});
