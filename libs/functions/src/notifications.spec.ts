import {
  generatePublisherNotification,
  generatePublisherMovedNotification,
  generateReportsSubmittedNotification,
  NotificationType,
} from './notifications';

// ─── Firebase admin mock ──────────────────────────────────────────────────────

const mockBatchUpdate = jest.fn();
const mockBatchCommit = jest.fn().mockResolvedValue(undefined);
const mockBatch = { update: mockBatchUpdate, commit: mockBatchCommit };

const mockDocGet = jest.fn();
const mockDocRef = { get: mockDocGet };

const mockCollectionGet = jest.fn();
const mockCollectionWhere = jest.fn();
const mockCollectionDoc = jest.fn().mockReturnValue(mockDocRef);
const mockCollectionRef = {
  where: mockCollectionWhere,
  get: mockCollectionGet,
  doc: mockCollectionDoc,
};

const mockDb = {
  collection: jest.fn().mockReturnValue(mockCollectionRef),
  doc: jest.fn().mockReturnValue(mockDocRef),
  batch: jest.fn().mockReturnValue(mockBatch),
};

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    firestore: Object.assign(jest.fn(() => mockDb), {
      FieldValue: {
        arrayUnion: jest.fn((...args: unknown[]) => ({ arrayUnion: args })),
      },
    }),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const publisherData = {
  name: 'Doe',
  firstName: 'John',
  lastName: '',
  groupId: 'group1',
  isMinisterialServant: false,
  activityStatus: 0,
  address: '',
  telephone: '',
  emergencyPhone: '',
  emailAddress: '',
};

function groupDoc(overseerId: string) {
  return { exists: true, data: () => ({ overseerId }) };
}

function userDoc(id: string, displayName: string, admin = false, role?: string) {
  return { id, exists: true, data: () => ({ displayName, admin, ...(role ? { role } : {}) }) };
}

/** Returns a mock collection query that resolves with the given user doc stubs. */
function collectionQueryWithUsers(users: ReturnType<typeof userDoc>[]) {
  return {
    get: jest.fn().mockResolvedValue({
      forEach: (cb: (doc: ReturnType<typeof userDoc>) => void) =>
        users.forEach(cb),
    }),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('generatePublisherNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: collection doc returns mockDocRef
    mockDb.collection.mockReturnValue(mockCollectionRef);
    mockCollectionDoc.mockReturnValue(mockDocRef);
    // Default: collection().where().get() returns empty
    mockCollectionWhere.mockReturnValue(collectionQueryWithUsers([]));
    // Default: db.doc().get() returns no group
    mockDocGet.mockResolvedValue({ exists: false, data: () => undefined });
  });

  it('sends notification to admin users and group overseer, not to the author', async () => {
    const overseerId = 'overseer1';
    const adminUserId = 'admin1';
    const authorId = 'author1';

    // First where() call → admin users; second → root users (empty)
    mockCollectionWhere
      .mockReturnValueOnce(collectionQueryWithUsers([userDoc(adminUserId, 'Admin User', true)]))
      .mockReturnValueOnce(collectionQueryWithUsers([]));

    // db.doc('Groups/group1').get() → group with overseer
    mockDocGet.mockResolvedValue(groupDoc(overseerId));

    await generatePublisherNotification(
      'pub1',
      publisherData as any,
      authorId,
      'Author Name',
      NotificationType.PublisherCreated
    );

    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    // The batch should update refs for adminUserId and overseerId
    const collectionDocArgs: string[] = mockCollectionDoc.mock.calls.map((c) => c[0] as string);
    expect(collectionDocArgs).toContain(adminUserId);
    expect(collectionDocArgs).toContain(overseerId);
    // Author must NOT appear
    expect(collectionDocArgs).not.toContain(authorId);
  });

  it('does not commit when there are no recipients after excluding the author', async () => {
    const authorId = 'author1';

    // admin query returns only the author
    mockCollectionWhere
      .mockReturnValueOnce(collectionQueryWithUsers([userDoc(authorId, 'Author', true)]))
      .mockReturnValueOnce(collectionQueryWithUsers([]));

    // group overseer is also the author
    mockDocGet.mockResolvedValue({ exists: true, data: () => ({ overseerId: authorId }) });

    await generatePublisherNotification(
      'pub1',
      publisherData as any,
      authorId,
      'Author Name',
      NotificationType.PublisherCreated
    );

    expect(mockBatch.commit).not.toHaveBeenCalled();
  });
});

describe('generatePublisherMovedNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.collection.mockReturnValue(mockCollectionRef);
    mockCollectionDoc.mockReturnValue(mockDocRef);
    mockDocGet.mockResolvedValue({ exists: false, data: () => undefined });
  });

  it('notifies both source and destination group overseers', async () => {
    const fromOverseerId = 'overseer-from';
    const toOverseerId = 'overseer-to';
    const authorId = 'mover';

    // Two db.doc().get() calls: fromGroup then toGroup
    mockDocGet
      .mockResolvedValueOnce(groupDoc(fromOverseerId))
      .mockResolvedValueOnce(groupDoc(toOverseerId));

    const movedPublisher = { ...publisherData, groupId: 'group2' };
    await generatePublisherMovedNotification(
      'pub1',
      movedPublisher as any,
      'group1',
      authorId,
      'Mover'
    );

    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    const collectionDocArgs: string[] = mockCollectionDoc.mock.calls.map((c) => c[0] as string);
    expect(collectionDocArgs).toContain(fromOverseerId);
    expect(collectionDocArgs).toContain(toOverseerId);
  });

  it('excludes author from recipients even if they are a group overseer', async () => {
    const authorId = 'author-overseer';
    const toOverseerId = 'other-overseer';

    mockDocGet
      .mockResolvedValueOnce(groupDoc(authorId))     // fromGroup overseer = author
      .mockResolvedValueOnce(groupDoc(toOverseerId)); // toGroup has different overseer

    const movedPublisher = { ...publisherData, groupId: 'group2' };
    await generatePublisherMovedNotification(
      'pub1',
      movedPublisher as any,
      'group1',
      authorId,
      'Author'
    );

    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    const collectionDocArgs: string[] = mockCollectionDoc.mock.calls.map((c) => c[0] as string);
    expect(collectionDocArgs).not.toContain(authorId);
    expect(collectionDocArgs).toContain(toOverseerId);
  });
});

describe('generateReportsSubmittedNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.collection.mockReturnValue(mockCollectionRef);
    mockCollectionDoc.mockReturnValue(mockDocRef);
  });

  it('sends notification to all users except the author', async () => {
    const authorId = 'submitter1';
    const otherUser1 = 'user2';
    const otherUser2 = 'user3';

    mockCollectionGet.mockResolvedValue({
      forEach: (cb: (doc: { id: string }) => void) => {
        [{ id: authorId }, { id: otherUser1 }, { id: otherUser2 }].forEach(cb);
      },
    });

    await generateReportsSubmittedNotification(authorId, 'Submitter');

    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    const collectionDocArgs: string[] = mockCollectionDoc.mock.calls.map((c) => c[0] as string);
    expect(collectionDocArgs).toContain(otherUser1);
    expect(collectionDocArgs).toContain(otherUser2);
    expect(collectionDocArgs).not.toContain(authorId);
  });

  it('sends no notification when there are no other users', async () => {
    const authorId = 'only-user';

    mockCollectionGet.mockResolvedValue({
      forEach: (cb: (doc: { id: string }) => void) => [{ id: authorId }].forEach(cb),
    });

    await generateReportsSubmittedNotification(authorId, 'Only User');

    expect(mockBatch.commit).not.toHaveBeenCalled();
  });
});
