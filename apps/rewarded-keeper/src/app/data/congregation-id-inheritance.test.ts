/**
 * Unit tests verifying that every create() method stamps the active congregationId
 * on newly written Firestore documents.
 *
 * Modules under test: Groups, AttendanceRecords, Cases, SpecialMonths,
 *   Notifications, Users.
 *
 * Pattern mirrors refresh-publisher.test.ts: every data-layer dependency is
 * mocked so that the data-barrel import (../data) resolves cleanly; only the
 * modules being tested are NOT mocked.
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

/**
 * Congregations mock: getActiveCongregationId() is a jest.fn() so each test
 * can control the returned value via (Congregations.getActiveCongregationId as jest.Mock)
 */
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

// ── Data-layer mocks needed so that the data barrel `../data` can be fully
//    resolved (month.ts → ../data → these modules). Only modules that are
//    NOT being tested here are mocked. ──────────────────────────────────────

// publishers is mocked because groups.ts imports it (but Groups.create() doesn't use it)
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
jest.mock('./submissions', () => ({
  Submissions: { slice: { reducer: makeReducer({ submissions: [] }) } },
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
jest.mock('../utils', () => ({
  getLastTwelveMonths: jest.fn().mockReturnValue([]),
  getLastSixMonths: jest.fn().mockReturnValue([]),
  hasMetAuxiliaryPioneerGoal: jest.fn().mockResolvedValue(false),
}));
jest.mock('../utils/publishers', () => ({
  toTitleCase: (s: string) => s,
}));

// NOTE: ./groups, ./attendance-records, ./cases, ./special-months,
// ./notifications, and ./users are intentionally NOT mocked here so that their
// real implementations are used in the tests below.

// ── Imports (resolved after mocks) ──────────────────────────────────────────
import { Groups } from './groups';
import { AttendanceRecords } from './attendance-records';
import { Cases } from './cases';
import { SpecialMonths } from './special-months';
import { Notifications } from './notifications';
import { Users } from './users';
import { Congregations } from './congregations';
import * as firestore from 'firebase/firestore';
import { store } from './store';

// Aliases resolved after imports — safe from Jest's jest.mock() hoisting TDZ
const mockDispatch = store.dispatch as jest.Mock;
const mockGetState = store.getState as jest.Mock;

const CONG_ID = 41929;

beforeEach(() => {
  jest.clearAllMocks();
  (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(null);
  (firestore.addDoc as jest.Mock).mockResolvedValue({ id: 'new-doc-id' });
  (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
  mockGetState.mockReturnValue({
    publishers: { publishers: [] },
    specialMonths: { specialMonths: [] },
  });
});

// ── Groups ───────────────────────────────────────────────────────────────────

describe('Groups.create() — congregationId inheritance', () => {
  const makeGroup = () => ({ id: 'g1', name: 'Group One', overseerId: 'o1' });

  it('stamps congregationId when an active congregation is set', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await Groups.create(makeGroup());

    expect(firestore.setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ congregationId: CONG_ID }),
    );
  });

  it('does NOT add congregationId when no active congregation', async () => {
    await Groups.create(makeGroup());

    const written = (firestore.setDoc as jest.Mock).mock.calls[0][1];
    expect(written).not.toHaveProperty('congregationId');
  });

  it('returns the created group with congregationId included', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    const result = await Groups.create(makeGroup());

    expect(result.congregationId).toBe(CONG_ID);
  });
});

// ── AttendanceRecords ────────────────────────────────────────────────────────

describe('AttendanceRecords.create() — congregationId inheritance', () => {
  const makeRecord = () => ({
    date: { toDate: jest.fn() },
    monthId: '2025#0',
    isMidweekMeeting: false,
    inPerson: 50,
  });

  it('stamps congregationId on the Firestore document', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await AttendanceRecords.create(makeRecord() as any);

    expect(firestore.addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ congregationId: CONG_ID }),
    );
  });

  it('does NOT add congregationId when no active congregation', async () => {
    await AttendanceRecords.create(makeRecord() as any);

    const written = (firestore.addDoc as jest.Mock).mock.calls[0][1];
    expect(written).not.toHaveProperty('congregationId');
  });

  it('includes congregationId in the Redux dispatch payload', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await AttendanceRecords.create(makeRecord() as any);

    // The first dispatch carries the added record
    const payload = mockDispatch.mock.calls[0]?.[0]?.payload;
    expect(payload).toMatchObject({ congregationId: CONG_ID });
  });
});

