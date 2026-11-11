import * as pc from 'playcanvas';
import { isOccluded } from './occlusion.ts';

/** 返回视线命中最近障碍的距离；未命中返回 null。 */
export type OcclusionQuery = (
  origin: pc.Vec3,
  direction: pc.Vec3,
  maxDistance: number,
) => number | null;

export interface InteractionContext {
  camera: pc.Entity;
  playerPosition: pc.Vec3;
}

export interface Interactable {
  id: string;
  entity: pc.Entity;
  radius: number;
  /**
   * 交互点位于自身碰撞体内部时（例如门的锚点在门扇厚度中间），
   * 需要额外放宽这段距离，否则会被自己挡住。
   */
  occlusionSlack?: number;
  getPrompt(context: InteractionContext): string | null;
  canInteract(context: InteractionContext): boolean;
  interact(context: InteractionContext): void;
}

export class InteractionSystem {
  private readonly interactables = new Map<string, Interactable>();
  private readonly origin = new pc.Vec3();
  private readonly center = new pc.Vec3();
  private readonly offset = new pc.Vec3();
  private current: Interactable | null = null;
  private currentContext: InteractionContext | null = null;
  private readonly maxDistance: number;
  private readonly occlusion: OcclusionQuery | null;

  constructor(maxDistance = 3, occlusion: OcclusionQuery | null = null) {
    this.maxDistance = maxDistance;
    this.occlusion = occlusion;
  }

  register(interactable: Interactable): void {
    this.interactables.set(interactable.id, interactable);
  }

  unregister(id: string): void {
    this.interactables.delete(id);
    if (this.current?.id === id) {
      this.current = null;
      this.currentContext = null;
    }
  }

  update(camera: pc.Entity, playerPosition: pc.Vec3): string | null {
    const context: InteractionContext = { camera, playerPosition };
    const origin = this.origin.copy(camera.getPosition());
    const direction = camera.forward;
    // 视线对所有目标相同，遮挡只需查询一次。
    const hitDistance = this.occlusion
      ? this.occlusion(origin, direction, this.maxDistance + 1)
      : null;

    let nearest: Interactable | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    let nearestPrompt: string | null = null;

    for (const interactable of this.interactables.values()) {
      if (!interactable.canInteract(context)) {
        continue;
      }

      this.center.copy(interactable.entity.getPosition());
      this.offset.sub2(this.center, origin);

      const projection = this.offset.dot(direction);
      if (projection < 0) {
        continue;
      }

      const perpendicularSq = this.offset.dot(this.offset) - projection * projection;
      const radiusSq = interactable.radius * interactable.radius;
      if (perpendicularSq > radiusSq) {
        continue;
      }

      const halfChord = Math.sqrt(radiusSq - perpendicularSq);
      const distance =
        projection - halfChord >= 0
          ? projection - halfChord
          : projection + halfChord;

      if (distance > this.maxDistance || distance >= nearestDistance) {
        continue;
      }

      if (
        isOccluded(hitDistance, projection - (interactable.occlusionSlack ?? 0))
      ) {
        continue;
      }

      const prompt = interactable.getPrompt(context);
      if (prompt === null) {
        continue;
      }

      nearest = interactable;
      nearestDistance = distance;
      nearestPrompt = prompt;
    }

    this.current = nearest;
    this.currentContext = context;
    return nearestPrompt;
  }

  interact(): Interactable | null {
    const interactable = this.current;
    const context = this.currentContext;
    if (!interactable || !context) {
      return null;
    }

    if (!interactable.canInteract(context)) {
      return null;
    }

    interactable.interact(context);
    return interactable;
  }

  clear(): void {
    this.interactables.clear();
    this.current = null;
    this.currentContext = null;
  }
}
