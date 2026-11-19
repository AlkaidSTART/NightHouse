import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildGroundPathGuideGeometry } from '../src/game/navigation/groundPathGuideGeometry.ts';
import type { Vec3Tuple } from '../src/shared/types/save.ts';

test('长路径只生成一个圆点，不再生成一串箭头', () => {
  const route: Vec3Tuple[] = [
    [0, 0, 0],
    [0, 0, -20],
  ];
  const geometry = buildGroundPathGuideGeometry(route);

  assert.ok(geometry);
  assert.equal(geometry.markerCount, 1);
  assert.equal(geometry.positions.length, 2 * 17 * 3);
  assert.equal(geometry.indices.length, 2 * 16 * 3);
  assert.ok(geometry.positions.every((value, index) => index % 3 !== 1 || value > 0.02));
  assert.ok(geometry.colors.some((value, index) => index % 4 === 3 && value > 0.9));
});

test('圆点沿路线前方显示，路线过短时不显示', () => {
  const geometry = buildGroundPathGuideGeometry([
    [0, 0, 0],
    [0, 0, -5],
  ]);
  assert.ok(geometry);
  const centerY = geometry.positions[1] ?? 0;
  const centerZ = geometry.positions[2] ?? 0;
  assert.equal(centerY, 0.028);
  assert.ok(Math.abs(centerZ + 2.2) < 0.001);

  assert.equal(
    buildGroundPathGuideGeometry([
      [0, 0, 0],
      [0, 0, -0.2],
    ]),
    null,
  );
});
