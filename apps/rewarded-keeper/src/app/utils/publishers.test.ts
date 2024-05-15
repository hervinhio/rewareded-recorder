import 'cypress';
import { Publisher, PublisherActivityStatus } from '../types';
import { filterNonInactiveAndNonPioneersOut } from './publishers';

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
    GoogleAuthProvider: function() {},
  }
});

jest.mock('firebase/functions', () => {
  return {
    functions: jest.fn().mockReturnThis(),
    getFunctions: jest.fn().mockReturnThis(),
    connectFunctionsEmulator: jest.fn().mockReturnThis(),
    httpsCallable: jest.fn().mockReturnThis(),
    call: jest.fn().mockResolvedValue({ data: 'mock data' })
  };
});

describe('filterNonInactiveAndNonPioneersOut function', () => {
    it('returns true for pioneer publishers when groupId is pioneers', () => {
        const publisher: Publisher = {
            id: '1',
            name: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            groupId: 'pioneers',
            address: 'Somewhere street',
            telephone: '123456789',
            emergencyPhone: '987654321',
            emailAddress: 'email@email.com',
            isElder: false,
            isMinisterialServant: false,
            isSpecialServant: true,
            isRegularPioneer: true,
            auxilaryPionierFor: [],
            isPermanentAuxilaryPioneer: false,
            activityStatus: PublisherActivityStatus.Active,
        };
        expect(filterNonInactiveAndNonPioneersOut(publisher, 'pioneers')).toEqual(true);
    });

    it('returns true for inactive publishers when groupId is inactives', () => {
        const publisher: Publisher = {
            // other properties...
            groupId: 'inactives',
            isRegularPioneer: false,
            activityStatus: PublisherActivityStatus.Inactive,
        } as Publisher;
        expect(filterNonInactiveAndNonPioneersOut(publisher, 'inactives')).toEqual(true);
    });

    it('returns true for non-pioneer & active publishers when groupId is neither pioneers nor inactives', () => {
        const publisher: Publisher = {
            // other properties...
            groupId: 'other',
            isRegularPioneer: false,
            activityStatus: PublisherActivityStatus.Active,
        } as Publisher;
        expect(filterNonInactiveAndNonPioneersOut(publisher, 'other')).toEqual(true);
    });

    it('returns false for inactive or pioneer publishers when groupId is neither pioneers nor inactives', () => {
        const publisher: Publisher = {
            // other properties...
            groupId: 'other',
            isRegularPioneer: true,
            activityStatus: PublisherActivityStatus.Active,
        } as Publisher;
        expect(filterNonInactiveAndNonPioneersOut(publisher, 'other')).toEqual(false);
    });
});
