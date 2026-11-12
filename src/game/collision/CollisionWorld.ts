import type { Vec3Tuple } from '../../shared/types/save';
import type { SceneDefinition, WalkSurface } from '../../shared/types/scene';
import { doorBounds, doorColliderId } from '../scene/sceneGeometry.ts';

export const PLAYER_RADIUS = 0.3;
export const PLAYER_HEIGHT = 1.8;
/** 低于这个高度的障碍与台阶可以直接跨上去。 */
export const STEP_UP = 0.35;
/** 一步之内允许的最大下落高度；超过则视为悬空，拒绝移动。 */
export const MAX_DROP = 0.6;

const SUBSTEP = 0.1;
const RESOLVE_PASSES = 4;
const PENETRATION_EPSILON = 1e-4;

interface Collider {
  id: string;
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  enabled: boolean;
}

/**
 * 轻量碰撞世界：玩家是竖直圆柱，障碍是轴对齐盒，地面是平面或单向斜坡。
 * 不依赖 PlayCanvas，便于在 Node 中测试。
 */
export class CollisionWorld {
  private readonly colliders: Collider[] = [];
  private readonly byId = new Map<string, Collider>();
  private readonly surfaces: WalkSurface[] = [];
  private readonly scratch: [number, number] = [0, 0];

  addBox(id: string, min: Vec3Tuple, max: Vec3Tuple): void {
    if (this.byId.has(id)) {
      throw new Error(`碰撞盒 ID 重复：${id}`);
    }
    const collider: Collider = {
      id,
      minX: min[0],
      minY: min[1],
      minZ: min[2],
      maxX: max[0],
      maxY: max[1],
      maxZ: max[2],
      enabled: true,
    };
    this.colliders.push(collider);
    this.byId.set(id, collider);
  }

  addSurface(surface: WalkSurface): void {
    this.surfaces.push(surface);
  }

  setEnabled(id: string, enabled: boolean): void {
    const collider = this.byId.get(id);
    if (!collider) {
      throw new Error(`未知的碰撞盒：${id}`);
    }
    collider.enabled = enabled;
  }

  /** 返回脚下可站立的最高地面；没有地面时返回 null。 */
  groundHeight(x: number, z: number, feetY: number): number | null {
    const limit = feetY + STEP_UP;
    let best: number | null = null;
    for (const surface of this.surfaces) {
      if (
        x < surface.minX ||
        x > surface.maxX ||
        z < surface.minZ ||
        z > surface.maxZ
      ) {
        continue;
      }
      const height = surfaceHeight(surface, x, z);
      if (height <= limit && (best === null || height > best)) {
        best = height;
      }
    }
    return best;
  }

  /** 该位置能否站人：有地面，且不与任何障碍重叠。 */
  isStandable(
    x: number,
    z: number,
    feetY: number,
    radius: number,
    height = PLAYER_HEIGHT,
  ): boolean {
    const ground = this.groundHeight(x, z, feetY);
    if (ground === null) {
      return false;
    }
    return this.penetration(x, z, ground, radius, height) <= PENETRATION_EPSILON;
  }

  /**
   * 从 (x, feetY, z) 尝试水平移动 (dx, dz)，把结果写入 out。
   * 贴墙时沿墙滑动；前方悬空或落差过大时停在原地。
   */
  move(
    out: Vec3Tuple,
    x: number,
    feetY: number,
    z: number,
    dx: number,
    dz: number,
    radius: number,
    height = PLAYER_HEIGHT,
  ): void {
    const distance = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.ceil(distance / SUBSTEP));
    const stepX = dx / steps;
    const stepZ = dz / steps;

    out[0] = x;
    out[1] = feetY;
    out[2] = z;

