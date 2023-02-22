import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { AuthenticationPanel, AuthStatus, isAuthenticated } from './auth';
import { LoadingIcon } from './comps';
import { Groups, Publishers, Repports, Submissions } from './data';
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
        console.log(error);
      }
    );
  }, []);

  useEffect(() => {
    Publishers.all().catch(console.error);
  }, []);

  useEffect(() => {
    Submissions.all().catch(console.error);
  }, []);

  useEffect(() => {
    Repports.all().catch(console.error);
  }, []);

  useEffect(() => {
    Groups.get().catch(console.error);
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
