// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventData = any;
export type EventHandler = (data?: EventData) => void;

type Event =
  | 'group_updated'
  | 'group_deleted'
  | 'publisher_updated'
  | 'publishers_transfered'
  | 'report_updated'
  | 'logout'
  | 'reports_submitted'
  | 'reports_submission_failed'
  | 'publisher_deleted'
  | 'report_deleted'
  | 'attendance_record_updated';

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

  emit(event: Event, data?: EventData): void {
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

  static emit(event: Event, data?: EventData): void {
    Events.handler.emit(event, data);
  }
}
