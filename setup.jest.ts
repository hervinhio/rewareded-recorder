import {TextDecoder, TextEncoder} from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (!globalThis.fetch) {
  globalThis.fetch = jest.fn().mockImplementation(() =>
    Promise.reject(
      new Error('Unexpected fetch call in test. Please mock fetch in your test.'),
    ),
  ) as unknown as typeof fetch;
}

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
  };
});

jest.mock('firebase/functions', () => {
  return {
    functions: jest.fn().mockReturnThis(),
    getFunctions: jest.fn().mockReturnThis(),
    connectFunctionsEmulator: jest.fn().mockReturnThis(),
    httpsCallable: jest.fn().mockReturnThis(),
    call: jest.fn().mockResolvedValue({data: 'mock data'}),
  };
});
