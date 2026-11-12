import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CameraShake, type CameraShakeOptions } from '../src/game/player/CameraShake.ts';

type Offset = readonly [number, number, number];

function maxComponent(offset: Offset): number {
  return Math.max(Math.abs(offset[0]), Math.abs(offset[1]), Math.abs(offset[2]));
}

function step(shake: CameraShake, frames: number, dt = 1 / 60): void {
  for (let index = 0; index < frames; index += 1) {
    shake.update(dt);
  }
}

test('没有 trauma 时不产生任何偏移', () => {
  const shake = new CameraShake();
  step(shake, 30);
  assert.deepEqual(shake.getOffset(), [0, 0, 0]);
});

test('trauma 按时间线性衰减并截止在 0', () => {
  const shake = new CameraShake({ decay: 1 });
  shake.add(0.6);
  assert.equal(shake.getTrauma(), 0.6);

  shake.update(0.25);
  assert.ok(Math.abs(shake.getTrauma() - 0.35) < 1e-9);

  shake.update(1);
  assert.equal(shake.getTrauma(), 0);
  assert.deepEqual(shake.getOffset(), [0, 0, 0]);
});

test('trauma 累加但不超过 1', () => {
  const shake = new CameraShake();
  shake.add(0.7);
  shake.add(0.7);
  assert.equal(shake.getTrauma(), 1);
});

test('震动幅度按 trauma 的平方缩放', () => {
  const measure = (trauma: number): number => {
    const shake = new CameraShake({ decay: 0 });
    shake.add(trauma);
    return maxComponent(shake.getOffset());
  };

  const strong = measure(0.5);
  const mild = measure(0.25);
  assert.ok(strong > 0, '应产生偏移');
  assert.ok(
    Math.abs(strong / mild - 4) < 1e-6,
    `trauma 减半幅度应降至 1/4，实际比值 ${strong / mild}`,
  );
});

test('噪声偏移逐帧连续，不会像随机数一样跳变', () => {
  const shake = new CameraShake({ decay: 0, frequency: 2 });
  shake.add(1);

  let previous = shake.getOffset();
  let maxDelta = 0;
  for (let index = 0; index < 120; index += 1) {
    step(shake, 1);
    const current = shake.getOffset();
    maxDelta = Math.max(
      maxDelta,
      Math.abs(current[0] - previous[0]),
      Math.abs(current[1] - previous[1]),
      Math.abs(current[2] - previous[2]),
    );
    previous = current;
  }

  assert.ok(maxDelta < 0.2, `相邻帧偏移变化应连续，实际最大 ${maxDelta}`);
});

test('相同 seed 的输出可复现，不同 seed 不同', () => {
  const run = (options: CameraShakeOptions): Offset => {
    const shake = new CameraShake(options);
    shake.add(1);
    step(shake, 30);
    return shake.getOffset();
  };

  assert.deepEqual(run({ seed: 7 }), run({ seed: 7 }));
  const first = run({ seed: 7 });
  const other = run({ seed: 8 });
  assert.ok(
    first[0] !== other[0] || first[1] !== other[1] || first[2] !== other[2],
    '不同 seed 应产生不同噪声',
  );
});

test('强度倍率可以整体调小或关闭', () => {
  const full = new CameraShake({ decay: 0 });
  full.add(1);
  const half = new CameraShake({ decay: 0 });
  half.add(1);
  half.setIntensity(0.5);
  const off = new CameraShake({ decay: 0 });
  off.add(1);
  off.setIntensity(0);

  const fullMagnitude = maxComponent(full.getOffset());
  assert.ok(Math.abs(maxComponent(half.getOffset()) / fullMagnitude - 0.5) < 1e-9);
  assert.deepEqual(off.getOffset(), [0, 0, 0]);
});
