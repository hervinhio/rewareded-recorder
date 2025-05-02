import { Authenticator } from './authenticator';

export * from './signin-button';
export * from './authentication';
export * from './authentication-panel';

function getAuthenticator(provider: 'google' | 'basic'): Authenticator {
  throw new Error('Not implemented');
}
