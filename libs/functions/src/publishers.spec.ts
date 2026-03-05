import { updatePublisherActiveState } from './publishers';

jest.mock('firebase-admin', () => {
  const mockUpdate = jest.fn().mockResolvedValue({});
  const mockCollectionQuery = {
    where: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [] }),
  };
  const mockDocRef = {
    get: jest.fn().mockResolvedValue({ data: () => ({ reports: [] }) }),
    update: mockUpdate,
  };

  return {
    __esModule: true,
    default: {
      firestore: Object.assign(
        jest.fn(() => ({
          collection: jest.fn().mockReturnValue(mockCollectionQuery),
          doc: jest.fn().mockReturnValue(mockDocRef),
        })),
        {
          FieldValue: {
            arrayUnion: jest.fn((...args: unknown[]) => args),
          },
        }
      ),
    },
  };
});

jest.mock('./utils', () => ({
  getLastSixMonths: jest.fn(() => [
    { getKey: () => '2025#1' },
    { getKey: () => '2025#0' },
    { getKey: () => '2024#11' },
    { getKey: () => '2024#10' },
    { getKey: () => '2024#9' },
    { getKey: () => '2024#8' },
  ]),
}));

// Helpers to access the mock functions from the hoisted factory
const getFirestoreMocks = () => {
  const adminMock = jest.requireMock('firebase-admin').default;
  const db = adminMock.firestore();
  const collectionQuery = db.collection('any');
  const docRef = db.doc('any');
  return { collectionQuery, docRef };
};

const docStub = (data: object & { id: string }) => ({
  id: data.id,
  data: () => data,
});

