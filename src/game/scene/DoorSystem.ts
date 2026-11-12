import type { SceneDoor } from '../../shared/types/scene';
import type { CollisionWorld } from '../collision/CollisionWorld.ts';
import { isAnyConditionGroupMet, type StoryFlags } from '../story/conditions.ts';
import { doorCenter, doorColliderId } from './sceneGeometry.ts';

/** 玩家离门扇中心比这更近时不允许关门，避免把人夹在门里。 */
const CLOSE_CLEARANCE = 0.9;
/** 玩家主动打开的门，在无人靠近时过这么久会自动合上（秒）。 */
export const AUTO_CLOSE_DELAY = 4;

export type DoorUseResult =
  | { kind: 'opened' }
  | { kind: 'closed' }
  | { kind: 'locked'; message: string }
  | { kind: 'blocked'; message: string };

export interface DoorSystemOptions {
  doors: readonly SceneDoor[];
  collision: CollisionWorld;
  getFlags: () => StoryFlags;
  /** 仅供开发期灰盒走查：忽略剧情解锁条件。永久锁闭的装饰门不受影响。 */
  unlockAll: boolean;
  onChange: (doorId: string, open: boolean) => void;
}

/**
 * 门的运行时状态。是否上锁始终由剧情标记实时推导，不单独存储，
 * 因此读档后不会出现「门锁状态与剧情进度不一致」。
 */
export class DoorSystem {
  private readonly doors = new Map<string, SceneDoor>();
  private readonly open = new Map<string, boolean>();
  /** 玩家主动打开、等待自动关上的门，值为剩余秒数。 */
  private readonly autoCloseTimers = new Map<string, number>();
  private readonly collision: CollisionWorld;
  private readonly getFlags: () => StoryFlags;
  private readonly unlockAll: boolean;
  private readonly onChange: (doorId: string, open: boolean) => void;

  constructor(options: DoorSystemOptions) {
    this.collision = options.collision;
    this.getFlags = options.getFlags;
    this.unlockAll = options.unlockAll;
    this.onChange = options.onChange;

    for (const door of options.doors) {
      this.doors.set(door.id, door);
      const startsOpen = door.startsOpen && !door.sealed;
      this.open.set(door.id, startsOpen);
      this.collision.setEnabled(doorColliderId(door.id), !startsOpen);
    }
  }

  isOpen(doorId: string): boolean {
    return this.open.get(doorId) ?? false;
  }

  isLocked(doorId: string): boolean {
    const door = this.requireDoor(doorId);
    if (door.sealed) {
      return true;
    }
    if (this.unlockAll || door.unlockWhen === undefined) {
      return false;
    }
    return !isAnyConditionGroupMet(this.getFlags(), door.unlockWhen);
  }

  getPrompt(doorId: string): string {
    const door = this.requireDoor(doorId);
    if (this.isOpen(doorId)) {
      return `关上${door.name}`;
    }
    return this.isLocked(doorId) ? `${door.name}（锁着）` : `打开${door.name}`;
  }

  use(doorId: string, playerX: number, playerZ: number): DoorUseResult {
    const door = this.requireDoor(doorId);

    if (this.isOpen(doorId)) {
      const [centerX, , centerZ] = doorCenter(door);
      if (Math.hypot(playerX - centerX, playerZ - centerZ) < CLOSE_CLEARANCE) {
        return { kind: 'blocked', message: '站开一点才能关门。' };
      }
      this.setOpen(door, false);
      return { kind: 'closed' };
    }

    if (this.isLocked(doorId)) {
      return { kind: 'locked', message: door.lockedMessage };
    }

    this.setOpen(door, true);
    this.autoCloseTimers.set(door.id, AUTO_CLOSE_DELAY);
    return { kind: 'opened' };
  }

  /**
   * 推进自动关门计时。玩家主动打开的门过一会儿会自己合上；
   * 计时到点时玩家还站在门边就先不关，等他走开后再关。
   * 初始就敞开（或由脚本打开）的门不计时，避免进场后门自己关上。
   */
  update(dt: number, playerX: number, playerZ: number): void {
    for (const [doorId, remaining] of this.autoCloseTimers) {
      const door = this.doors.get(doorId);
      if (!door || !this.isOpen(doorId)) {
        this.autoCloseTimers.delete(doorId);
        continue;
      }

      const next = Math.max(0, remaining - dt);
      if (next > 0) {
        this.autoCloseTimers.set(doorId, next);
        continue;
      }

      const [centerX, , centerZ] = doorCenter(door);
      if (Math.hypot(playerX - centerX, playerZ - centerZ) < CLOSE_CLEARANCE) {
        this.autoCloseTimers.set(doorId, 0);
        continue;
      }

      this.setOpen(door, false);
    }
  }

  private setOpen(door: SceneDoor, open: boolean): void {
    this.open.set(door.id, open);
    if (!open) {
      this.autoCloseTimers.delete(door.id);
    }
    this.collision.setEnabled(doorColliderId(door.id), !open);
    this.onChange(door.id, open);
  }

  private requireDoor(doorId: string): SceneDoor {
    const door = this.doors.get(doorId);
    if (!door) {
      throw new Error(`未知的门：${doorId}`);
    }
    return door;
  }
}
