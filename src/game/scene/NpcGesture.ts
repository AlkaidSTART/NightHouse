import * as pc from 'playcanvas';

/** 三维空间里的微动作幅度；1 为标准幅度，按角色性格调整。 */
export interface NpcGestureProfile {
  /** 整体动作幅度倍率。 */
  energy: number;
  /** 动作节奏倍率。 */
  tempo: number;
  /** 说话时头部与胸腔的强调幅度。 */
  speech: number;
  /** 手臂和手腕的小动作幅度。 */
  hands: number;
  /** 重心左右转换幅度。 */
  weightShift: number;
  /** 相位偏移，避免三个角色同步摆动。 */
  phase: number;
}

export const DEFAULT_NPC_GESTURE_PROFILE: NpcGestureProfile = {
  energy: 1,
  tempo: 1,
  speech: 1,
  hands: 1,
  weightShift: 1,
  phase: 0,
};

const TWO_PI = Math.PI * 2;
const MAX_STEP = 0.05;

type BoneKey =
  | 'hips'
  | 'spine'
  | 'chest'
  | 'neck'
  | 'head'
  | 'upperArmL'
  | 'upperArmR'
  | 'lowerArmL'
  | 'lowerArmR'
  | 'handL'
  | 'handR';

const BONE_ENTITY_NAMES: Record<BoneKey, string> = {
  hips: 'Hips',
  spine: 'Spine',
  chest: 'Chest',
  neck: 'Neck',
  head: 'Head',
  upperArmL: 'UpperArm.L',
  upperArmR: 'UpperArm.R',
  lowerArmL: 'LowerArm.L',
  lowerArmR: 'LowerArm.R',
  handL: 'Hand.L',
  handR: 'Hand.R',
};

const BONE_KEYS = Object.keys(BONE_ENTITY_NAMES) as BoneKey[];

type GestureKind =
  | 'nod'
  | 'tilt-left'
  | 'tilt-right'
  | 'glance-left'
  | 'glance-right'
  | 'lean-in'
  | 'lean-back'
  | 'shoulder-shift'
  | 'emphasis';

const SPEAKING_GESTURES: readonly GestureKind[] = [
  'nod',
  'glance-left',
  'glance-right',
  'lean-in',
  'emphasis',
  'shoulder-shift',
];

const LISTENING_GESTURES: readonly GestureKind[] = [
  'nod',
  'tilt-left',
  'tilt-right',
  'glance-left',
  'glance-right',
  'lean-in',
  'lean-back',
];

const GESTURE_DURATION: Record<GestureKind, number> = {
  nod: 0.55,
  'tilt-left': 1.0,
  'tilt-right': 1.0,
  'glance-left': 0.9,
  'glance-right': 0.9,
  'lean-in': 1.25,
  'lean-back': 1.0,
  'shoulder-shift': 1.1,
  emphasis: 0.7,
};

interface BonePose {
  entity: pc.Entity;
  restRotation: pc.Quat;
}

interface BoneOffset {
  pitch: number;
  yaw: number;
  tilt: number;
}

