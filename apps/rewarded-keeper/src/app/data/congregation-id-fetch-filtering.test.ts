/**
 * Unit tests verifying that fetch methods (all/get/load/loadAll) filter results
 * by the active congregationId when one is set.
 *
 * Modules under test: AttendanceRecords, SpecialMonths, Cases, Submissions.
 *
 * Pattern mirrors congregation-id-inheritance.test.ts.
 */

// ── Firebase & auth ──────────────────────────────────────────────────────────
jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn().mockResolvedValue({ id: 'new-doc-id' }),
  setDoc: jest.fn().mockResolvedValue(undefined),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  deleteDoc: jest.fn().mockResolvedValue(undefined),
  getDocs: jest.fn().mockResolvedValue({ forEach: jest.fn() }),
  getDoc: jest.fn().mockResolvedValue({ exists: () => false }),
  runTransaction: jest.fn(),
  doc: jest.fn().mockReturnValue({ id: 'mock-doc-ref' }),
  collection: jest.fn().mockReturnValue({ id: 'mock-col-ref' }),
  query: jest.fn().mockReturnValue({}),
  where: jest.fn().mockReturnValue({}),
  orderBy: jest.fn().mockReturnValue({}),
  limit: jest.fn().mockReturnValue({}),
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
    getActiveCongregationId: jest.fn<number | null, []>().mockReturnValue(null),
    slice: {
      reducer: makeReducer({ congregations: [], activeCongregationId: null, loading: false }),
    },
  },
}));

jest.mock('./store', () => ({
  store: { dispatch: jest.fn(), getState: jest.fn() },
}));

// ── Data-layer mocks (all modules except those under test) ───────────────────
jest.mock('./publishers', () => ({
  Publishers: {
    slice: { reducer: makeReducer({ publishers: [] }) },
    save: jest.fn(),
  },
  NewPublisherReason: { New: 0, Transferred: 1 },
}));
jest.mock('./reports', () => ({
  Reports: {
    byPublisherId: jest.fn().mockResolvedValue([]),
    slice: { reducer: makeReducer({ reports: [] }) },
  },
}));
jest.mock('./groups', () => ({
  Groups: { slice: { reducer: makeReducer({ groups: [] }) } },
}));
jest.mock('./users', () => ({
  Users: {
    slice: { reducer: makeReducer({ users: {} }) },
    getCurrent: jest.fn().mockReturnValue({ id: 'u1' }),
  },
}));
jest.mock('./notifications', () => ({
  Notifications: {
    CollectionName: 'Notifications',
    slice: { reducer: makeReducer({ notifications: [] }) },
  },
}));
jest.mock('./config', () => ({
  Config: { slice: { reducer: makeReducer({}) } },
}));
jest.mock('./dialogs', () => ({
  Dialogs: { slice: { reducer: makeReducer({}), actions: {} } },
}));
jest.mock('./version', () => ({
  Version: { slice: { reducer: makeReducer(1) } },
}));
jest.mock('./flags', () => ({
  Flags: { raiseError: jest.fn() },
}));
jest.mock('./refresh-publisher', () => ({
  refreshPublisher: jest.fn().mockImplementation((pub) => Promise.resolve(pub)),
}));
jest.mock('./stats', () => ({
  StatsUtils: { addAuxiliaryPioneerAchievement: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../utils', () => ({
  getLastTwelveMonths: jest.fn().mockReturnValue([{ getKey: () => '2025#0' }]),
  getLastSixMonths: jest.fn().mockReturnValue([{ getKey: () => '2025#0' }]),
  hasMetAuxiliaryPioneerGoal: jest.fn().mockResolvedValue(false),
}));
jest.mock('../utils/publishers', () => ({
  toTitleCase: (s: string) => s,
}));

// NOTE: AttendanceRecords, SpecialMonths, Cases, and Submissions are
// intentionally NOT mocked here so their real implementations are tested.

// ── Imports (resolved after mocks) ──────────────────────────────────────────
import { AttendanceRecords } from './attendance-records';
import { SpecialMonths } from './special-months';
import { Cases } from './cases';
import { Submissions } from './submissions';
import { Congregations } from './congregations';
import * as firestore from 'firebase/firestore';
import { store } from './store';

const mockGetState = store.getState as jest.Mock;

const CONG_ID = 41929;

beforeEach(() => {
  jest.clearAllMocks();
  (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(null);
  mockGetState.mockReturnValue({
    publishers: { publishers: [] },
    specialMonths: { specialMonths: [] },
  });
});

// ── AttendanceRecords.load() ─────────────────────────────────────────────────

describe('AttendanceRecords.load() — congregationId filtering', () => {
  it('includes a congregationId where clause when an active congregation is set', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await AttendanceRecords.load();

    expect(firestore.where).toHaveBeenCalledWith('congregationId', '==', CONG_ID);
  });

  it('does NOT add a congregationId where clause when no active congregation', async () => {
    await AttendanceRecords.load();

    const whereCalls = (firestore.where as jest.Mock).mock.calls;
    const hasCongregationFilter = whereCalls.some(
      ([field]: [string]) => field === 'congregationId',
    );
    expect(hasCongregationFilter).toBe(false);
  });
});

// ── SpecialMonths.getAll() ───────────────────────────────────────────────────

describe('SpecialMonths.getAll() — congregationId filtering', () => {
  it('includes a congregationId where clause when an active congregation is set', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await SpecialMonths.getAll();

    expect(firestore.where).toHaveBeenCalledWith('congregationId', '==', CONG_ID);
  });

  it('does NOT add a congregationId where clause when no active congregation', async () => {
    await SpecialMonths.getAll();

    const whereCalls = (firestore.where as jest.Mock).mock.calls;
    const hasCongregationFilter = whereCalls.some(
      ([field]: [string]) => field === 'congregationId',
    );
    expect(hasCongregationFilter).toBe(false);
  });
});

