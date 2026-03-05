import { Publisher, PublisherActivityStatus } from '../types/publisher';
import { refreshPublisher } from './refresh-publisher';

jest.mock('firebase/firestore');
jest.mock('firebase/app');
jest.mock('firebase/auth', () => {
  return {
    auth: jest.fn(() => ({
      signInWithEmailAndPassword: jest.fn(() => Promise.resolve({})),
      signOut: jest.fn(() => Promise.resolve({})),
      getAuth: {},
    })),
    getAuth: () => ({}),
    connectAuthEmulator: () => {},
    GoogleAuthProvider: function () {},
  };
});

jest.mock('firebase/functions', () => {
  return {
    functions: jest.fn().mockReturnThis(),
    getFunctions: jest.fn().mockReturnThis(),
    connectFunctionsEmulator: jest.fn().mockReturnThis(),
    httpsCallable: jest.fn().mockReturnThis(),
    call: jest.fn().mockResolvedValue({ data: 'mock data' }),
  };
});

// Reducers need to return a value (not undefined) for Redux's combineReducers check
const makeReducer = (initialState: object = {}) =>
  (state = initialState) => state;

jest.mock('./groups', () => ({
  Groups: { slice: { reducer: makeReducer() } },
}));

jest.mock('./publishers', () => ({
  Publishers: {
    save: jest.fn().mockImplementation((pub: Publisher) => Promise.resolve(pub)),
    slice: { reducer: makeReducer({ publishers: [] }) },
  },
}));

jest.mock('./notifications', () => ({
  Notifications: { slice: { reducer: makeReducer() } },
}));

jest.mock('./users', () => ({
  Users: {
    slice: { reducer: makeReducer() },
    getCurrent: jest.fn().mockReturnValue({ role: 'publisher' }),
  },
}));

jest.mock('./submissions', () => ({
  Submissions: { slice: { reducer: makeReducer() } },
}));

jest.mock('./config', () => ({
  Config: { slice: { reducer: makeReducer() } },
}));

jest.mock('./dialogs', () => ({
  Dialogs: { slice: { reducer: makeReducer(), actions: {} } },
}));

jest.mock('./attendance-records', () => ({
  AttendanceRecords: { slice: { reducer: makeReducer() } },
}));

jest.mock('./special-months', () => ({
  SpecialMonths: { slice: { reducer: makeReducer() } },
}));

jest.mock('./version', () => ({
  Version: { slice: { reducer: makeReducer(1) } },
}));

// Control what the legacy Repports collection returns per test
let mockLegacyReports: object[] = [];

jest.mock('./reports', () => ({
  Reports: {
    byPublisherId: jest.fn().mockImplementation(() => Promise.resolve(mockLegacyReports)),
    slice: { reducer: makeReducer({ reports: [] }) },
  },
}));

jest.mock('./flags', () => ({
  Flags: {
    raiseError: jest.fn(),
  },
}));

jest.mock('../utils', () => ({
  getLastSixMonths: jest.fn(() => [
    { getKey: () => '2025#1' },
    { getKey: () => '2025#0' },
    { getKey: () => '2024#11' },
    { getKey: () => '2024#10' },
    { getKey: () => '2024#9' },
    { getKey: () => '2024#8' },
  ]),
  hasMetAuxiliaryPioneerGoal: jest.fn().mockResolvedValue(true),
}));

const basePublisher = (): Publisher => ({
  id: 'pub1',
  name: 'Doe',
  firstName: 'John',
  lastName: 'Doe',
  groupId: 'group1',
  address: '',
  telephone: '',
  emergencyPhone: '',
  emailAddress: '',
  activityStatus: PublisherActivityStatus.Active,
});

