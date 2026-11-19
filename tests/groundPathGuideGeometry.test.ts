import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildGroundPathGuideGeometry,
  getGroundPathProgress,
} from '../src/game/navigation/groundPathGuideGeometry.ts';
import type { Vec3Tuple } from '../src/shared/types/save.ts';

test('长路径只生成局部 V 形路标，并让远端逐渐淡出', () => {
  const route: Vec3Tuple[] = [
    [0, 0, 0],
    [0, 0, -20],
  ];
  const geometry = buildGroundPathGuideGeometry(route);

  assert.ok(geometry);
  assert.ok(geometry.markerCount >= 6);
  assert.ok(geometry.markerCount <= 8);
  assert.equal(geometry.indices.length, geometry.markerCount * 12);

  for (let index = 1; index < geometry.positions.length; index += 3) {
    const y = geometry.positions[index];
    assert.ok(y !== undefined);
    assert.ok(y > 0.02, '路标应浮在地面上方');
  }

  const markerOpacities: number[] = [];
  for (let marker = 0; marker < geometry.markerCount; marker += 1) {
    const glowAlphaIndex = marker * 32 + 3;
    const coreAlphaIndex = marker * 32 + 19;
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

test('玩家沿路径前进重建路标时，V 形箭头仍锚定在原来的世界位置', () => {
  const before = buildGroundPathGuideGeometry([
    [0, 0, 0],
    [0, 0, -20],
  ]);
  const after = buildGroundPathGuideGeometry(
    [
      [0, 0, 0],
      [0, 0, -20],
    ],
    0.55,
  );

  assert.ok(before);
  assert.ok(after);
  const firstCoreTipIndex = 12;
  for (const componentOffset of [0, 1, 2]) {
    assert.ok(
      Math.abs(
        before.positions[firstCoreTipIndex + componentOffset]! -
          after.positions[firstCoreTipIndex + componentOffset]!,
      ) < 1e-6,
    );
  }
});

test('按路线投影计算玩家进度，并遵守回退窗口', () => {
  const route: Vec3Tuple[] = [
    [0, 0, 0],
    [0, 0, -5],
    [5, 0, -5],
  ];

  assert.equal(getGroundPathProgress(route, [0, 0, -2]), 2);
  assert.equal(getGroundPathProgress(route, [0, 0, -1], 2, 4), 2);
  assert.equal(getGroundPathProgress(route, [2, 0, -5], 3, 7), 7);
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
