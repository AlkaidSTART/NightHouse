import * as pc from 'playcanvas';
import type { Vec3Tuple } from '../../shared/types/save';
import { CameraShake } from './CameraShake.ts';
import {
  PLAYER_HEIGHT,
  PLAYER_RADIUS,
  type CollisionWorld,
} from '../collision/CollisionWorld.ts';

const WALK_SPEED = 4.4;
const RUN_SPEED = 7.0;
const CROUCH_SPEED = 1.3;
const GRAVITY = 24;
/** 起跳初速度按约 0.9 m 跳跃高度设定。 */
const JUMP_SPEED = 6.6;
const CROUCH_HEIGHT = 1.2;
const CROUCH_EYE_HEIGHT = 0.95;
const EYE_HEIGHT_RESPONSE = 14;
const PITCH_LIMIT = 89;
const DEGREES_PER_PIXEL = 0.15;
/**
 * 步伐摇晃幅度刻意保持很小：这是第一人称最容易引起晕眩的部分。
 * 只做位移，不做滚转（地平线倾斜），否则视线与身体平衡感冲突更强。
 */
const BOB_VERTICAL = 0.017;
const BOB_LATERAL = 0.012;
const BOB_PITCH = 0.05;
/** 每移动一米累计的步态相位，决定摇晃频率随速度变化。 */
const BOB_PHASE_PER_METER = 1.65;
/** 跑步时振幅比走路更大，但保持低频以免晕眩。 */
const BOB_RUN_SCALE = 1.25;
const BOB_BLEND_RESPONSE = 7;
/** 每一步的随机幅度倍率范围；每迈一步重新抽样，避免机械重复。 */
const BOB_GAIN_MIN = 0.8;
const BOB_GAIN_MAX = 1.2;
const BOB_GAIN_RESPONSE = 10;
const BOB_STEP_PHASE = Math.PI;

export interface PlayerControllerOptions {
  app: pc.Application;
  canvas: HTMLCanvasElement;
  root: pc.Entity;
  /**
   * 相机效果层：root 的子节点、camera 的父节点。
   * 步伐摇晃与冲击震动只写这一层，不污染相机的基准变换。
   */
  offset: pc.Entity;
  camera: pc.Entity;
  sensitivity: number;
  rotation: Vec3Tuple;
  collision: CollisionWorld;
  /** 站立时视点相对脚底的高度；root 实体位于视点处。 */
  eyeHeight: number;
}

export class PlayerController {
  readonly root: pc.Entity;
  readonly offset: pc.Entity;
  readonly camera: pc.Entity;

  private readonly app: pc.Application;
  private readonly canvas: HTMLCanvasElement;
  private readonly collision: CollisionWorld;
  private readonly standingEyeHeight: number;
  private readonly shake = new CameraShake();
  private readonly feet = new pc.Vec3();
  private readonly moved: Vec3Tuple = [0, 0, 0];
  private readonly move = new pc.Vec3();
  private readonly forward = new pc.Vec3();
  private readonly right = new pc.Vec3();
  private sensitivity: number;
  private yaw: number;
  private pitch: number;
  private paused = true;
  private eyeHeight: number;
  private bodyHeight = PLAYER_HEIGHT;
  private crouched = false;
  private crouchToggled = false;
  private verticalVelocity = 0;
  private grounded = true;
  private bobPhase = 0;
  private bobAmount = 0;
  private bobGain = 1;
  private bobGainTarget = 1;
  private bobStep = 0;
  private readonly bobScale: number;

