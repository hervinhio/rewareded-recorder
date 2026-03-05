// Mock firebase-functions/v2/https so the exported handler is the raw handler function
jest.mock('firebase-functions/v2/https', () => ({
  onCall: jest.fn((handler: Function) => handler),
}));

jest.mock('firebase-admin', () => {
  const mockDocRef = { get: jest.fn() };
  const mockCollectionRef = {
    get: jest.fn(),
    doc: jest.fn().mockReturnValue(mockDocRef),
    where: jest.fn().mockReturnThis(),
    forEach: jest.fn(),
  };
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollectionRef),
    doc: jest.fn().mockReturnValue(mockDocRef),
  };
  return {
    __esModule: true,
    default: {
      firestore: jest.fn(() => mockDb),
    },
  };
});

jest.mock('./publishers', () => ({
  updatePublisherActiveState: jest.fn().mockResolvedValue(undefined),
}));

import { recalculatePublishersActiveStatus } from './http';
import { updatePublisherActiveState } from './publishers';

function getMocks() {
  const admin = jest.requireMock('firebase-admin').default;
  const db = admin.firestore();
  const collRef = db.collection('x');
  return { db, collRef };
}

describe('recalculatePublishersActiveStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls updatePublisherActiveState for each publisher that has an id', async () => {
    const { collRef } = getMocks();
    collRef.get.mockResolvedValue({
      forEach: (cb: (doc: { id: string; data: () => object }) => void) => {
        [
          { id: 'pub1', data: () => ({ name: 'Publisher 1' }) },
          { id: 'pub2', data: () => ({ name: 'Publisher 2' }) },
        ].forEach(cb);
      },
    });

    await (recalculatePublishersActiveStatus as unknown as () => Promise<void>)();

    expect(updatePublisherActiveState).toHaveBeenCalledTimes(2);
    expect(updatePublisherActiveState).toHaveBeenCalledWith('pub1');
    expect(updatePublisherActiveState).toHaveBeenCalledWith('pub2');
  });

  it('does not call updatePublisherActiveState when there are no publishers', async () => {
    const { collRef } = getMocks();
    collRef.get.mockResolvedValue({
      forEach: jest.fn(),
    });

    await (recalculatePublishersActiveStatus as unknown as () => Promise<void>)();

    expect(updatePublisherActiveState).not.toHaveBeenCalled();
  });
});