describe('refreshPublisher', () => {
  beforeEach(() => {
    mockLegacyReports = [];
    jest.clearAllMocks();
  });

  it('sets Inactive when no reports exist in either storage', async () => {
    const result = await refreshPublisher(basePublisher(), false);
    expect(result.activityStatus).toBe(PublisherActivityStatus.Inactive);
  });

  it('sets Active when 6 active reports are in embedded (publisher.reports) storage only', async () => {
    const publisher: Publisher = {
      ...basePublisher(),
      reports: [
        { id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2 },
        { id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 },
        { id: 'r3', publisherId: 'pub1', monthId: '2024#11', active: true, hours: 2 },
        { id: 'r4', publisherId: 'pub1', monthId: '2024#10', active: true, hours: 2 },
        { id: 'r5', publisherId: 'pub1', monthId: '2024#9', active: true, hours: 2 },
        { id: 'r6', publisherId: 'pub1', monthId: '2024#8', active: true, hours: 2 },
      ] as any[],
    };

    const result = await refreshPublisher(publisher, false);
    expect(result.activityStatus).toBe(PublisherActivityStatus.Active);
  });

  it('sets Active when 6 active reports are in the legacy collection only', async () => {
    mockLegacyReports = [
      { id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2 },
      { id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 },
      { id: 'r3', publisherId: 'pub1', monthId: '2024#11', active: true, hours: 2 },
      { id: 'r4', publisherId: 'pub1', monthId: '2024#10', active: true, hours: 2 },
      { id: 'r5', publisherId: 'pub1', monthId: '2024#9', active: true, hours: 2 },
      { id: 'r6', publisherId: 'pub1', monthId: '2024#8', active: true, hours: 2 },
    ];

    const result = await refreshPublisher(basePublisher(), false);
    expect(result.activityStatus).toBe(PublisherActivityStatus.Active);
  });

  it('combines reports from both storages to reach Active status', async () => {
    // 3 in legacy + 3 unique in embedded = 6 total
    mockLegacyReports = [
      { id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2 },
      { id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 },
      { id: 'r3', publisherId: 'pub1', monthId: '2024#11', active: true, hours: 2 },
    ];
    const publisher: Publisher = {
      ...basePublisher(),
      reports: [
        { id: 'r4', publisherId: 'pub1', monthId: '2024#10', active: true, hours: 2 },
        { id: 'r5', publisherId: 'pub1', monthId: '2024#9', active: true, hours: 2 },
        { id: 'r6', publisherId: 'pub1', monthId: '2024#8', active: true, hours: 2 },
      ] as any[],
    };

    const result = await refreshPublisher(publisher, false);
    expect(result.activityStatus).toBe(PublisherActivityStatus.Active);
  });

  it('deduplicates reports with the same id across both storages', async () => {
    // 3 in legacy + same 3 duplicated in embedded + 3 unique = 6 total unique
    mockLegacyReports = [
      { id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2 },
      { id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 },
      { id: 'r3', publisherId: 'pub1', monthId: '2024#11', active: true, hours: 2 },
    ];
    const publisher: Publisher = {
      ...basePublisher(),
      reports: [
        { id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2 }, // duplicate
        { id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 }, // duplicate
        { id: 'r3', publisherId: 'pub1', monthId: '2024#11', active: true, hours: 2 }, // duplicate
        { id: 'r4', publisherId: 'pub1', monthId: '2024#10', active: true, hours: 2 },
        { id: 'r5', publisherId: 'pub1', monthId: '2024#9', active: true, hours: 2 },
        { id: 'r6', publisherId: 'pub1', monthId: '2024#8', active: true, hours: 2 },
      ] as any[],
    };

    const result = await refreshPublisher(publisher, false);
    expect(result.activityStatus).toBe(PublisherActivityStatus.Active);
  });

  it('sets Irregular when fewer than 6 active reports and no isFirstReport', async () => {
    mockLegacyReports = [
      { id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2 },
      { id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 },
    ];

    const result = await refreshPublisher(basePublisher(), false);
    expect(result.activityStatus).toBe(PublisherActivityStatus.Irregular);
  });

  it('sets Active when fewer than 6 reports but isFirstReport is present in legacy storage', async () => {
    mockLegacyReports = [
      { id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2, isFirstReport: true },
      { id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 },
    ];

    const result = await refreshPublisher(basePublisher(), false);
    expect(result.activityStatus).toBe(PublisherActivityStatus.Active);
  });

  it('sets Active when fewer than 6 reports but isFirstReport is present in embedded storage only', async () => {
    const publisher: Publisher = {
      ...basePublisher(),
      reports: [
        { id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: true, hours: 2, isFirstReport: true },
        { id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: true, hours: 2 },
      ] as any[],
    };

    const result = await refreshPublisher(publisher, false);
    expect(result.activityStatus).toBe(PublisherActivityStatus.Active);
  });

  it('counts reports with hours >= 1 as active even if active flag is false', async () => {
    mockLegacyReports = [
      { id: 'r1', publisherId: 'pub1', monthId: '2025#1', active: false, hours: 3 },
      { id: 'r2', publisherId: 'pub1', monthId: '2025#0', active: false, hours: 1 },
      { id: 'r3', publisherId: 'pub1', monthId: '2024#11', active: false, hours: 2 },
      { id: 'r4', publisherId: 'pub1', monthId: '2024#10', active: false, hours: 5 },
      { id: 'r5', publisherId: 'pub1', monthId: '2024#9', active: false, hours: 4 },
      { id: 'r6', publisherId: 'pub1', monthId: '2024#8', active: false, hours: 2 },
    ];

    const result = await refreshPublisher(basePublisher(), false);
    expect(result.activityStatus).toBe(PublisherActivityStatus.Active);
  });
});