interface ActiveGesture {
  kind: GestureKind;
  elapsed: number;
  duration: number;
  strength: number;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / Math.max(1e-6, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function damp(current: number, target: number, lambda: number, dt: number): number {
  return target + (current - target) * Math.exp(-lambda * dt);
}

/**
 * 在角色已有 Idle/Talk 动画之上叠加程序化骨骼微动作。
 *
 * 动画组件每个 `animationUpdate` 会先写入骨骼的局部姿态，而游戏循环的
 * `update` 在它之后执行，所以这里读取到的局部旋转就是本帧动画结果；
 * 叠加偏移不会跨帧累积。没有动画组件时退回静息姿态，避免骨骼漂移。
 *
 * 局部轴与 Blender 烘焙的骨架一致：X 为点头/前后俯仰，Y 为左右偏航，
 * Z 为左右侧倾；手臂只做很小的局部旋转，避免与 Talk 动作抢主导。
 */
export class NpcGesture {
  private readonly profile: NpcGestureProfile;
  private readonly reducedMotion: boolean;
  private readonly animated: boolean;
  private readonly bones = new Map<BoneKey, BonePose>();
  private readonly offsets: Record<BoneKey, BoneOffset> = {
    hips: { pitch: 0, yaw: 0, tilt: 0 },
    spine: { pitch: 0, yaw: 0, tilt: 0 },
    chest: { pitch: 0, yaw: 0, tilt: 0 },
    neck: { pitch: 0, yaw: 0, tilt: 0 },
    head: { pitch: 0, yaw: 0, tilt: 0 },
    upperArmL: { pitch: 0, yaw: 0, tilt: 0 },
    upperArmR: { pitch: 0, yaw: 0, tilt: 0 },
    lowerArmL: { pitch: 0, yaw: 0, tilt: 0 },
    lowerArmR: { pitch: 0, yaw: 0, tilt: 0 },
    handL: { pitch: 0, yaw: 0, tilt: 0 },
    handR: { pitch: 0, yaw: 0, tilt: 0 },
  };

  private readonly deltaQuat = new pc.Quat();
  private readonly outQuat = new pc.Quat();
  private readonly baseQuat = new pc.Quat();

  private elapsed = 0;
  private activation = 0;
  private wasActive = false;
  private applied = false;
  private seeded = 0x9e3779b9;
  private seed = 0x9e3779b9;
  private nextGestureAt = 0;
  private gesture: ActiveGesture | null = null;
  private gestureEnvelope = 0;
  private disposed = false;

  constructor(
    root: pc.Entity,
    profile: NpcGestureProfile = DEFAULT_NPC_GESTURE_PROFILE,
    options: { reducedMotion?: boolean; animated?: boolean } = {},
  ) {
    this.profile = profile;
    this.reducedMotion = options.reducedMotion ?? prefersReducedMotion();
    // 默认由实例是否带动画组件决定；测试可显式注入，模拟动画每帧重置骨骼。
    this.animated = options.animated ?? root.anim !== undefined;
    // 用角色名派生稳定种子，让同一个角色每次对话的微动作顺序一致。
    for (let i = 0; i < root.name.length; i++) {
      this.seeded = (this.seeded * 31 + root.name.charCodeAt(i)) >>> 0;
    }
    this.seed = this.seeded;

    for (const key of BONE_KEYS) {
      const node = root.findByName(BONE_ENTITY_NAMES[key]);
      if (node instanceof pc.Entity) {
        this.bones.set(key, {
          entity: node,
          restRotation: node.getLocalRotation().clone(),
        });
      }
    }
  }

  /**
   * @param dt 帧间隔。
   * @param active 是否处于对话中；关闭对话后会自动淡出。
   * @param speaking 当前是否轮到 NPC 说话；false 时按倾听状态处理。
   */
  update(dt: number, active: boolean, speaking: boolean): void {
    if (this.disposed || this.reducedMotion || this.bones.size === 0) {
      return;
    }

    const step = Math.min(Math.max(dt, 0), MAX_STEP);
    if (step <= 0) {
      return;
    }

    if (active && !this.wasActive) {
      this.resetMotion();
    }
    this.wasActive = active;

    this.activation = damp(this.activation, active ? 1 : 0, active ? 5 : 3, step);
    if (this.activation < 0.001) {
      if (this.applied) {
        this.restoreBones();
      }
      return;
    }

    this.elapsed += step;
    this.updateGesture(step, speaking);

    const profile = this.profile;
    const t = this.elapsed * profile.tempo;
    const phase = profile.phase;
    const energy = profile.energy;
    const breath = Math.sin(t * TWO_PI * 0.22 + phase);
    const sway = Math.sin(t * TWO_PI * 0.05 + phase * 0.8);
    const swayAlt = Math.cos(t * TWO_PI * 0.043 + phase * 1.4);
    const micro = Math.sin(t * TWO_PI * 0.11 + phase * 0.5);

    this.clearOffsets();

    const head = this.offsets.head;
    head.pitch = (micro * 0.8 + breath * 0.3) * energy;
    head.yaw =
      (Math.sin(t * TWO_PI * 0.061 + phase) * 1.6 +
        Math.sin(t * TWO_PI * 0.017 + phase * 2.1) * 0.8) *
      energy;
    head.tilt = Math.sin(t * TWO_PI * 0.049 + phase * 1.6) * 1.0 * energy;

    const neck = this.offsets.neck;
    neck.pitch = head.pitch * 0.25;
    neck.yaw = head.yaw * 0.3;
    neck.tilt = head.tilt * 0.25;

    const chest = this.offsets.chest;
    chest.pitch = breath * 0.55 * energy;
    chest.yaw = -sway * 0.9 * energy;
    chest.tilt = swayAlt * 0.45 * energy;

    const spine = this.offsets.spine;
    spine.pitch = breath * 0.25 * energy;
    spine.yaw = -sway * 0.4 * energy;

    const hips = this.offsets.hips;
    hips.yaw = sway * 0.9 * profile.weightShift * energy;
    hips.tilt = swayAlt * 0.55 * profile.weightShift * energy;

    let armSwing = 0;
    if (speaking) {
      const speech = this.speechEnvelope(t) * profile.speech * energy;
      head.pitch += speech * 1.4;
      head.yaw += Math.sin(t * TWO_PI * 0.73 + phase) * 0.5 * speech;
      neck.pitch += speech * 0.3;
      chest.pitch += speech * 0.35;
      armSwing += speech * 1.1 * profile.hands;
    }
    this.applyGestureEnvelope();
    armSwing += this.gestureEnvelope * 1.0 * profile.hands;

    this.offsets.upperArmL.pitch = armSwing * 0.5;
    this.offsets.upperArmL.tilt = armSwing * 0.2;
    this.offsets.upperArmR.pitch = armSwing * 0.35;
    this.offsets.upperArmR.tilt = armSwing * 0.15;
    this.offsets.lowerArmL.pitch = armSwing * 0.75;
    this.offsets.lowerArmR.pitch = armSwing * 0.55;
    this.offsets.handL.pitch = armSwing * 0.9;
    this.offsets.handR.pitch = armSwing * 0.7;

    this.applyOffsets(this.activation);
    this.applied = true;
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.bones.clear();
  }

  private resetMotion(): void {
    this.elapsed = 0;
    this.activation = 0;
    this.seed = this.seeded;
    this.gesture = null;
    this.gestureEnvelope = 0;
    this.nextGestureAt = 0.8 + this.random() * 1.8;
  }

  private random(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  private updateGesture(step: number, speaking: boolean): void {
    const gesture = this.gesture;
    if (gesture) {
      gesture.elapsed += step;
      const progress = clamp01(gesture.elapsed / gesture.duration);
      this.gestureEnvelope = Math.sin(Math.PI * progress) * gesture.strength;
      if (progress >= 1) {
        this.gesture = null;
        this.gestureEnvelope = 0;
        this.nextGestureAt =
          this.elapsed + (speaking ? 1.4 : 2.4) + this.random() * (speaking ? 2.4 : 3.6);
      }
      return;
    }

    this.gestureEnvelope = 0;
    if (this.elapsed < this.nextGestureAt) {
      return;
    }

    const choices = speaking ? SPEAKING_GESTURES : LISTENING_GESTURES;
    const kind = choices[Math.floor(this.random() * choices.length)] ?? 'nod';
    this.gesture = {
      kind,
      elapsed: 0,
      duration: GESTURE_DURATION[kind] * (0.85 + this.random() * 0.4),
      strength: 0.6 + this.random() * 0.5,
    };
  }

  /** 说话时用两条不可通约的“音节”频率叠加，再乘以慢速短语包络，形成停顿。 */
  private speechEnvelope(t: number): number {
    const syllable =
      0.55 + 0.45 * Math.sin(t * TWO_PI * 2.4 + Math.sin(t * TWO_PI * 0.3) * 1.7);
    const syllableAlt = 0.5 + 0.5 * Math.sin(t * TWO_PI * 3.7 + 0.9);
    const phrase = smoothstep(
      0.28,
      0.72,
      0.5 + 0.5 * Math.sin(t * TWO_PI * 0.19 + this.profile.phase),
    );
    return (0.55 * syllable + 0.45 * syllableAlt) * phrase;
  }

  private applyGestureEnvelope(): void {
    const amount = this.gestureEnvelope;
    if (amount <= 0) {
      return;
    }
    const kind = this.gesture?.kind;
    const head = this.offsets.head;
    const neck = this.offsets.neck;
    const chest = this.offsets.chest;
    const spine = this.offsets.spine;
    const hips = this.offsets.hips;

    switch (kind) {
      case 'nod':
        head.pitch += 2.2 * amount;
        neck.pitch += 0.7 * amount;
        chest.pitch += 0.3 * amount;
        break;
      case 'tilt-left':
        head.tilt += 2.0 * amount;
        neck.tilt += 0.5 * amount;
        chest.tilt += 0.3 * amount;
        break;
      case 'tilt-right':
        head.tilt -= 2.0 * amount;
        neck.tilt -= 0.5 * amount;
        chest.tilt -= 0.3 * amount;
        break;
      case 'glance-left':
        head.yaw += 2.4 * amount;
        neck.yaw += 0.7 * amount;
        break;
      case 'glance-right':
        head.yaw -= 2.4 * amount;
        neck.yaw -= 0.7 * amount;
        break;
      case 'lean-in':
        chest.pitch += 1.3 * amount;
        spine.pitch += 0.5 * amount;
        head.pitch -= 0.6 * amount;
        break;
      case 'lean-back':
        chest.pitch -= 0.9 * amount;
        spine.pitch -= 0.3 * amount;
        break;
      case 'shoulder-shift':
        chest.tilt += 0.9 * amount;
        chest.yaw += 0.7 * amount;
        hips.tilt -= 0.3 * amount;
        break;
      case 'emphasis':
        head.pitch += 2.6 * amount;
        chest.pitch += 0.7 * amount;
        break;
      case undefined:
        break;
    }
  }

  private clearOffsets(): void {
    for (const key of BONE_KEYS) {
      const offset = this.offsets[key];
      offset.pitch = 0;
      offset.yaw = 0;
      offset.tilt = 0;
    }
  }

  private applyOffsets(weight: number): void {
    for (const key of BONE_KEYS) {
      const bone = this.bones.get(key);
      if (!bone) {
        continue;
      }
      const offset = this.offsets[key];
      if (offset.pitch === 0 && offset.yaw === 0 && offset.tilt === 0) {
        continue;
      }
      this.baseQuat.copy(
        this.animated ? bone.entity.getLocalRotation() : bone.restRotation,
      );
      this.deltaQuat.setFromEulerAngles(
        offset.pitch * weight,
        offset.yaw * weight,
        offset.tilt * weight,
      );
      this.outQuat.mul2(this.baseQuat, this.deltaQuat);
      bone.entity.setLocalRotation(this.outQuat);
    }
  }

  private restoreBones(): void {
    if (this.animated) {
      // 有动画组件时下一帧会用动画姿态覆盖，不需要手动还原。
      this.applied = false;
      return;
    }
    for (const bone of this.bones.values()) {
      bone.entity.setLocalRotation(bone.restRotation);
    }
    this.applied = false;
  }
}
