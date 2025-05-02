import { Authenticator } from './authenticator';
import { Credentials } from './credentials';
import { LoginResponse } from './login-response';
import axios from 'axios';

export class GoogleAuthenticator implements Authenticator {
  logIn(credentials?: Credentials): Promise<void> {
    if (credentials?.code) {
      return this.handleAuthorizationCode(credentials.code);
    }

    return this.redirectToGoogleAuth();
  }

  logOut(): Promise<void> {
    return axios.post('/auth/logout', null, {
      headers: {
        'X-Authorization-Provider': 'google',
      }
    });
  }

  private redirectToGoogleAuth() {
    return axios
      .post<null, LoginResponse>('/auth/login', null, {
        headers: {
          'X-Authorization-Provider': 'google',
        },
      })
      .then(({ url }) => {
        window.location.href = url!;
      });
  }

  private handleAuthorizationCode(code: string) {
    return axios
      .post<null, LoginResponse>(`/auth/login/google?code=${code}`, null, {
        headers: {
          'X-Authorization-Provider': 'google',
        },
      })
      .then((response) => {
        localStorage.setItem('gt', response.gt!);
        if (response.action === 'register') {
          /*
          this.router.navigate(['sec/register'], {
            queryParams: {
              provider: 'google',
            },
          });
         */
        } else {
          // this.router.navigate(['']);
        }
      });
  }

  signUp(credentials: Credentials): Promise<void> {
    const gt = localStorage.getItem('gt');
    localStorage.removeItem('gt');

    return axios
      .post<{ gt: string | null }, LoginResponse>(
        `/auth/register?code=${credentials.code}`,
        { gt },
        {
          headers: {
            'X-Authorization-Provider': 'google',
          },
        },
      )
      .then((response) => {
          localStorage.setItem('jwt', response.jwt!);
          // return response;
      });
  }
}
