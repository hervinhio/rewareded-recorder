import { nanoid } from '@reduxjs/toolkit';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { AuthenticationPanel, AuthStatus, isAuthenticated } from './auth';
import { LoadingIcon } from './comps';
import { Groups, Publishers, Repports, Submissions } from './data';
import { Flags } from './data/flags';
import { Panel } from './panel';

export function App() {
  const [authenticated, setAuthenticated] = useState<AuthStatus>({
    authenticated: false,
    verified: false,
    unexisting: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    isAuthenticated().then(
      (flags) => {
        setAuthenticated(flags);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        Flags.raiseError(error, nanoid());
      }
    );
  }, []);

  useEffect(() => {
    Publishers.all().catch(Flags.raiseError);
  }, []);

  useEffect(() => {
    Submissions.all().catch(Flags.raiseError);
  }, []);

  useEffect(() => {
    Repports.all().catch(Flags.raiseError);
  }, []);

  useEffect(() => {
    Groups.get().catch(Flags.raiseError);
  }, []);

  if (isLoading) {
    return <LoadingIcon />;
  }

  if (!authenticated.authenticated || !authenticated.verified) {
    return <AuthenticationPanel status={authenticated} />;
  }

  return <Panel />;
}

export default App;
