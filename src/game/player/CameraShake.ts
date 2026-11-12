import type { Vec3Tuple } from '../../shared/types/save';

/**
 * 相机冲击震动：trauma 模型 + 连续噪声。
 * 强度取 trauma 的平方，小冲击几乎不可见、大冲击明显，避免线性叠加导致晃动失控。
 */
export interface CameraShakeOptions {
  /** 满 trauma 时的最大俯仰、偏航、滚转角（度）。 */
  maxPitch?: number;
  maxYaw?: number;
  maxRoll?: number;
  /** trauma 每秒衰减量；越大衰减越快。 */
  decay?: number;
  /** 噪声采样频率（Hz）；低频更接近不安感而不是画面抖动。 */
  frequency?: number;
  seed?: number;
}

const DEFAULTS = {
  maxPitch: 1.2,
  maxYaw: 0.9,
  maxRoll: 0.8,
  decay: 1.2,
  frequency: 2,
  seed: 1337,
} as const;

export class CameraShake {
  private readonly maxPitch: number;
  private readonly maxYaw: number;
  private readonly maxRoll: number;
  private readonly decay: number;
  private readonly frequency: number;
  private readonly seed: number;
  private trauma = 0;
  private elapsed = 0;
  private intensity = 1;

  constructor(options: CameraShakeOptions = {}) {
    this.maxPitch = options.maxPitch ?? DEFAULTS.maxPitch;
    this.maxYaw = options.maxYaw ?? DEFAULTS.maxYaw;
    this.maxRoll = options.maxRoll ?? DEFAULTS.maxRoll;
    this.decay = options.decay ?? DEFAULTS.decay;
    this.frequency = options.frequency ?? DEFAULTS.frequency;
    this.seed = options.seed ?? DEFAULTS.seed;
  }

  /** 叠加冲击强度（0~1），超出部分截断。 */
  add(amount: number): void {
    this.trauma = clamp(this.trauma + amount, 0, 1);
  }

  /** 整体强度倍率，0 表示完全关闭。 */
  setIntensity(intensity: number): void {
    this.intensity = clamp(intensity, 0, 1);
  }

  getTrauma(): number {
    return this.trauma;
  }

  update(dt: number): void {
    this.elapsed += dt;
    this.trauma = Math.max(0, this.trauma - this.decay * dt);
  }

  /** 返回叠加在相机最终变换上的 [pitch, yaw, roll] 偏移（度）。 */
  getOffset(): Vec3Tuple {
    const amount = this.trauma * this.trauma * this.intensity;
    if (amount <= 0) {
      return [0, 0, 0];
    }

    const t = this.elapsed * this.frequency;
    return [
      this.maxPitch * amount * noise1D(t, this.seed),
      this.maxYaw * amount * noise1D(t, this.seed + 1),
      this.maxRoll * amount * noise1D(t, this.seed + 2),
    ];
  }
}

/**
 * 一维值噪声：整数格点取伪随机值，格点之间用 smoothstep 插值。
 * 逐帧随机数会让画面像掉帧，连续噪声才是真实的晃动。
 */
function noise1D(x: number, seed: number): number {
  const cell = Math.floor(x);
  const frac = x - cell;
  const smooth = frac * frac * (3 - 2 * frac);
  const from = hash(cell, seed);
  const to = hash(cell + 1, seed);
  return from + (to - from) * smooth;
}

function hash(value: number, seed: number): number {
  let h = (Math.imul(value, 374761393) + Math.imul(seed, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return ((h >>> 0) / 0xffffffff) * 2 - 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
