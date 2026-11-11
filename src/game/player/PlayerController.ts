import * as pc from 'playcanvas';
import type { Vec3Tuple } from '../../shared/types/save';
import { PLAYER_RADIUS, type CollisionWorld } from '../collision/CollisionWorld.ts';

const WALK_SPEED = 2.6;
const RUN_SPEED = 4.4;
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
  /** 视点相对脚底的高度；root 实体位于视点处。 */
  eyeHeight: number;
}

export class PlayerController {
  readonly root: pc.Entity;
  readonly camera: pc.Entity;

  private readonly app: pc.Application;
  private readonly canvas: HTMLCanvasElement;
  private readonly collision: CollisionWorld;
  private readonly eyeHeight: number;
  private readonly moved: Vec3Tuple = [0, 0, 0];
  private readonly move = new pc.Vec3();
  private readonly forward = new pc.Vec3();
  private readonly right = new pc.Vec3();
  private readonly position = new pc.Vec3();
  private sensitivity: number;
  private yaw: number;
  private pitch: number;
  private paused = true;

  constructor(options: PlayerControllerOptions) {
    this.app = options.app;
    this.canvas = options.canvas;
    this.root = options.root;
    this.camera = options.camera;
    this.collision = options.collision;
    this.eyeHeight = options.eyeHeight;
    this.sensitivity = options.sensitivity;
    this.yaw = options.rotation[0];
    this.pitch = options.rotation[1];

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

    if (this.move.lengthSq() === 0) {
      return;
    }

    this.move.normalize();
    const speed = keyboard.isPressed(pc.KEY_SHIFT) ? RUN_SPEED : WALK_SPEED;
    this.move.mulScalar(speed * dt);

    this.position.copy(this.root.getPosition());
    this.collision.move(
      this.moved,
      this.position.x,
      this.position.y - this.eyeHeight,
      this.position.z,
      this.move.x,
      this.move.z,
      PLAYER_RADIUS,
    );
    this.root.setPosition(
      this.moved[0],
      this.moved[1] + this.eyeHeight,
      this.moved[2],
    );
  }

  getPosition(): Vec3Tuple {
    this.position.copy(this.root.getPosition());
    return [this.position.x, this.position.y, this.position.z];
  }

  getRotation(): Vec3Tuple {
    return [this.yaw, this.pitch, 0];
  }

  dispose(): void {
    document.removeEventListener('pointermove', this.handlePointerMove);
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
