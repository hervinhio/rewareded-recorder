import { EventsHandler, EventHandler } from './event';

describe('EventsHandler', () => {
    let eventsHandler: EventsHandler;
    const mockEventHandler: EventHandler = jest.fn();

    beforeEach(() => {
        eventsHandler = new EventsHandler();
    });

    it('registerEventHandler should register an event handler correctly', () => {
        const mockEvent = 'group_deleted';
        eventsHandler.registerEventHandler(mockEvent, mockEventHandler);
        expect(eventsHandler['handlers'].get(mockEvent)).toContain(mockEventHandler);
    });

    it('unregisterEventHandler should unregister an event handler correctly', () => {
        const mockEvent = 'group_deleted';
        eventsHandler.registerEventHandler(mockEvent, mockEventHandler);
        eventsHandler.unregisterEventHandler(mockEvent, mockEventHandler);
        expect(eventsHandler['handlers'].get(mockEvent)).not.toContain(mockEventHandler);
    });

    it('emit should call each registered handler correctly', () => {
        const mockEvent = 'group_deleted';
        const mockData = {id: 'test-id'};
        eventsHandler.registerEventHandler(mockEvent, mockEventHandler);
        eventsHandler.emit(mockEvent, mockData);
        expect(mockEventHandler).toHaveBeenCalledWith(mockData);
    });
});
