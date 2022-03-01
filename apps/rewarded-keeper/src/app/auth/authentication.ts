import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence, signInWithRedirect, getRedirectResult, UserCredential, User } from "firebase/auth";
import { environment } from "../../environments/environment";
import { Users } from "../data";

export interface AuthStatus {
  authenticated: boolean;
  verified: boolean;
  unexisting: boolean;
}

initializeApp(environment.firebaseConfig);

const provider = new GoogleAuthProvider();
const auth = getAuth();

export const authenticate = async (registering = false) => {
  try {
    window.sessionStorage.setItem('registering', `${registering}`);
    await setPersistence(auth, browserLocalPersistence);
    await signInWithRedirect(auth, provider); 
  } catch (error: any) {
    console.warn(error?.message);
  }
}

export const isAuthenticated = async (): Promise<AuthStatus> => {
  try {
    const user: User | null = auth.currentUser || (await getRedirectResult(auth))?.user || null;
    if(!!user && !user.isAnonymous) {
      const registering = window.sessionStorage.getItem('registering') === 'true';
      window.sessionStorage.setItem('registering', 'false');
      const appUser = await Users.getOne(user.uid);
      const isExistingUser = !!appUser;
      if (!isExistingUser && registering) {
        createUser(user);
        return { authenticated: true, verified: false, unexisting: false };
      }

      if (isExistingUser) {
        window.sessionStorage.setItem('permissions', JSON.stringify(appUser.permissions));
      }
      return { authenticated: isExistingUser, verified: appUser?.validated || false, unexisting: !isExistingUser };
    }
  } catch(e) {
    console.error(e);
  }

  return {  authenticated: false, verified: false, unexisting: false };
}

const createUser = async (user: User) => {
  if (!!user && !user.isAnonymous) {
    await Users.create({
      id: user.uid,
      displayName: user.displayName || '', 
      permissions: [],
      publisherId: 'unassociated',
      email: user.email || '',
      validated: false,
    });
  }
}

export const logout = () => {
  return auth.signOut();
}

(() => {
  if (!environment.production) {
    connectAuthEmulator(auth, "http://localhost:9099");
  }
})();
