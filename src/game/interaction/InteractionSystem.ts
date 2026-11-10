import * as pc from 'playcanvas';

export interface InteractionContext {
  camera: pc.Entity;
  playerPosition: pc.Vec3;
}

export interface Interactable {
  id: string;
  entity: pc.Entity;
  radius: number;
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

  constructor(maxDistance = 3) {
    this.maxDistance = maxDistance;
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