// ── Cases.loadAll() ──────────────────────────────────────────────────────────

describe('Cases.loadAll() — congregationId filtering', () => {
  it('includes a congregationId where clause when an active congregation is set', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await Cases.loadAll();

    expect(firestore.where).toHaveBeenCalledWith('congregationId', '==', CONG_ID);
  });

  it('does NOT add a congregationId where clause when no active congregation', async () => {
    await Cases.loadAll();

    const whereCalls = (firestore.where as jest.Mock).mock.calls;
    const hasCongregationFilter = whereCalls.some(
      ([field]: [string]) => field === 'congregationId',
    );
    expect(hasCongregationFilter).toBe(false);
  });
});

// ── Cases.loadForUser() ──────────────────────────────────────────────────────

describe('Cases.loadForUser() — congregationId filtering', () => {
  it('includes a congregationId where clause when an active congregation is set', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await Cases.loadForUser('user-1');

    expect(firestore.where).toHaveBeenCalledWith('congregationId', '==', CONG_ID);
  });

  it('does NOT add a congregationId where clause when no active congregation', async () => {
    await Cases.loadForUser('user-1');

    const whereCalls = (firestore.where as jest.Mock).mock.calls;
    const hasCongregationFilter = whereCalls.some(
      ([field]: [string]) => field === 'congregationId',
    );
    expect(hasCongregationFilter).toBe(false);
  });
});

// ── Submissions.all() ────────────────────────────────────────────────────────

describe('Submissions.all() — congregationId filtering', () => {
  it('includes a congregationId where clause when an active congregation is set', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await Submissions.all();

    expect(firestore.where).toHaveBeenCalledWith('congregationId', '==', CONG_ID);
  });

  it('does NOT add a congregationId where clause when no active congregation', async () => {
    await Submissions.all();

    const whereCalls = (firestore.where as jest.Mock).mock.calls;
    const hasCongregationFilter = whereCalls.some(
      ([field]: [string]) => field === 'congregationId',
    );
    expect(hasCongregationFilter).toBe(false);
  });
});
