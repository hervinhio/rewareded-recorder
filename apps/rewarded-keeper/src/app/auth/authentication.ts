import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { Authenticator, AuthStatus } from './authenticator';
import { AndroidAuthenticator } from './authentication.android';
import { WebAuthenticator } from './authenticator.web';


export let authenticator: Authenticator;

export const authenticate = async (registering = false) => {
  return authenticator.authenticate(registering);
};

export const isAuthenticated = async (): Promise<AuthStatus> => {
  return authenticator.isAuthenticated();
};

export const logout = () => {
  return authenticator.logout();
};

(() => {
  authenticator = globalThis.android ? new AndroidAuthenticator() : new WebAuthenticator();
  initializeApp(environment.firebaseConfig);
})();
