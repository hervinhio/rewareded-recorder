// Mock firebase-functions/v2/firestore: each onDocumentCreated/Deleted/Updated returns the handler directly
jest.mock('firebase-functions/v2/firestore', () => ({
  onDocumentCreated: jest.fn((_doc: string, handler: Function) => handler),
  onDocumentDeleted: jest.fn((_doc: string, handler: Function) => handler),
  onDocumentUpdated: jest.fn((_doc: string, handler: Function) => handler),
}));

jest.mock('firebase-admin', () => {
  const mockDocRef = { get: jest.fn() };
  const mockDb = {
    doc: jest.fn().mockReturnValue(mockDocRef),
  };
  return {
    __esModule: true,
    default: {
      firestore: jest.fn(() => mockDb),
    },
  };
});

jest.mock('./notifications', () => ({
  generateNotificationFromChange: jest.fn().mockResolvedValue(undefined),
  generatePublisherNotification: jest.fn().mockResolvedValue(undefined),
  generatePublisherMovedNotification: jest.fn().mockResolvedValue(undefined),
  NotificationType: {
    ReportCreated: 0,
    ReportUpdated: 1,
    ReportDeleted: 2,
    ReportsSubmitted: 3,
    PublisherCreated: 4,
    PublisherUpdated: 5,
    PublisherDeleted: 6,
    PublisherMoved: 7,
  },
}));

jest.mock('./publishers', () => ({
  updatePublisherActiveState: jest.fn().mockResolvedValue(undefined),
  updateAuxilaryPionnerForPublisher: jest.fn().mockResolvedValue(undefined),
}));

import {
  onCreateReport,
  onDeleteReport,
  onUpdateReport,
  onCreatePublisher,
  onDeletePublisher,
  onUpdatePublisher,
} from './triggers';
import {
  generateNotificationFromChange,
  generatePublisherNotification,
  generatePublisherMovedNotification,
  NotificationType,
} from './notifications';
import {
  updatePublisherActiveState,
  updateAuxilaryPionnerForPublisher,
} from './publishers';

function getAdminMocks() {
  const admin = jest.requireMock('firebase-admin').default;
  const db = admin.firestore();
  const docRef = db.doc('x');
  return { db, docRef };
}

function makeSnapshot(data: object) {
  return { data: () => data };
}

function makeCreateEvent(data: object, params: object = {}) {
  return { data: makeSnapshot(data), params };
}

function makeDeleteEvent(data: object, params: object = {}) {
  return { data: makeSnapshot(data), params };
}

function makeUpdateEvent(beforeData: object, afterData: object, params: object = {}) {
  return {
    data: {
      before: makeSnapshot(beforeData),
      after: makeSnapshot(afterData),
    },
    params,
  };
}

describe('onCreateReport', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls generateNotificationFromChange, updatePublisherActiveState and updateAuxilaryPionnerForPublisher', async () => {
    const reportData = { publisherId: 'pub1', authorId: 'auth1' };
    const event = makeCreateEvent(reportData);

    await (onCreateReport as unknown as Function)(event);

    expect(generateNotificationFromChange).toHaveBeenCalledWith(event.data, NotificationType.ReportCreated);
    expect(updatePublisherActiveState).toHaveBeenCalledWith('pub1');
    expect(updateAuxilaryPionnerForPublisher).toHaveBeenCalledWith('pub1', reportData);
  });
});

describe('onDeleteReport', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls generateNotificationFromChange, updatePublisherActiveState and updateAuxilaryPionnerForPublisher', async () => {
    const reportData = { publisherId: 'pub2', authorId: 'auth2' };
    const event = makeDeleteEvent(reportData);

    await (onDeleteReport as unknown as Function)(event);

    expect(generateNotificationFromChange).toHaveBeenCalledWith(event.data, NotificationType.ReportDeleted);
    expect(updatePublisherActiveState).toHaveBeenCalledWith('pub2');
    expect(updateAuxilaryPionnerForPublisher).toHaveBeenCalledWith('pub2', reportData);
  });
});

describe('onUpdateReport', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls generateNotificationFromChange with after snapshot, updatePublisherActiveState and updateAuxilaryPionnerForPublisher', async () => {
    const beforeData = { publisherId: 'pub3', hours: 1 };
    const afterData = { publisherId: 'pub3', hours: 2 };
    const event = makeUpdateEvent(beforeData, afterData);

    await (onUpdateReport as unknown as Function)(event);

    expect(generateNotificationFromChange).toHaveBeenCalledWith(event.data!.after, NotificationType.ReportUpdated);
    expect(updatePublisherActiveState).toHaveBeenCalledWith('pub3');
    expect(updateAuxilaryPionnerForPublisher).toHaveBeenCalledWith('pub3', afterData);
  });
});

