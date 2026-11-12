import * as pc from 'playcanvas';
import type { Vec3Tuple } from '../../shared/types/save';
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

export interface PlayerControllerOptions {
  app: pc.Application;
  canvas: HTMLCanvasElement;
  root: pc.Entity;
  camera: pc.Entity;
  sensitivity: number;
  rotation: Vec3Tuple;
  collision: CollisionWorld;
  /** 站立时视点相对脚底的高度；root 实体位于视点处。 */
  eyeHeight: number;
}

export class PlayerController {
  readonly root: pc.Entity;
  readonly camera: pc.Entity;

  private readonly app: pc.Application;
  private readonly canvas: HTMLCanvasElement;
  private readonly collision: CollisionWorld;
  private readonly standingEyeHeight: number;
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

  constructor(options: PlayerControllerOptions) {
    this.app = options.app;
    this.canvas = options.canvas;
    this.root = options.root;
    this.camera = options.camera;
    this.collision = options.collision;
    this.standingEyeHeight = options.eyeHeight;
    this.eyeHeight = options.eyeHeight;
    this.sensitivity = options.sensitivity;
    this.yaw = options.rotation[0];
    this.pitch = options.rotation[1];

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
    if (this.move.lengthSq() > 0) {
      const speed = this.crouched
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
    this.syncRoot();
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
      this.feet.y = ground;
      this.verticalVelocity = 0;
      this.grounded = true;
      return;
    }

    this.feet.y = nextY;
  }

  private syncRoot(): void {
    this.root.setPosition(this.feet.x, this.feet.y + this.eyeHeight, this.feet.z);
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
    this.camera.setLocalEulerAngles(this.pitch, 0, 0);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
