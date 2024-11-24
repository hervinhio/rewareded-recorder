import { browserLocalPersistence, connectAuthEmulator, getAuth, getRedirectResult, GoogleAuthProvider, setPersistence, signInWithRedirect, User } from "firebase/auth";
import { Flags } from "../data/flags";
import { Authenticator, AuthStatus } from "./authenticator";
import { environment } from '../../environments/environment';
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { Users } from "../data";
import { User as AppUser } from '../types';

const provider = new GoogleAuthProvider();

export class WebAuthenticator implements Authenticator {
    private auth = getAuth();

    constructor() {
        if (!environment.production) {
            let host = 'localhost';
            if (globalThis.android) {
              host = '10.0.2.2';
            }
        
            connectAuthEmulator(this.auth, `http://${host}:9099`);
            connectFunctionsEmulator(getFunctions(), 'localhost', environment.ports.functions);
          }
    }
  
  getUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

    async authenticate(registering = false): Promise<void> {
        try {
            window.sessionStorage.setItem('registering', `${registering}`);
            await setPersistence(this.auth, browserLocalPersistence);
            await signInWithRedirect(this.auth, provider);
        } catch (error: any) {
            Flags.raiseError(error);
            console.warn(error?.message);
        }
    }

    async isAuthenticated(): Promise<AuthStatus> {
        try {
            await setPersistence(this.auth, browserLocalPersistence);
            const user: User | null =
            this.auth.currentUser || (await getRedirectResult(this.auth))?.user || null;
            if (!!user && !user.isAnonymous) {
              const registering =
                window.sessionStorage.getItem('registering') === 'true';
              window.sessionStorage.setItem('registering', 'false');
              const appUser = await Users.getOne(user.uid);
              const isExistingUser = !!appUser;

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
                verified: appUser?.validated || false,
                unexisting: !isExistingUser,
              };
            }
          } catch (e) {
            Flags.raiseError(e);
          }
        
          return { authenticated: false, verified: false, unexisting: false };
    }

    logout() {
        return this.auth.signOut();
    }
}

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
      });
    }
  };
  