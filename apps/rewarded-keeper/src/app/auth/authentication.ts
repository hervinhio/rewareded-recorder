import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
  signInWithRedirect,
  getRedirectResult,
  User,
} from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { environment } from '../../environments/environment';
import { Users } from '../data';

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
    console.warn(error?.message);
  }
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
      if (!isExistingUser && registering) {
        createUser(user);
        return { authenticated: true, verified: false, unexisting: false };
      }

      if (isExistingUser) {
        Users.setCurrent(appUser);
      }
      return {
        authenticated: isExistingUser,
        verified: appUser?.validated || false,
        unexisting: !isExistingUser,
      };
    }
  } catch (e) {
    console.error(e);
  }

  return { authenticated: false, verified: false, unexisting: false };
};

const createUser = async (user: User) => {
  if (!!user && !user.isAnonymous) {
    await Users.create({
      id: user.uid,
      displayName: user.displayName || '',
      admin: false,
      publisherId: 'unassociated',
      email: user.email || '',
      validated: false,
    });
  }
};

export const logout = () => {
  return auth.signOut();
};

(() => {
  if (!environment.production) {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFunctionsEmulator(getFunctions(), 'localhost', environment.ports.functions);
  }
})();
