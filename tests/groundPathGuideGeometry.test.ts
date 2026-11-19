import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildGroundPathGuideGeometry } from '../src/game/navigation/groundPathGuideGeometry.ts';
import type { Vec3Tuple } from '../src/shared/types/save.ts';

test('长路径只生成局部实心箭头，并让远端逐渐淡出', () => {
  const route: Vec3Tuple[] = [
    [0, 0, 0],
    [0, 0, -20],
  ];
  const geometry = buildGroundPathGuideGeometry(route);

  assert.ok(geometry);
  assert.ok(geometry.markerCount >= 6);
  assert.ok(geometry.markerCount <= 8);
  assert.equal(geometry.indices.length, geometry.markerCount * 30);

  for (let index = 1; index < geometry.positions.length; index += 3) {
    const y = geometry.positions[index];
    assert.ok(y !== undefined);
    assert.ok(y > 0.02, '路标应浮在地面上方');
  }

  const markerOpacities: number[] = [];
  for (let marker = 0; marker < geometry.markerCount; marker += 1) {
    const glowAlphaIndex = marker * 56 + 3;
    const coreAlphaIndex = marker * 56 + 31;
    assert.ok(
      (geometry.colors[coreAlphaIndex] ?? 0) >
        (geometry.colors[glowAlphaIndex] ?? 0),
    );
    const tipAlphaIndex = coreAlphaIndex;
    markerOpacities.push(geometry.colors[tipAlphaIndex] ?? 0);
  }
  assert.ok(markerOpacities[0]! > markerOpacities.at(-1)!);
  assert.ok(markerOpacities.at(-1)! >= 0.08);
});

test('玩家移动后从当前位置重规划，箭头相位仍与原路线连续', () => {
  const before = buildGroundPathGuideGeometry([
    [0, 0, 0],
    [0, 0, -20],
  ]);
  const after = buildGroundPathGuideGeometry(
    [
      [0, 0, -0.55],
      [0, 0, -20],
    ],
    0.55,
  );
  const backedUp = buildGroundPathGuideGeometry([
    [0, 0, 0],
    [0, 0, -20],
  ]);

  assert.ok(before);
  assert.ok(after);
  assert.ok(backedUp);
  const firstCoreTipIndex = 21;
  for (const componentOffset of [0, 1, 2]) {
    const original = before.positions[firstCoreTipIndex + componentOffset]!;
    assert.ok(Math.abs(original - after.positions[firstCoreTipIndex + componentOffset]!) < 1e-6);
    assert.ok(Math.abs(original - backedUp.positions[firstCoreTipIndex + componentOffset]!) < 1e-6);
  }
});

test('方向箭头由实心箭头头部和窄箭杆组成', () => {
  const geometry = buildGroundPathGuideGeometry([
    [0, 0, 0],
    [0, 0, -2],
  ]);

  assert.ok(geometry);
  assert.equal(geometry.markerCount, 1);
  assert.equal(geometry.positions.length, 14 * 3);
  assert.equal(geometry.indices.length, 30);
  assert.equal(geometry.colors.length, 14 * 4);
});

test('过短路径不会生成地面路标', () => {
  assert.equal(
    buildGroundPathGuideGeometry([
      [0, 0, 0],
      [0, 0, -0.2],
    ]),
    null,
  );
});
