/**
 * Unit tests verifying that Publishers.create() and Publishers.createReport()
 * stamp the active congregationId on every new document.
 *
 * Pattern mirrors refresh-publisher.test.ts: all data-layer dependencies are
 * mocked so the data barrel resolves cleanly; only Publishers itself is real.
 */

// ── Firebase & auth ──────────────────────────────────────────────────────────
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn().mockResolvedValue({ id: 'new-pub-id' }),
  setDoc: jest.fn().mockResolvedValue(undefined),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  deleteDoc: jest.fn().mockResolvedValue(undefined),
  getDocs: jest.fn().mockResolvedValue({ forEach: jest.fn() }),
  runTransaction: jest.fn().mockImplementation(
    (_db: unknown, fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        get: jest.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ reports: [] }),
        }),
        update: jest.fn(),
      }),
  ),
  doc: jest.fn().mockReturnValue({ id: 'mock-doc-ref' }),
  collection: jest.fn().mockReturnValue({ id: 'mock-col-ref' }),
  query: jest.fn().mockReturnValue({}),
  where: jest.fn().mockReturnValue({}),
  orderBy: jest.fn().mockReturnValue({}),
  endAt: jest.fn().mockReturnValue({}),
  startAt: jest.fn().mockReturnValue({}),
  increment: jest.fn().mockReturnValue({ n: 1 }),
  Timestamp: {
    now: jest.fn().mockReturnValue({ toDate: jest.fn(), seconds: 0, nanoseconds: 0 }),
  },
  arrayUnion: jest.fn().mockReturnValue([]),
  documentId: jest.fn().mockReturnValue('__id__'),
}));

jest.mock('firebase/app');
jest.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  connectAuthEmulator: () => {},
  GoogleAuthProvider: function () {},
}));
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
  connectFunctionsEmulator: jest.fn(),
  httpsCallable: jest.fn().mockReturnValue(jest.fn()),
}));
jest.mock('../auth', () => ({
  auth: { currentUser: { uid: 'test-uid' } },
}));

// ── Infrastructure ───────────────────────────────────────────────────────────
jest.mock('./database', () => ({ db: {} }));

const makeReducer =
  (initialState: object = {}) =>
  (state = initialState) =>
    state;

jest.mock('./congregations', () => ({
  Congregations: {
    CollectionName: 'Congregations',
    getActiveCongregationId: jest.fn<string | null, []>().mockReturnValue(null),
    slice: {
      reducer: makeReducer({ congregations: [], activeCongregationId: null, loading: false }),
    },
  },
}));

const mockDispatch = jest.fn();
const mockGetState = jest.fn().mockReturnValue({
  publishers: { publishers: [] },
});
jest.mock('./store', () => ({
  store: { dispatch: mockDispatch, getState: mockGetState },
}));

// ── Data module mocks (all modules except Publishers) ────────────────────────
jest.mock('./groups', () => ({
  Groups: { slice: { reducer: makeReducer({ groups: [] }) } },
}));
jest.mock('./reports', () => ({
  Reports: {
    byPublisherId: jest.fn().mockResolvedValue([]),
    slice: { reducer: makeReducer({ reports: [] }) },
  },
}));
jest.mock('./notifications', () => ({
  Notifications: {
    CollectionName: 'Notifications',
    slice: { reducer: makeReducer({ notifications: [] }) },
  },
}));
jest.mock('./users', () => ({
  Users: {
    slice: { reducer: makeReducer({ users: {} }) },
    getCurrent: jest.fn().mockReturnValue({ id: 'u1' }),
    update: jest.fn(),
    setCurrent: jest.fn(),
  },
}));
jest.mock('./submissions', () => ({
  Submissions: { slice: { reducer: makeReducer({ submissions: [] }) } },
}));
jest.mock('./config', () => ({
  Config: { slice: { reducer: makeReducer({}) } },
}));
jest.mock('./dialogs', () => ({
  Dialogs: { slice: { reducer: makeReducer({}), actions: {} } },
}));
jest.mock('./attendance-records', () => ({
  AttendanceRecords: { slice: { reducer: makeReducer({ records: [] }) } },
}));
jest.mock('./special-months', () => ({
  SpecialMonths: { slice: { reducer: makeReducer({ specialMonths: [] }) } },
}));
jest.mock('./version', () => ({
  Version: { slice: { reducer: makeReducer(1) } },
}));
jest.mock('./cases', () => ({
  Cases: { slice: { reducer: makeReducer({ cases: [] }) } },
}));
jest.mock('./flags', () => ({
  Flags: { raiseError: jest.fn() },
}));
jest.mock('./refresh-publisher', () => ({
  refreshPublisher: jest.fn().mockImplementation((pub) => Promise.resolve(pub)),
}));
jest.mock('../utils', () => ({
  getLastTwelveMonths: jest.fn().mockReturnValue([]),
  getLastSixMonths: jest.fn().mockReturnValue([]),
  hasMetAuxiliaryPioneerGoal: jest.fn().mockResolvedValue(false),
}));
jest.mock('../utils/publishers', () => ({
  toTitleCase: (s: string) => s,
}));

