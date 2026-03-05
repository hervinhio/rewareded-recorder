import {
  authenticateWithCredentials,
  registerWithCredentials,
  updateUserPassword,
  updateUserEmail,
} from './authentication';

jest.mock('firebase/app');
jest.mock('firebase/firestore');
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn().mockReturnThis(),
  connectFunctionsEmulator: jest.fn(),
}));

const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockReauthenticateWithCredential = jest.fn();
const mockUpdatePassword = jest.fn();
const mockUpdateEmail = jest.fn();
const mockUpdateProfile = jest.fn();
const mockSetPersistence = jest.fn().mockResolvedValue(undefined);

const mockCurrentUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  isAnonymous: false,
  displayName: 'Test User',
  providerData: [{ providerId: 'password' }],
};

const mockAuth = {
  currentUser: mockCurrentUser,
  signOut: jest.fn(),
};

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  connectAuthEmulator: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(function () {}),
  EmailAuthProvider: {
    credential: jest.fn((email: string, password: string) => ({
      email,
      password,
    })),
  },
  setPersistence: (...args: any[]) => mockSetPersistence(...args),
  browserLocalPersistence: 'LOCAL',
  signInWithRedirect: jest.fn(),
  getRedirectResult: jest.fn().mockResolvedValue(null),
  signInWithEmailAndPassword: (...args: any[]) =>
    mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: any[]) =>
    mockCreateUserWithEmailAndPassword(...args),
  reauthenticateWithCredential: (...args: any[]) =>
    mockReauthenticateWithCredential(...args),
  updatePassword: (...args: any[]) => mockUpdatePassword(...args),
  updateEmail: (...args: any[]) => mockUpdateEmail(...args),
  updateProfile: (...args: any[]) => mockUpdateProfile(...args),
}));

jest.mock('../data', () => ({
  Users: {
    create: jest.fn().mockResolvedValue({}),
    getOne: jest.fn().mockResolvedValue(null),
    setCurrent: jest.fn(),
    update: jest.fn(),
  },
  db: {},
  store: { dispatch: jest.fn() },
}));

jest.mock('../../environments/environment', () => ({
  environment: {
    production: false,
    testing: true,
    firebaseConfig: {
      apiKey: 'test',
      authDomain: 'test',
      projectId: 'test',
      storageBucket: 'test',
      messagingSenderId: 'test',
      appId: 'test',
    },
    ports: { functions: 5001 },
  },
}));

jest.mock('../data/flags', () => ({
  Flags: { raiseError: jest.fn() },
}));

describe('authenticateWithCredentials', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetPersistence.mockResolvedValue(undefined);
  });

  it('should call signInWithEmailAndPassword with provided credentials', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: mockCurrentUser,
    });

    await authenticateWithCredentials('user@example.com', 'password123');

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      'user@example.com',
      'password123',
    );
  });

  it('should throw if signInWithEmailAndPassword fails', async () => {
    const error = new Error('Invalid credentials');
    mockSignInWithEmailAndPassword.mockRejectedValue(error);

    await expect(
      authenticateWithCredentials('bad@example.com', 'wrongpass'),
    ).rejects.toThrow('Invalid credentials');
  });
});

describe('registerWithCredentials', () => {
  const newUser = {
    uid: 'new-uid',
    email: 'new@example.com',
    isAnonymous: false,
    displayName: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetPersistence.mockResolvedValue(undefined);
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: newUser });
    mockUpdateProfile.mockResolvedValue(undefined);
  });

  it('should create a Firebase user and a Firestore user', async () => {
    const { Users } = require('../data');

    await registerWithCredentials('new@example.com', 'pass1234', 'New User');

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      'new@example.com',
      'pass1234',
    );
    expect(mockUpdateProfile).toHaveBeenCalledWith(newUser, {
      displayName: 'New User',
    });
    expect(Users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'new-uid',
        email: 'new@example.com',
        displayName: 'New User',
        validated: false,
        admin: false,
      }),
    );
  });

  it('should throw if createUserWithEmailAndPassword fails', async () => {
    const error = Object.assign(new Error('Email in use'), {
      code: 'auth/email-already-in-use',
    });
    mockCreateUserWithEmailAndPassword.mockRejectedValue(error);

    await expect(
      registerWithCredentials('taken@example.com', 'pass1234', 'User'),
    ).rejects.toThrow('Email in use');
  });
});

describe('updateUserPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReauthenticateWithCredential.mockResolvedValue(undefined);
    mockUpdatePassword.mockResolvedValue(undefined);
  });

  it('should reauthenticate and update password', async () => {
    await updateUserPassword('currentPass', 'newPass123');

    expect(mockReauthenticateWithCredential).toHaveBeenCalled();
    expect(mockUpdatePassword).toHaveBeenCalledWith(
      mockCurrentUser,
      'newPass123',
    );
  });

  it('should throw if reauthentication fails', async () => {
    const error = Object.assign(new Error('Wrong password'), {
      code: 'auth/wrong-password',
    });
    mockReauthenticateWithCredential.mockRejectedValue(error);

    await expect(updateUserPassword('wrongPass', 'newPass123')).rejects.toThrow(
      'Wrong password',
    );
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });
});

describe('updateUserEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReauthenticateWithCredential.mockResolvedValue(undefined);
    mockUpdateEmail.mockResolvedValue(undefined);
  });

  it('should reauthenticate and update email in Firebase Auth and Firestore', async () => {
    const { Users } = require('../data');
    const appUser = {
      id: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      admin: false,
      validated: true,
      groupId: 'group1',
      publisherId: 'pub1',
      photoURL: '',
      phoneNumber: '',
    };
    Users.getCurrent = jest.fn().mockReturnValue(appUser);
    Users.update = jest.fn().mockResolvedValue(undefined);

    await updateUserEmail('currentPass', 'newemail@example.com');

    expect(mockReauthenticateWithCredential).toHaveBeenCalled();
    expect(mockUpdateEmail).toHaveBeenCalledWith(
      mockCurrentUser,
      'newemail@example.com',
    );
    expect(Users.update).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'newemail@example.com' }),
    );
  });

  it('should throw if reauthentication fails', async () => {
    const error = Object.assign(new Error('Wrong password'), {
      code: 'auth/wrong-password',
    });
    mockReauthenticateWithCredential.mockRejectedValue(error);

    await expect(
      updateUserEmail('wrongPass', 'newemail@example.com'),
    ).rejects.toThrow('Wrong password');
    expect(mockUpdateEmail).not.toHaveBeenCalled();
  });
});
