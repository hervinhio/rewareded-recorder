export type EventHandler = (data?: any) => void;

type Event = 'group_updated' | 'publisher_updated' | 'repport_updated';

class EventsHandler {
  private handlers: Map<Event, EventHandler[]> = new Map();

  registerEventHandler(event: Event, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }

    this.handlers.get(event)?.push(handler);
  }

  unregisterEventHandler(event: Event, handler: EventHandler): void {
    if (!this.handlers.has(event)) return;

    const registeredHandlers = this.handlers.get(event);
    const indexOfHandler = registeredHandlers?.indexOf(handler);

    if (indexOfHandler === -1) {
      return;
    }

    registeredHandlers?.splice(indexOfHandler || 0, 1);
  }

  emit(event: Event, data?: any): void {
    this.handlers.get(event)?.forEach((handler: EventHandler) => {
      handler(data);
    });
  }
}

export class Events {
  private static handler = new EventsHandler();

  static on(event: Event, handler: EventHandler): void {
    Events.handler.registerEventHandler(event, handler);
  }

  static off(event: Event, handler: EventHandler): void {
    Events.handler.unregisterEventHandler(event, handler);
  }

  static emit(event: Event, data?: any): void {
    Events.handler.emit(event, data);
  }
}
