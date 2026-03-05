import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  EmailAuthProvider,
  getAuth,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  updatePassword as updateFirebasePassword,
  verifyBeforeUpdateEmail,
  updateProfile,
  getRedirectResult,
  linkWithPopup,
  User,
} from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { environment } from '../../environments/environment';
import { Users } from '../data';
import { Flags } from '../data/flags';
import { User as AppUser, Role } from '../types';

export interface AuthStatus {
  authenticated: boolean;
  verified: boolean;
  unexisting: boolean;
}

initializeApp(environment.firebaseConfig);

const provider = new GoogleAuthProvider();
export const auth = getAuth();

export const authenticate = async (registering = false) => {
  try {
    window.sessionStorage.setItem('registering', `${registering}`);
    await setPersistence(auth, browserLocalPersistence);
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    Flags.raiseError(error);
    console.warn(error?.message);
  }
};

export const authenticateWithCredentials = async (
  email: string,
  password: string,
): Promise<void> => {
  await setPersistence(auth, browserLocalPersistence);
  await signInWithEmailAndPassword(auth, email, password);
};

export const registerWithCredentials = async (
  email: string,
  password: string,
  displayName: string,
): Promise<void> => {
  await setPersistence(auth, browserLocalPersistence);
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  await updateProfile(userCredential.user, { displayName });
  await Users.create({
    id: userCredential.user.uid,
    displayName,
    admin: false,
    publisherId: 'unassociated',
    email,
    validated: false,
    groupId: 'unafiliated',
    photoURL: '',
    phoneNumber: '',
    role: Role.BASIC,
    notifications: [],
  });
};

export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No authenticated user');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updateFirebasePassword(user, newPassword);
};

export const updateUserEmail = async (newEmail: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  await verifyBeforeUpdateEmail(user, newEmail);
};

export const linkWithGoogle = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');
  const googleProvider = new GoogleAuthProvider();
  await linkWithPopup(user, googleProvider);
};

export const isAuthenticated = async (): Promise<AuthStatus> => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const user: User | null =
      auth.currentUser || (await getRedirectResult(auth))?.user || null;
    if (!!user && !user.isAnonymous) {
      const registering =
        window.sessionStorage.getItem('registering') === 'true';
      window.sessionStorage.setItem('registering', 'false');
      const appUser = await Users.getOne(user.uid);
      const isExistingUser = !!appUser;
      console.log(appUser);
      if (!isExistingUser && registering) {
        createUser(user);
        return { authenticated: true, verified: false, unexisting: false,  };
      }

      if (isExistingUser) {
        const userUpdate = {
          id: user.uid,
          displayName: user.displayName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          photoURL: user.photoURL || '',
          validated: appUser.validated,
          admin: appUser.admin,
        };

        if (userHasChangedData(user, appUser)) {
          Users.update(userUpdate as any);
          Users.setCurrent({ ...appUser, ...userUpdate, });
        } else {
          Users.setCurrent(appUser);
        }
      }
      return {
        authenticated: isExistingUser,
        verified: !!appUser?.validated,
        unexisting: !isExistingUser,
      };
    }
  } catch (e) {
    Flags.raiseError(e);
  }

  return { authenticated: false, verified: false, unexisting: false };
};

function userHasChangedData(user: User, appUser: AppUser) {
  return user.displayName !== appUser.displayName ||
    user.email !== appUser.email ||
    ((user.photoURL !== appUser.photoURL) && user.photoURL !== null) ||
    ((user.phoneNumber !== appUser.phoneNumber) && user.phoneNumber !== null);
}


const createUser = async (user: User) => {
  if (!!user && !user.isAnonymous) {
    await Users.create({
      id: user.uid,
      displayName: user.displayName || '',
      admin: false,
      publisherId: 'unassociated',
      email: user.email || '',
      validated: false,
      groupId: 'unafiliated',
      photoURL: user.photoURL || '',
      phoneNumber: user.phoneNumber || '',
      role: Role.BASIC, // Set default role for new users
      notifications: [],
    });
  }
};

export const logout = () => {
  return auth.signOut();
};

(() => {
  if (!environment.production && !environment.testing) {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFunctionsEmulator(getFunctions(), 'localhost', environment.ports.functions);
  }
})();