// ─── Publisher trigger tests ──────────────────────────────────────────────────

describe('onCreatePublisher', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls generatePublisherNotification with PublisherCreated', async () => {
    const publisherData = {
      name: 'Doe', firstName: 'John', lastName: '',
      groupId: 'group1', isMinisterialServant: false, authorId: 'auth1',
    };
    const event = makeCreateEvent(publisherData, { publisherId: 'pub1' });

    const { docRef } = getAdminMocks();
    docRef.get.mockResolvedValue({ data: () => ({ displayName: 'Author One' }) });

    await (onCreatePublisher as unknown as Function)(event);

    expect(generatePublisherNotification).toHaveBeenCalledWith(
      'pub1',
      publisherData,
      'auth1',
      'Author One',
      NotificationType.PublisherCreated
    );
  });

  it('returns early when event data is null or undefined', async () => {
    const event = { data: null, params: { publisherId: 'pub1' } };

    await (onCreatePublisher as unknown as Function)(event);

    expect(generatePublisherNotification).not.toHaveBeenCalled();
  });
});

describe('onDeletePublisher', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls generatePublisherNotification with PublisherDeleted', async () => {
    const publisherData = {
      name: 'Smith', firstName: 'Jane', lastName: '',
      groupId: 'group2', isMinisterialServant: false, authorId: 'auth2',
    };
    const event = makeDeleteEvent(publisherData, { publisherId: 'pub2' });

    const { docRef } = getAdminMocks();
    docRef.get.mockResolvedValue({ data: () => ({ displayName: 'Author Two' }) });

    await (onDeletePublisher as unknown as Function)(event);

    expect(generatePublisherNotification).toHaveBeenCalledWith(
      'pub2',
      publisherData,
      'auth2',
      'Author Two',
      NotificationType.PublisherDeleted
    );
  });
});

describe('onUpdatePublisher', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls generatePublisherMovedNotification when group changes', async () => {
    const beforeData = { name: 'Doe', firstName: 'John', lastName: '', groupId: 'group1', isMinisterialServant: false, authorId: 'auth1' };
    const afterData = { name: 'Doe', firstName: 'John', lastName: '', groupId: 'group2', isMinisterialServant: false, authorId: 'auth1' };
    const event = makeUpdateEvent(beforeData, afterData, { publisherId: 'pub3' });

    const { docRef } = getAdminMocks();
    docRef.get.mockResolvedValue({ data: () => ({ displayName: 'Author One' }) });

    await (onUpdatePublisher as unknown as Function)(event);

    expect(generatePublisherMovedNotification).toHaveBeenCalledWith(
      'pub3',
      afterData,
      'group1',
      'auth1',
      'Author One'
    );
    expect(generatePublisherNotification).not.toHaveBeenCalled();
  });

  it('calls generatePublisherNotification with PublisherUpdated when group does not change', async () => {
    const beforeData = { name: 'Doe', firstName: 'John', lastName: '', groupId: 'group1', isMinisterialServant: false, authorId: 'auth1' };
    const afterData = { name: 'Doe', firstName: 'Jane', lastName: '', groupId: 'group1', isMinisterialServant: false, authorId: 'auth1' };
    const event = makeUpdateEvent(beforeData, afterData, { publisherId: 'pub3' });

    const { docRef } = getAdminMocks();
    docRef.get.mockResolvedValue({ data: () => ({ displayName: 'Author One' }) });

    await (onUpdatePublisher as unknown as Function)(event);

    expect(generatePublisherNotification).toHaveBeenCalledWith(
      'pub3',
      afterData,
      'auth1',
      'Author One',
      NotificationType.PublisherUpdated
    );
    expect(generatePublisherMovedNotification).not.toHaveBeenCalled();
  });

  it('returns early when event data is null or undefined', async () => {
    const event = { data: null, params: { publisherId: 'pub3' } };

    await (onUpdatePublisher as unknown as Function)(event);

    expect(generatePublisherNotification).not.toHaveBeenCalled();
    expect(generatePublisherMovedNotification).not.toHaveBeenCalled();
  });
});
