import { useEffect, useMemo, useState } from 'react';
import { AuthenticationPanel } from './auth';
import {
  AttendanceRecords,
  Config,
  Groups,
  Publishers,
  Reports,
  Submissions,
  Users,
  store,
} from './data';
import { Flags } from './data/flags';
import { Panel } from './panel';
import { Provider } from 'react-redux';
import { ProgressBar } from '@fluentui/react-components';
import './app.module.scss';
import { GoogleAuthenticator } from './auth/google-authenticator';
import { useNavigate } from 'react-router-dom';

export function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [authenticationAction, setAuthenticationAction] = useState<
    'continue' | 'stop' | 'error' | ''
  >('');
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const authenticator = useMemo(() => {
    return new GoogleAuthenticator(navigate);
  }, []);

  useEffect(() => {
    authenticator.verify().then(
      (response) => {
        setAuthenticated(response.ok);
        setAuthenticationAction(response.action);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        Flags.raiseError(error);
      },
    );
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    setIsLoading(true);

    Promise.allSettled([
      Groups.get()
        .then(() => setProgress(progress + 14.29))
        .catch(Flags.raiseError),
      Config.load()
        .then(() => setProgress(progress + 14.29))
        .catch(Flags.raiseError),
      Users.all()
        .then(() => setProgress(progress + 14.29))
        .catch(Flags.raiseError),
      Reports.all()
        .then(() => setProgress(progress + 14.29))
        .catch(Flags.raiseError),
      Publishers.all()
        .then(() => setProgress(progress + 14.29))
        .catch(Flags.raiseError),
      AttendanceRecords.load()
        .then(() => setProgress(progress + 14.29))
        .catch(Flags.raiseError),
      Submissions.all()
        .then(() => setProgress(progress + 14.29))
        .catch(Flags.raiseError),
    ]).then(() => setProgress(100));
  }, [authenticated]);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [progress]);

  return (
    <Provider store={store}>
      {isLoading && <LoadingComponent progress={progress} />}
      {!isLoading &&
        (!authenticated || authenticationAction !== 'continue') && (
          <AuthenticationPanel action={authenticationAction} />
        )}
      {!isLoading && authenticated && authenticationAction === 'continue' && (
        <Panel />
      )}
    </Provider>
  );
}

function LoadingComponent({ progress }: { progress: number }) {
  return (
    <div className="progress-bar-container">
      <ProgressBar max={100} value={progress} thickness="large" />
    </div>
  );
}

export default App;
