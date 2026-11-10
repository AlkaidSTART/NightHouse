type EventHandler<Payload> = (payload: Payload) => void;

export class EventBus<Events extends object> {
  private readonly handlers = new Map<
    keyof Events,
    Set<EventHandler<unknown>>
  >();

  on<K extends keyof Events>(
    type: K,
    handler: EventHandler<Events[K]>,
  ): () => void {
    let handlers = this.handlers.get(type);
    if (!handlers) {
      handlers = new Set();
      this.handlers.set(type, handlers);
    }
    handlers.add(handler as EventHandler<unknown>);

    return () => {
      handlers.delete(handler as EventHandler<unknown>);
    };
  }

  emit<K extends keyof Events>(type: K, payload: Events[K]): void {
    const handlers = this.handlers.get(type);
    if (!handlers) {
      return;
    }
    for (const handler of handlers) {
      (handler as EventHandler<Events[K]>)(payload);
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}