    for (let index = 0; index < steps; index += 1) {
      const moved =
        this.tryStep(out, out[0] + stepX, out[2] + stepZ, radius, height) ||
        this.tryStep(out, out[0] + stepX, out[2], radius, height) ||
        this.tryStep(out, out[0], out[2] + stepZ, radius, height);
      if (!moved) {
        return;
      }
    }
  }

  /**
   * 从 (x, feetY, z) 尝试空中水平移动 (dx, dz)，只解决与障碍的重叠，
   * 不做台阶吸附与落差限制。脚底高度保持不变，由调用方处理重力与落地。
   */
  moveAirborne(
    out: Vec3Tuple,
    x: number,
    feetY: number,
    z: number,
    dx: number,
    dz: number,
    radius: number,
    height = PLAYER_HEIGHT,
  ): void {
    const distance = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.ceil(distance / SUBSTEP));
    const stepX = dx / steps;
    const stepZ = dz / steps;

    out[0] = x;
    out[1] = feetY;
    out[2] = z;

    for (let index = 0; index < steps; index += 1) {
      const resolved = this.scratch;
      resolved[0] = out[0] + stepX;
      resolved[1] = out[2] + stepZ;

      for (let pass = 0; pass < RESOLVE_PASSES; pass += 1) {
        if (!this.pushOut(resolved, feetY, radius, height)) {
          break;
        }
      }

      if (
        this.penetration(resolved[0], resolved[1], feetY, radius, height) >
        PENETRATION_EPSILON
      ) {
        return;
      }
      if (
        Math.abs(resolved[0] - out[0]) < 1e-6 &&
        Math.abs(resolved[1] - out[2]) < 1e-6
      ) {
        return;
      }

      out[0] = resolved[0];
      out[2] = resolved[1];
    }
  }

  /**
   * 返回脚下到头顶之间最低的障碍底面高度；没有遮挡时返回 null。
   * 低于跨步高度的盒子视为台阶或地面家具，不计入头顶遮挡。
   */
  ceilingHeight(
    x: number,
    z: number,
    feetY: number,
    radius: number,
  ): number | null {
    let lowest: number | null = null;
    for (const collider of this.colliders) {
      if (!collider.enabled || collider.minY <= feetY + STEP_UP) {
        continue;
      }
      const offsetX = x - clamp(x, collider.minX, collider.maxX);
      const offsetZ = z - clamp(z, collider.minZ, collider.maxZ);
      if (offsetX * offsetX + offsetZ * offsetZ >= radius * radius) {
        continue;
      }
      if (lowest === null || collider.minY < lowest) {
        lowest = collider.minY;
      }
    }
    return lowest;
  }

  /** 返回射线命中最近障碍的距离；未命中返回 null。起点在盒内的障碍被忽略。 */
  raycast(
    ox: number,
    oy: number,
    oz: number,
    dx: number,
    dy: number,
    dz: number,
    maxDistance: number,
  ): number | null {
    let nearest: number | null = null;
    for (const collider of this.colliders) {
      if (!collider.enabled) {
        continue;
      }
      const limit = nearest ?? maxDistance;
      const hitX = slab(ox, dx, collider.minX, collider.maxX, 0, limit);
      if (hitX === null) {
        continue;
      }
      const hitY = slab(oy, dy, collider.minY, collider.maxY, hitX[0], hitX[1]);
      if (hitY === null) {
        continue;
      }
      const hitZ = slab(oz, dz, collider.minZ, collider.maxZ, hitY[0], hitY[1]);
      if (hitZ === null) {
        continue;
      }

      // 进入距离不大于 0 说明起点在盒内，忽略。
      const entry = hitZ[0];
      if (entry > 0 && (nearest === null || entry < nearest)) {
        nearest = entry;
      }
    }
    return nearest;
  }

  private tryStep(
    state: Vec3Tuple,
    targetX: number,
    targetZ: number,
    radius: number,
    height: number,
  ): boolean {
    const feetY = state[1];
    const resolved = this.scratch;
    resolved[0] = targetX;
    resolved[1] = targetZ;

    for (let pass = 0; pass < RESOLVE_PASSES; pass += 1) {
      if (!this.pushOut(resolved, feetY, radius, height)) {
        break;
      }
    }

    const x = resolved[0];
    const z = resolved[1];
    if (this.penetration(x, z, feetY, radius, height) > PENETRATION_EPSILON) {
      return false;
    }

    const ground = this.groundHeight(x, z, feetY);
    if (ground === null || ground < feetY - MAX_DROP) {
      return false;
    }

    if (
      Math.abs(x - state[0]) < 1e-6 &&
      Math.abs(z - state[2]) < 1e-6
    ) {
      return false;
    }

    state[0] = x;
    state[1] = ground;
    state[2] = z;
    return true;
  }

  /** 把圆从所有重叠的障碍里推出去；发生过推动时返回 true。 */
  private pushOut(
    position: [number, number],
    feetY: number,
    radius: number,
    height: number,
  ): boolean {
    let pushed = false;
    for (const collider of this.colliders) {
      if (!overlapsBody(collider, feetY, height)) {
        continue;
      }
      const x = position[0];
      const z = position[1];
      const nearestX = clamp(x, collider.minX, collider.maxX);
      const nearestZ = clamp(z, collider.minZ, collider.maxZ);
      const offsetX = x - nearestX;
      const offsetZ = z - nearestZ;
      const distanceSq = offsetX * offsetX + offsetZ * offsetZ;
      if (distanceSq >= radius * radius) {
        continue;
      }

      if (distanceSq > 1e-12) {
        const distance = Math.sqrt(distanceSq);
        const push = (radius - distance) / distance;
        position[0] = x + offsetX * push;
        position[1] = z + offsetZ * push;
      } else {
        // 圆心落在盒内：沿穿透最浅的轴推出。
        const left = x - collider.minX;
        const right = collider.maxX - x;
        const back = z - collider.minZ;
        const front = collider.maxZ - z;
        const smallest = Math.min(left, right, back, front);
        if (smallest === left) {
          position[0] = collider.minX - radius;
        } else if (smallest === right) {
          position[0] = collider.maxX + radius;
        } else if (smallest === back) {
          position[1] = collider.minZ - radius;
        } else {
          position[1] = collider.maxZ + radius;
        }
      }
      pushed = true;
    }
    return pushed;
  }

  private penetration(
    x: number,
    z: number,
    feetY: number,
    radius: number,
    height: number,
  ): number {
    let deepest = 0;
    for (const collider of this.colliders) {
      if (!overlapsBody(collider, feetY, height)) {
        continue;
      }
      const offsetX = x - clamp(x, collider.minX, collider.maxX);
      const offsetZ = z - clamp(z, collider.minZ, collider.maxZ);
      const depth = radius - Math.hypot(offsetX, offsetZ);
      if (depth > deepest) {
        deepest = depth;
      }
    }
    return deepest;
  }
}

