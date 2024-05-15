import { Month } from './month';
import { store } from '../data';

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

describe('Month', () => {

  describe('toLocaleFullMonth', () => {
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('returns shortened month string if useShortenedMonths is true', () => {
      const month = new Month(2024, 1);
      jest.spyOn(store, 'getState').mockReturnValue({ config: {useShortenedMonths: true}});
      expect(month.toLocaleFullMonth()).toEqual('Fév. 24');
    });

    it('returns full month string if useShortenedMonths is false', () => {
      const month = new Month(2024, 1);
      jest.spyOn(store, 'getState').mockReturnValue({config: { useShortenedMonths: false}});
      expect(month.toLocaleFullMonth()).toEqual('Février 2024');
    });
  });

  describe('getKey', () => {
    it('returns key in the format year#month', () => {
      const month = new Month(2024, 1);
      expect(month.getKey()).toEqual('2024#1');
    });
  });

  describe('fromKey', () => {
    it('returns a new Month with year and month from provided key', () => {
      const key = '2024#1';
      const month = Month.fromKey(key);
      expect(month).toBeInstanceOf(Month);
      expect(month.year).toEqual(2024);
      expect(month.month).toEqual(1);
    });
  });
});