// ── Cases ────────────────────────────────────────────────────────────────────

describe('Cases.create() — congregationId inheritance', () => {
  const callCreate = () =>
    Cases.create('Bug title', 'Description', 'bug', 'uid', 'Creator', 'https://photo');

  it('stamps congregationId on the Firestore document', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await callCreate();

    expect(firestore.addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ congregationId: CONG_ID }),
    );
  });

  it('does NOT add congregationId when no active congregation', async () => {
    await callCreate();

    const written = (firestore.addDoc as jest.Mock).mock.calls[0][1];
    expect(written).not.toHaveProperty('congregationId');
  });

  it('returns the created case with congregationId', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    const result = await callCreate();

    expect(result.congregationId).toBe(CONG_ID);
  });
});

// ── SpecialMonths ─────────────────────────────────────────────────────────────

describe('SpecialMonths.create() — congregationId inheritance', () => {
  beforeEach(() => {
    mockGetState.mockReturnValue({ specialMonths: { specialMonths: [] } });
  });

  it('stamps congregationId on the Firestore document', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await SpecialMonths.create(2025, 0, 'Memorial Campaign');

    expect(firestore.addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ congregationId: CONG_ID }),
    );
  });

  it('does NOT add congregationId when no active congregation', async () => {
    await SpecialMonths.create(2025, 1, 'Special Campaign');

    const written = (firestore.addDoc as jest.Mock).mock.calls[0][1];
    expect(written).not.toHaveProperty('congregationId');
  });

  it('returns the created special month with congregationId', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    const result = await SpecialMonths.create(2025, 2, 'Campaign');

    expect(result.congregationId).toBe(CONG_ID);
  });
});

// ── Notifications ─────────────────────────────────────────────────────────────

describe('Notifications.saveSubmission() — congregationId inheritance', () => {
  it('stamps congregationId on the Firestore document', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    await Notifications.saveSubmission();

    expect(firestore.addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ congregationId: CONG_ID }),
    );
  });

  it('does NOT add congregationId when no active congregation', async () => {
    await Notifications.saveSubmission();

    const written = (firestore.addDoc as jest.Mock).mock.calls[0][1];
    expect(written).not.toHaveProperty('congregationId');
  });
});

// ── Users ────────────────────────────────────────────────────────────────────

describe('Users.create() — congregationId inheritance', () => {
  const makeUser = () => ({
    id: 'u1',
    displayName: 'Test User',
    email: 'test@example.com',
    publisherId: '',
    admin: false,
    validated: true,
    groupId: 'g1',
    photoURL: '',
    phoneNumber: '',
    role: 'basic',
  });

  it('stamps congregationId when active congregation is set and user has none', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);

    const result = await Users.create(makeUser() as any);

    expect(result.congregationId).toBe(CONG_ID);
    expect(firestore.setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ congregationId: CONG_ID }),
    );
  });

  it('does NOT add congregationId when no active congregation', async () => {
    const result = await Users.create(makeUser() as any);

    expect(result.congregationId).toBeUndefined();
    const written = (firestore.setDoc as jest.Mock).mock.calls[0][1];
    expect(written).not.toHaveProperty('congregationId');
  });

  it('preserves an existing congregationId without overriding it', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);
    const user = { ...makeUser(), congregationId: 41939 };

    const result = await Users.create(user as any);

    expect(result.congregationId).toBe(41939);
  });

  it('always sets admin=false and validated=false', async () => {
    const user = { ...makeUser(), admin: true, validated: true };

    const result = await Users.create(user as any);

    expect(result.admin).toBe(false);
    expect(result.validated).toBe(false);
  });

  it('does NOT auto-assign congregationId for root users', async () => {
    (Congregations.getActiveCongregationId as jest.Mock).mockReturnValue(CONG_ID);
    const user = { ...makeUser(), role: 'root' };

    const result = await Users.create(user as any);

    expect(result.congregationId).toBeUndefined();
    const written = (firestore.setDoc as jest.Mock).mock.calls[0][1];
    expect(written).not.toHaveProperty('congregationId');
  });
});
