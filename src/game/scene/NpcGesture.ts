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

export type NpcGestureMode = 'hidden' | 'idle' | 'listen' | 'speak';

type BoneKey =
  | 'hips'
  | 'spine'
  | 'chest'
  | 'neck'
  | 'head'
  | 'clavicleL'
  | 'clavicleR'
  | 'upperArmL'
  | 'upperArmR'
  | 'lowerArmL'
  | 'lowerArmR'
  | 'handL'
  | 'handR'
  | 'fingersL'
  | 'fingersR';

const BONE_ENTITY_NAMES: Record<BoneKey, string> = {
  hips: 'Hips',
  spine: 'Spine',
  chest: 'Chest',
  neck: 'Neck',
  head: 'Head',
  clavicleL: 'Clavicle.L',
  clavicleR: 'Clavicle.R',
  upperArmL: 'UpperArm.L',
  upperArmR: 'UpperArm.R',
  lowerArmL: 'LowerArm.L',
  lowerArmR: 'LowerArm.R',
  handL: 'Hand.L',
  handR: 'Hand.R',
  fingersL: 'Fingers.L',
  fingersR: 'Fingers.R',
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
  baseRotation: pc.Quat;
  appliedRotation: pc.Quat;
  hasOffset: boolean;
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

/** 在 Idle/Talk 播放后叠加轻微骨骼动作，新关节也能在没有动画轨道时工作。 */
export class NpcGesture {
  private readonly profile: NpcGestureProfile;
  private readonly reducedMotion: boolean;
  private readonly bones = new Map<BoneKey, BonePose>();
  private readonly offsets: Record<BoneKey, BoneOffset> = {
    hips: { pitch: 0, yaw: 0, tilt: 0 },
    spine: { pitch: 0, yaw: 0, tilt: 0 },
    chest: { pitch: 0, yaw: 0, tilt: 0 },
    neck: { pitch: 0, yaw: 0, tilt: 0 },
    head: { pitch: 0, yaw: 0, tilt: 0 },
    clavicleL: { pitch: 0, yaw: 0, tilt: 0 },
    clavicleR: { pitch: 0, yaw: 0, tilt: 0 },
    upperArmL: { pitch: 0, yaw: 0, tilt: 0 },
    upperArmR: { pitch: 0, yaw: 0, tilt: 0 },
    lowerArmL: { pitch: 0, yaw: 0, tilt: 0 },
    lowerArmR: { pitch: 0, yaw: 0, tilt: 0 },
    handL: { pitch: 0, yaw: 0, tilt: 0 },
    handR: { pitch: 0, yaw: 0, tilt: 0 },
    fingersL: { pitch: 0, yaw: 0, tilt: 0 },
    fingersR: { pitch: 0, yaw: 0, tilt: 0 },
  };

  private readonly deltaQuat = new pc.Quat();

  private elapsed = 0;
  private activation = 0;
  private wasActive = false;
  private wasVisible = false;
  private speechWeight = 0;
  private seed = 0x9e3779b9;
  private nextGestureAt = 0;
  private gesture: ActiveGesture | null = null;
  private gestureEnvelope = 0;
  private disposed = false;

  constructor(
    root: pc.Entity,
    profile: NpcGestureProfile = DEFAULT_NPC_GESTURE_PROFILE,
    options: { reducedMotion?: boolean } = {},
  ) {
    this.profile = profile;
    this.reducedMotion = options.reducedMotion ?? prefersReducedMotion();
    // 用角色名派生稳定种子，错开不同角色的小动作。
    for (let i = 0; i < root.name.length; i++) {
      this.seed = (this.seed * 31 + root.name.charCodeAt(i)) >>> 0;
    }

    for (const key of BONE_KEYS) {
      const node = root.findByName(BONE_ENTITY_NAMES[key]);
      if (node instanceof pc.Entity) {
        this.bones.set(key, {
          entity: node,
          baseRotation: node.getLocalRotation().clone(),
          appliedRotation: new pc.Quat(),
          hasOffset: false,
        });
      }
    }
  }

  update(dt: number, mode: NpcGestureMode): void {
    if (this.disposed || this.reducedMotion || this.bones.size === 0) {
      return;
    }

    if (mode === 'hidden') {
      if (this.wasVisible) {
        this.restoreBones();
        this.activation = 0;
        this.speechWeight = 0;
        this.wasActive = false;
        this.gesture = null;
        this.gestureEnvelope = 0;
        this.wasVisible = false;
      }
      return;
    }

    const step = Math.min(Math.max(dt, 0), MAX_STEP);
    if (step <= 0) {
      return;
    }

    this.wasVisible = true;
    const active = mode === 'listen' || mode === 'speak';
    const speaking = mode === 'speak';
    if (active && !this.wasActive) {
      this.nextGestureAt = this.elapsed + 0.8 + this.random() * 1.8;
    }
    this.wasActive = active;

    this.activation = damp(this.activation, active ? 1 : 0, active ? 5 : 3, step);
    this.speechWeight = damp(this.speechWeight, speaking ? 1 : 0, speaking ? 12 : 8, step);
    this.elapsed += step;
    this.updateGesture(step, active, speaking);

    const profile = this.profile;
    const t = this.elapsed * profile.tempo;
    const phase = profile.phase;
    const energy = profile.energy * (0.35 + this.activation * 0.65);
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

    const speech = this.speechEnvelope(t) * profile.speech * energy * this.speechWeight;
    head.pitch += speech * 1.4;
    head.yaw += Math.sin(t * TWO_PI * 0.73 + phase) * 0.5 * speech;
    neck.pitch += speech * 0.3;
    chest.pitch += speech * 0.35;
    this.applyGestureEnvelope(this.activation);
    const armSwing = (speech * 1.1 + this.gestureEnvelope * this.activation) * profile.hands;

    this.offsets.upperArmL.pitch = armSwing * 0.5;
    this.offsets.upperArmL.tilt = armSwing * 0.2;
    this.offsets.upperArmR.pitch = armSwing * 0.35;
    this.offsets.upperArmR.tilt = armSwing * 0.15;
    this.offsets.lowerArmL.pitch = armSwing * 0.75;
    this.offsets.lowerArmR.pitch = armSwing * 0.55;
    // 两侧错开呼吸、松手和开口时的动作，让肩线和手部不会同时重复同一节奏。
    const shrug = this.gesture?.kind === 'shoulder-shift'
      ? this.gestureEnvelope * this.activation
      : 0;
    this.offsets.clavicleL.tilt = (breath * 0.48 + sway * 0.3) * profile.energy + speech * 0.65 + shrug;
    this.offsets.clavicleR.tilt = -(breath * 0.38 + swayAlt * 0.28) * profile.energy - speech * 0.35;
    this.offsets.clavicleL.yaw = -swayAlt * 0.45 * energy - shrug * 0.65;
    this.offsets.clavicleR.yaw = sway * 0.45 * energy;

    const releaseL = smoothstep(0.4, 0.95, Math.sin(t * TWO_PI * 0.19 + phase));
    const releaseR = smoothstep(0.4, 0.95, Math.sin(t * TWO_PI * 0.157 + phase + 2.4));
    this.offsets.handL.pitch = armSwing * 0.9 + releaseL * 0.8 * profile.hands;
    this.offsets.handR.pitch = armSwing * 0.7 + releaseR * 0.8 * profile.hands;
    this.offsets.handL.yaw = -releaseL * 0.65 * profile.hands;
    this.offsets.handR.yaw = releaseR * 0.65 * profile.hands;
    this.offsets.fingersL.pitch = (releaseL * 3.2 + speech * 3.1 + armSwing * 0.9) * profile.hands;
    this.offsets.fingersR.pitch = (releaseR * 3.2 + speech * 2.1 + armSwing * 0.7) * profile.hands;

    this.applyOffsets();
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.restoreBones();
    this.bones.clear();
  }

  private random(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  private updateGesture(step: number, active: boolean, speaking: boolean): void {
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
    if (!active || this.elapsed < this.nextGestureAt) {
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

  private applyGestureEnvelope(weight: number): void {
    const amount = this.gestureEnvelope * weight;
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

  private applyOffsets(): void {
    for (const [key, bone] of this.bones) {
      const offset = this.offsets[key];
      const rotation = bone.entity.getLocalRotation();
      // PlayCanvas 只刷新有轨道的骨骼。未被刷新时沿用上一帧的基础姿态，避免偏移累积。
      if (!bone.hasOffset || !rotation.equals(bone.appliedRotation)) {
        bone.baseRotation.copy(rotation);
      }
      if (offset.pitch === 0 && offset.yaw === 0 && offset.tilt === 0) {
        this.restoreBone(bone);
        continue;
      }
      this.deltaQuat.setFromEulerAngles(offset.pitch, offset.yaw, offset.tilt);
      bone.appliedRotation.mul2(bone.baseRotation, this.deltaQuat);
      bone.entity.setLocalRotation(bone.appliedRotation);
      bone.hasOffset = true;
    }
  }

  private restoreBone(bone: BonePose): void {
    if (bone.hasOffset && bone.entity.getLocalRotation().equals(bone.appliedRotation)) {
      bone.entity.setLocalRotation(bone.baseRotation);
    }
    bone.hasOffset = false;
  }

  private restoreBones(): void {
    for (const bone of this.bones.values()) {
      this.restoreBone(bone);
    }
  }
}
