import { Credentials } from './credentials';

export interface Authenticator {
  logIn(credentials?: Credentials): Promise<void>;
  signUp(credentials: Credentials): Promise<void>;
  logOut(): Promise<void>;
  verify(): Promise<{ ok: boolean, action: 'stop' | 'continue' | 'error' }>
}