describe('updatePublisherActiveState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { collectionQuery, docRef } = getFirestoreMocks();
    // Reset defaults
    collectionQuery.get.mockResolvedValue({ docs: [] });
    docRef.get.mockResolvedValue({ data: () => ({ reports: [] }) });
    docRef.update.mockResolvedValue({});
  });

  it('sets Inactive (2) when no active reports exist in either storage', async () => {
    await updatePublisherActiveState('pub1');

    const { docRef } = getFirestoreMocks();
    expect(docRef.update).toHaveBeenCalledWith({ activityStatus: 2 });
  });

  it('sets Active (0) when publisher has 6 active reports in new (embedded) storage only', async () => {
    const { docRef } = getFirestoreMocks();
    docRef.get.mockResolvedValue({
      data: () => ({
        reports: [
          { id: 'r1', monthId: '2025#1', active: true, hours: 2 },
          { id: 'r2', monthId: '2025#0', active: true, hours: 2 },
          { id: 'r3', monthId: '2024#11', active: true, hours: 2 },
          { id: 'r4', monthId: '2024#10', active: true, hours: 2 },
          { id: 'r5', monthId: '2024#9', active: true, hours: 2 },
          { id: 'r6', monthId: '2024#8', active: true, hours: 2 },
        ],
      }),
    });

    await updatePublisherActiveState('pub1');

    expect(docRef.update).toHaveBeenCalledWith({ activityStatus: 0 });
  });

  it('sets Active (0) when publisher has 6 active reports in legacy collection only', async () => {
    const { collectionQuery } = getFirestoreMocks();
    collectionQuery.get.mockResolvedValue({
      docs: [
        docStub({ id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2 }),
        docStub({ id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 }),
        docStub({ id: 'r3', publisherId: 'pub1', monthId: '2024#11', active: true, hours: 2 }),
        docStub({ id: 'r4', publisherId: 'pub1', monthId: '2024#10', active: true, hours: 2 }),
        docStub({ id: 'r5', publisherId: 'pub1', monthId: '2024#9', active: true, hours: 2 }),
        docStub({ id: 'r6', publisherId: 'pub1', monthId: '2024#8', active: true, hours: 2 }),
      ],
    });

    await updatePublisherActiveState('pub1');

    const { docRef } = getFirestoreMocks();
    expect(docRef.update).toHaveBeenCalledWith({ activityStatus: 0 });
  });

  it('deduplicates reports with the same id across both storages', async () => {
    const { collectionQuery, docRef } = getFirestoreMocks();
    // 3 reports in legacy + same 3 duplicated in embedded + 3 unique in embedded = 6 total unique
    collectionQuery.get.mockResolvedValue({
      docs: [
        docStub({ id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2 }),
        docStub({ id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 }),
        docStub({ id: 'r3', publisherId: 'pub1', monthId: '2024#11', active: true, hours: 2 }),
      ],
    });
    docRef.get.mockResolvedValue({
      data: () => ({
        reports: [
          { id: 'r1', monthId: '2025#1', active: true, hours: 2 }, // duplicate
          { id: 'r2', monthId: '2025#0', active: true, hours: 2 }, // duplicate
          { id: 'r3', monthId: '2024#11', active: true, hours: 2 }, // duplicate
          { id: 'r4', monthId: '2024#10', active: true, hours: 2 },
          { id: 'r5', monthId: '2024#9', active: true, hours: 2 },
          { id: 'r6', monthId: '2024#8', active: true, hours: 2 },
        ],
      }),
    });

    await updatePublisherActiveState('pub1');

    // 6 unique active reports → Active
    expect(docRef.update).toHaveBeenCalledWith({ activityStatus: 0 });
  });

  it('combines active reports from both storages to reach Active status', async () => {
    const { collectionQuery, docRef } = getFirestoreMocks();
    // 3 in legacy + 3 unique in embedded = 6 total
    collectionQuery.get.mockResolvedValue({
      docs: [
        docStub({ id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2 }),
        docStub({ id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 }),
        docStub({ id: 'r3', publisherId: 'pub1', monthId: '2024#11', active: true, hours: 2 }),
      ],
    });
    docRef.get.mockResolvedValue({
      data: () => ({
        reports: [
          { id: 'r4', monthId: '2024#10', active: true, hours: 2 },
          { id: 'r5', monthId: '2024#9', active: true, hours: 2 },
          { id: 'r6', monthId: '2024#8', active: true, hours: 2 },
        ],
      }),
    });

    await updatePublisherActiveState('pub1');

    expect(docRef.update).toHaveBeenCalledWith({ activityStatus: 0 });
  });

  it('sets Irregular (1) when fewer than 6 active reports and no isFirstReport', async () => {
    const { collectionQuery } = getFirestoreMocks();
    collectionQuery.get.mockResolvedValue({
      docs: [
        docStub({ id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2 }),
        docStub({ id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 }),
      ],
    });

    await updatePublisherActiveState('pub1');

    const { docRef } = getFirestoreMocks();
    expect(docRef.update).toHaveBeenCalledWith({ activityStatus: 1 });
  });

  it('sets Active (0) when fewer than 6 reports but isFirstReport is in legacy storage', async () => {
    const { collectionQuery } = getFirestoreMocks();
    collectionQuery.get.mockResolvedValue({
      docs: [
        docStub({ id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2, isFirstReport: true }),
        docStub({ id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 }),
      ],
    });

    await updatePublisherActiveState('pub1');

    const { docRef } = getFirestoreMocks();
    expect(docRef.update).toHaveBeenCalledWith({ activityStatus: 0 });
  });

  it('sets Active (0) when fewer than 6 reports but isFirstReport is in embedded storage only', async () => {
    const { docRef } = getFirestoreMocks();
    docRef.get.mockResolvedValue({
      data: () => ({
        reports: [
          { id: 'r1', monthId: '2025#1', active: true, hours: 2, isFirstReport: true },
          { id: 'r2', monthId: '2025#0', active: true, hours: 2 },
        ],
      }),
    });

    await updatePublisherActiveState('pub1');

    expect(docRef.update).toHaveBeenCalledWith({ activityStatus: 0 });
  });

  it('ignores embedded reports outside the last 6 months window', async () => {
    const { docRef } = getFirestoreMocks();
    docRef.get.mockResolvedValue({
      data: () => ({
        reports: [
          { id: 'r1', monthId: '2020#1', active: true, hours: 2 }, // outside window
          { id: 'r2', monthId: '2020#0', active: true, hours: 2 }, // outside window
        ],
      }),
    });

    await updatePublisherActiveState('pub1');

    expect(docRef.update).toHaveBeenCalledWith({ activityStatus: 2 }); // Inactive
  });
});