// ── Imports (after mocks) ────────────────────────────────────────────────────
import { Publishers, NewPublisherReason } from './publishers';
import { Congregations } from './congregations';
import * as firestore from 'firebase/firestore';
import { Publisher, PublisherActivityStatus } from '../types/publisher';

const CONG_ID = 'congregation-pub-test';

const makePublisher = (): Publisher => ({
  id: 'pub-1',
  name: 'Doe',
  firstName: 'John',
  lastName: 'Doe',
  groupId: 'group-1',
  address: '',
  telephone: '',
  emergencyPhone: '',
  emailAddress: '',
  activityStatus: PublisherActivityStatus.Active,
});

const makeReport = () => ({
  id: '',
  publisherId: 'pub-1',
  monthId: '2025#0',
  active: true,
  comment: '',
  submitted: false,
  isFirstReport: false,
  isAPReport: false,
});

beforeEach(() => {
  jest.clearAllMocks();
  (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(null);
  (firestore.addDoc as jest.Mock).mockResolvedValue({ id: 'new-pub-id' });
  (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);
  mockGetState.mockReturnValue({ publishers: { publishers: [] } });
});

// ── Publishers.create() ───────────────────────────────────────────────────────

describe('Publishers.create() — congregationId inheritance', () => {
  it('stamps congregationId when an active congregation is set', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await Publishers.create(makePublisher(), NewPublisherReason.New);

    expect(firestore.addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ congregationId: CONG_ID }),
    );
  });

  it('does NOT add congregationId when no active congregation', async () => {
    await Publishers.create(makePublisher(), NewPublisherReason.New);

    const written = (firestore.addDoc as jest.Mock).mock.calls[0][1];
    expect(written).not.toHaveProperty('congregationId');
  });

  it('returns the created publisher with congregationId included', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    const result = await Publishers.create(makePublisher(), NewPublisherReason.New);

    expect(result.congregationId).toBe(CONG_ID);
  });

  it('uses the "newComers" stat field for Transferred reason', async () => {
    await Publishers.create(makePublisher(), NewPublisherReason.Transferred);

    expect(firestore.updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ newComers: expect.anything() }),
    );
  });
});

// ── Publishers.createReport() ─────────────────────────────────────────────────

describe('Publishers.createReport() — congregationId inheritance', () => {
  it('inherits congregationId from the publisher in the store', async () => {
    mockGetState.mockReturnValue({
      publishers: {
        publishers: [{ ...makePublisher(), congregationId: 'publisher-cong' }],
      },
    });

    const result = await Publishers.createReport('pub-1', makeReport() as any);

    expect(result.congregationId).toBe('publisher-cong');
  });

  it('falls back to active congregation when publisher has no congregationId', async () => {
    mockGetState.mockReturnValue({
      publishers: { publishers: [makePublisher()] },
    });
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    const result = await Publishers.createReport('pub-1', makeReport() as any);

    expect(result.congregationId).toBe(CONG_ID);
  });

  it('does NOT add congregationId when publisher has none and no active congregation', async () => {
    mockGetState.mockReturnValue({
      publishers: { publishers: [makePublisher()] },
    });

    const result = await Publishers.createReport('pub-1', makeReport() as any);

    expect(result).not.toHaveProperty('congregationId');
  });

  it('passes congregationId into the transaction update call', async () => {
    mockGetState.mockReturnValue({
      publishers: { publishers: [{ ...makePublisher(), congregationId: CONG_ID }] },
    });

    const mockTxUpdate = jest.fn();
    (firestore.runTransaction as jest.Mock).mockImplementationOnce(
      (_db: unknown, fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => ({ reports: [] }),
          }),
          update: mockTxUpdate,
        }),
    );

    await Publishers.createReport('pub-1', makeReport() as any);

    expect(mockTxUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        reports: expect.arrayContaining([
          expect.objectContaining({ congregationId: CONG_ID }),
        ]),
      }),
    );
  });
});