/** 由场景定义建立碰撞世界；每扇门登记一个可开关的碰撞盒。 */
export function createCollisionWorld(scene: SceneDefinition): CollisionWorld {
  const world = new CollisionWorld();
  for (const box of scene.boxes) {
    if (box.collide) {
      world.addBox(box.id, box.min, box.max);
    }
  }
  for (const surface of scene.surfaces) {
    world.addSurface(surface);
  }
  for (const door of scene.doors) {
    const bounds = doorBounds(door);
    world.addBox(doorColliderId(door.id), bounds.min, bounds.max);
  }
  return world;
}

function surfaceHeight(surface: WalkSurface, x: number, z: number): number {
  if (surface.y0 === surface.y1) {
    return surface.y0;
  }
  const t =
    surface.axis === 'x'
      ? (x - surface.minX) / (surface.maxX - surface.minX)
      : (z - surface.minZ) / (surface.maxZ - surface.minZ);
  return surface.y0 + (surface.y1 - surface.y0) * t;
}

function overlapsBody(
  collider: Collider,
  feetY: number,
  height: number,
): boolean {
  return (
    collider.enabled &&
    collider.maxY > feetY + STEP_UP &&
    collider.minY < feetY + height
  );
}

function slab(
  origin: number,
  direction: number,
  min: number,
  max: number,
  tMin: number,
  tMax: number,
): [number, number] | null {
  if (Math.abs(direction) < 1e-9) {
    return origin < min || origin > max ? null : [tMin, tMax];
  }
  let near = (min - origin) / direction;
  let far = (max - origin) / direction;
  if (near > far) {
    [near, far] = [far, near];
  }
  const nextMin = Math.max(tMin, near);
  const nextMax = Math.min(tMax, far);
  return nextMin > nextMax ? null : [nextMin, nextMax];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