  constructor(options: PlayerControllerOptions) {
    this.app = options.app;
    this.canvas = options.canvas;
    this.root = options.root;
    this.offset = options.offset;
    this.camera = options.camera;
    this.collision = options.collision;
    this.standingEyeHeight = options.eyeHeight;
    this.eyeHeight = options.eyeHeight;
    this.sensitivity = options.sensitivity;
    this.yaw = options.rotation[0];
    this.pitch = options.rotation[1];
    this.bobScale = prefersReducedMotion() ? 0 : 1;
    this.shake.setIntensity(this.bobScale);

    const position = this.root.getPosition();
    this.feet.set(position.x, position.y - this.eyeHeight, position.z);

    this.applyRotation();
    document.addEventListener('pointermove', this.handlePointerMove);
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  setSensitivity(sensitivity: number): void {
    this.sensitivity = Math.min(2, Math.max(0.05, sensitivity));
  }

  requestPointerLock(): void {
    if (document.pointerLockElement === this.canvas) {
      return;
    }

    try {
      const request = this.canvas.requestPointerLock() as unknown;
      if (request instanceof Promise) {
        request.catch(() => {
          this.paused = true;
        });
      }
    } catch {
      this.paused = true;
    }
  }

  update(dt: number): void {
    if (this.paused || document.pointerLockElement !== this.canvas) {
      return;
    }

    const keyboard = this.app.keyboard;
    if (!keyboard) {
      return;
    }

    this.updateStance(dt, keyboard);

    this.forward.copy(this.root.forward);
    this.forward.y = 0;
    this.forward.normalize();

    this.right.copy(this.root.right);
    this.right.y = 0;
    this.right.normalize();

    this.move.set(0, 0, 0);
    if (keyboard.isPressed(pc.KEY_W)) {
      this.move.add(this.forward);
    }
    if (keyboard.isPressed(pc.KEY_S)) {
      this.move.sub(this.forward);
    }
    if (keyboard.isPressed(pc.KEY_D)) {
      this.move.add(this.right);
    }
    if (keyboard.isPressed(pc.KEY_A)) {
      this.move.sub(this.right);
    }

    let dx = 0;
    let dz = 0;
    let speed = 0;
    if (this.move.lengthSq() > 0) {
      speed = this.crouched
        ? CROUCH_SPEED
        : keyboard.isPressed(pc.KEY_SHIFT)
          ? RUN_SPEED
          : WALK_SPEED;
      this.move.normalize().mulScalar(speed * dt);
      dx = this.move.x;
      dz = this.move.z;
    }

    this.moveHorizontal(dx, dz);
    this.updateVertical(dt, keyboard);
    this.updateBob(dt, speed);
    this.shake.update(dt);
    this.syncRoot();
  }

  /** 叠加一次冲击震动；强度 0~1，由创伤模型按平方衰减。 */
  addShake(amount: number): void {
    if (this.bobScale <= 0) {
      return;
    }
    this.shake.add(amount);
  }

  /** 脚底位置。区域判定与视线高度无关，需要单独暴露。 */
  getFeetPosition(): Vec3Tuple {
    return [this.feet.x, this.feet.y, this.feet.z];
  }

  /** 存档统一记录站立视线高度，避免蹲下时保存导致重载后脚底下陷。 */
  getPosition(): Vec3Tuple {
    return [this.feet.x, this.feet.y + this.standingEyeHeight, this.feet.z];
  }

  getRotation(): Vec3Tuple {
    return [this.yaw, this.pitch, 0];
  }

  dispose(): void {
    document.removeEventListener('pointermove', this.handlePointerMove);
  }

  private updateStance(dt: number, keyboard: pc.Keyboard): void {
    if (keyboard.wasPressed(pc.KEY_C)) {
      this.crouchToggled = !this.crouchToggled;
    }
    const wantsCrouch = this.crouchToggled || keyboard.isPressed(pc.KEY_CONTROL);

    if (wantsCrouch && !this.crouched) {
      this.crouched = true;
      this.bodyHeight = CROUCH_HEIGHT;
    } else if (!wantsCrouch && this.crouched && this.hasStandingRoom()) {
      this.crouched = false;
      this.bodyHeight = PLAYER_HEIGHT;
    }

    const target = this.crouched ? CROUCH_EYE_HEIGHT : this.standingEyeHeight;
    const blend = 1 - Math.exp(-EYE_HEIGHT_RESPONSE * dt);
    this.eyeHeight += (target - this.eyeHeight) * blend;
  }

  private hasStandingRoom(): boolean {
    const ceiling = this.collision.ceilingHeight(
      this.feet.x,
      this.feet.z,
      this.feet.y,
      PLAYER_RADIUS,
    );
    return ceiling === null || ceiling - this.feet.y >= PLAYER_HEIGHT - 1e-3;
  }

  private moveHorizontal(dx: number, dz: number): void {
    if (dx === 0 && dz === 0) {
      return;
    }

    const out = this.moved;
    if (this.grounded) {
      this.collision.move(
        out,
        this.feet.x,
        this.feet.y,
        this.feet.z,
        dx,
        dz,
        PLAYER_RADIUS,
        this.bodyHeight,
      );
      this.feet.set(out[0], out[1], out[2]);
    } else {
      this.collision.moveAirborne(
        out,
        this.feet.x,
        this.feet.y,
        this.feet.z,
        dx,
        dz,
        PLAYER_RADIUS,
        this.bodyHeight,
      );
      this.feet.x = out[0];
      this.feet.z = out[2];
    }
  }

  private updateVertical(dt: number, keyboard: pc.Keyboard): void {
    if (this.grounded) {
      const ground = this.collision.groundHeight(
        this.feet.x,
        this.feet.z,
        this.feet.y,
      );
      if (ground !== null) {
        this.feet.y = ground;
      }
      if (!keyboard.wasPressed(pc.KEY_SPACE) || this.crouched) {
        return;
      }
      this.verticalVelocity = JUMP_SPEED;
      this.grounded = false;
    }

    this.verticalVelocity -= GRAVITY * dt;
    const ground = this.collision.groundHeight(
      this.feet.x,
      this.feet.z,
      this.feet.y,
    );
    let nextY = this.feet.y + this.verticalVelocity * dt;

    const ceiling = this.collision.ceilingHeight(
      this.feet.x,
      this.feet.z,
      this.feet.y,
      PLAYER_RADIUS,
    );
    if (ceiling !== null) {
      const maxY = Math.max(this.feet.y, ceiling - this.bodyHeight);
      if (nextY > maxY) {
        nextY = maxY;
        if (this.verticalVelocity > 0) {
          this.verticalVelocity = 0;
        }
      }
    }

    if (this.verticalVelocity <= 0 && ground !== null && nextY <= ground) {
      const impact = -this.verticalVelocity;
      this.feet.y = ground;
      this.verticalVelocity = 0;
      this.grounded = true;
      if (impact > 2) {
        this.addShake(Math.min(0.7, 0.15 + (impact - 2) * 0.1));
      }
      return;
    }

    this.feet.y = nextY;
  }

  private updateBob(dt: number, speed: number): void {
    const bobbing = this.bobScale > 0 && this.grounded && speed > 0;
    const speedScale = this.crouched
      ? 0.5
      : speed > WALK_SPEED + 0.01
        ? BOB_RUN_SCALE
        : 1;
    const target = bobbing ? speedScale : 0;
    this.bobAmount += (target - this.bobAmount) * (1 - Math.exp(-BOB_BLEND_RESPONSE * dt));

    if (bobbing) {
      // 相位按移动距离累计：跑动时步频自然更高，停下则平滑归位。
      this.bobPhase += speed * dt * BOB_PHASE_PER_METER;
      const step = Math.floor(this.bobPhase / BOB_STEP_PHASE);
      if (step !== this.bobStep) {
        this.bobStep = step;
        this.bobGainTarget = BOB_GAIN_MIN + Math.random() * (BOB_GAIN_MAX - BOB_GAIN_MIN);
      }
    } else if (this.bobAmount < 1e-3) {
      this.bobAmount = 0;
      this.bobPhase = 0;
      this.bobStep = 0;
      this.bobGain = 1;
      this.bobGainTarget = 1;
    }

    const gainBlend = 1 - Math.exp(-BOB_GAIN_RESPONSE * dt);
    this.bobGain += (this.bobGainTarget - this.bobGain) * gainBlend;
  }

  /** 步伐摇晃与冲击震动都叠加在 offset 层，相机本体只保留基准俯仰。 */
  private applyCameraPose(): void {
    const amount = this.bobAmount * this.bobGain;
    const swing = Math.sin(this.bobPhase);
    // 只在每个落脚点向下压，不让视点浮到站立高度之上。
    const dip = (Math.cos(this.bobPhase * 2) - 1) * 0.5;
    const [shakePitch, shakeYaw, shakeRoll] = this.shake.getOffset();

    this.offset.setLocalPosition(
      BOB_LATERAL * swing * amount,
      BOB_VERTICAL * dip * amount,
      0,
    );
    this.offset.setLocalEulerAngles(
      BOB_PITCH * Math.cos(this.bobPhase * 2) * amount + shakePitch,
      shakeYaw,
      shakeRoll,
    );
    this.camera.setLocalEulerAngles(this.pitch, 0, 0);
  }

  private syncRoot(): void {
    this.root.setPosition(this.feet.x, this.feet.y + this.eyeHeight, this.feet.z);
    this.applyCameraPose();
  }

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.paused || document.pointerLockElement !== this.canvas) {
      return;
    }

    this.yaw -= event.movementX * this.sensitivity * DEGREES_PER_PIXEL;
    this.pitch -= event.movementY * this.sensitivity * DEGREES_PER_PIXEL;
    this.pitch = clamp(this.pitch, -PITCH_LIMIT, PITCH_LIMIT);
    this.applyRotation();
  };

  private applyRotation(): void {
    this.root.setEulerAngles(0, this.yaw, 0);
    this.applyCameraPose();
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 系统开启“减少动态效果”时关闭步伐摇晃，避免眩晕。 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
