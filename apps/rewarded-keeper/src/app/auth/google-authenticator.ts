import { Authenticator } from './authenticator';
import { Credentials } from './credentials';
import { LoginResponse } from './login-response';
import axios, { AxiosResponse } from 'axios';
import { NavigateFunction } from 'react-router-dom';
import { Flags } from '../data/flags';

export class GoogleAuthenticator implements Authenticator {
  constructor(private navigate: NavigateFunction) {
    if (window.location.search.includes('code=')) {
      const code = window.location.search.split('code=')[1];
      this.logIn({ code }).then(() => {});
    }
  }

  logIn(credentials?: Credentials): Promise<void> {
    if (credentials?.code) {
      return this.handleAuthorizationCode(credentials.code);
    }

    return this.redirectToGoogleAuth();
  }

  logOut(): Promise<void> {
    return axios.post<null, void>('/auth/logout', null, {
      headers: {
        'X-Authorization-Provider': 'google',
      },
    });
  }

  private redirectToGoogleAuth() {
    return axios
      .post<null, AxiosResponse<LoginResponse>>('/auth/login', null, {
        headers: {
          'X-Authorization-Provider': 'google',
        },
      })
      .then(({ data }) => {
        window.location.href = data.url!;
      });
  }

  private handleAuthorizationCode(code: string) {
    return axios
      .post<null, AxiosResponse<LoginResponse>>(
        `/auth/login/google?code=${code}`,
        null,
        {
          headers: {
            'X-Authorization-Provider': 'google',
          },
        },
      )
      .then(({ data }) => {
        if (data.action === 'register') {
          this.navigate('sec/register', {
            state: {
              provider: 'google',
              action: 'register',
              code,
            },
          });
        } else {
          this.navigate('', {
            state: {
              action: 'continue',
            },
          });
        }
      });
  }

  signUp(credentials?: Credentials): Promise<void> {
    const gt = localStorage.getItem('gt');
    localStorage.removeItem('gt');

    return axios
      .post<{ gt: string | null }, AxiosResponse<LoginResponse>>(
        `/auth/register?code=${credentials?.code}`,
        { gt },
        {
          headers: {
            'X-Authorization-Provider': 'google',
          },
        },
      )
      .then(({ data }) => {
        localStorage.setItem('jwt', data.jwt!);
        this.navigate('', {
          state: {
            action: 'continue',
          },
        });
      });
  }

  verify(): Promise<{ ok: boolean; action: 'stop' | 'continue' | 'error' }> {
    return axios
      .post<null, AxiosResponse<{ ok: boolean; action: 'stop' | 'continue' | 'error' }>>(
        '/auth/verify',
        null,
        {
          headers: {
            'X-Authorization-Provider': 'google',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          },
        },
      )
      .then(({ data }) => {
        return data;
      })
      .catch(error => {
        Flags.raiseError(error);
        return { ok: false, action: 'error' };
      })
  }
}
