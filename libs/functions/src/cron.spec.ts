// Mock firebase-functions so exported handlers are the raw handler functions
jest.mock('firebase-functions/v1', () => {
  const mockOnRun = jest.fn((handler: Function) => handler);
  const mockSchedule = jest.fn(() => ({ onRun: mockOnRun }));
  return {
    pubsub: {
      schedule: mockSchedule,
    },
  };
});

jest.mock('firebase-admin', () => {
  const mockUpdate = jest.fn().mockResolvedValue(undefined);
  const mockDocRef = { update: mockUpdate };
  const mockCollectionRef = {
    get: jest.fn(),
    doc: jest.fn().mockReturnValue(mockDocRef),
    where: jest.fn().mockReturnThis(),
  };
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollectionRef),
  };
  return {
    __esModule: true,
    default: {
      firestore: Object.assign(jest.fn(() => mockDb), {
        FieldValue: {
          arrayRemove: jest.fn((...args: unknown[]) => ({ arrayRemove: args })),
        },
      }),
    },
  };
});

import { deleteNotificationsCron, deleteOldReportsCron } from './cron';

function getMocks() {
  const admin = jest.requireMock('firebase-admin').default;
  const db = admin.firestore();
  const collRef = db.collection('x');
  const docRef = collRef.doc('x');
  return { db, collRef, docRef, FieldValue: admin.firestore.FieldValue };
}

describe('deleteNotificationsCron', () => {
  beforeEach(() => jest.clearAllMocks());

  it('removes old read notifications (>1 year) from user documents', async () => {
    const twoYearsAgo = new Date(Date.now() - 2 * 366 * 24 * 60 * 60 * 1000);
    const recent = new Date();
    const oldReadNotif = { unread: false, date: { toDate: () => twoYearsAgo } };
    const oldUnreadNotif = { unread: true, date: { toDate: () => twoYearsAgo } };
    const recentReadNotif = { unread: false, date: { toDate: () => recent } };

    const { collRef, docRef, FieldValue } = getMocks();
    collRef.get.mockResolvedValue({
      docs: [{
        id: 'user1',
        data: () => ({ notifications: [oldReadNotif, oldUnreadNotif, recentReadNotif] }),
      }],
    });

    await (deleteNotificationsCron as unknown as () => Promise<void>)();

    expect(FieldValue.arrayRemove).toHaveBeenCalledWith(oldReadNotif);
    expect(docRef.update).toHaveBeenCalledTimes(1);
  });

  it('does not update when no notifications are old enough to remove', async () => {
    const recent = new Date();
    const { collRef, docRef } = getMocks();
    collRef.get.mockResolvedValue({
      docs: [{
        id: 'user1',
        data: () => ({ notifications: [{ unread: false, date: { toDate: () => recent } }] }),
      }],
    });

    await (deleteNotificationsCron as unknown as () => Promise<void>)();

    expect(docRef.update).not.toHaveBeenCalled();
  });

  it('does not update users with no notifications field', async () => {
    const { collRef, docRef } = getMocks();
    collRef.get.mockResolvedValue({
      docs: [{ id: 'user1', data: () => ({}) }],
    });

    await (deleteNotificationsCron as unknown as () => Promise<void>)();

    expect(docRef.update).not.toHaveBeenCalled();
  });

  it('handles notification dates stored as plain Date objects (no toDate method)', async () => {
    const twoYearsAgo = new Date(Date.now() - 2 * 366 * 24 * 60 * 60 * 1000);
    const oldReadNotif = { unread: false, date: twoYearsAgo };

    const { collRef, docRef, FieldValue } = getMocks();
    collRef.get.mockResolvedValue({
      docs: [{ id: 'user1', data: () => ({ notifications: [oldReadNotif] }) }],
    });

    await (deleteNotificationsCron as unknown as () => Promise<void>)();

    expect(FieldValue.arrayRemove).toHaveBeenCalledWith(oldReadNotif);
    expect(docRef.update).toHaveBeenCalledTimes(1);
  });
});

describe('deleteOldReportsCron', () => {
  beforeEach(() => jest.clearAllMocks());

  it('queries the Repports collection for old reports and deletes them', async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    const { collRef } = getMocks();

    collRef.get.mockResolvedValue({
      forEach: (cb: (doc: { ref: { delete: () => Promise<void> } }) => void) => {
        [{ ref: { delete: mockDelete } }].forEach(cb);
      },
    });

    (deleteOldReportsCron as unknown as () => void)();

    // The .get().then() is fire-and-forget; flush the microtask queue
    await Promise.resolve();

    expect(collRef.where).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it('calls where on the Repports collection', async () => {
    const { collRef } = getMocks();
    collRef.get.mockResolvedValue({
      forEach: jest.fn(),
    });

    (deleteOldReportsCron as unknown as () => void)();
    await Promise.resolve();

    const { db } = getMocks();
    expect(db.collection).toHaveBeenCalledWith('Repports');
    expect(collRef.where).toHaveBeenCalled();
  });
});
