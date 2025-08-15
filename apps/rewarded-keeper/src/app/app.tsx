import { useEffect, useState } from 'react';
import { AuthenticationPanel, AuthStatus, isAuthenticated } from './auth';
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
import * as Sentry from '@sentry/react';
import './app.module.scss';

export function App() {
  const [authenticated, setAuthenticated] = useState<AuthStatus>({
    authenticated: false,
    verified: false,
    unexisting: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    Sentry.init({
      dsn: 'https://4db4e564397075ceb3867a67ecc0f978@o4509269957607424.ingest.us.sentry.io/4509269959573504',
      // Setting this option to true will send default PII data to Sentry.
      // For example, automatic IP address collection on events
      sendDefaultPii: true,
    });

    isAuthenticated().then(
      (flag) => {
        console.log('Authentication status:', flag);
        setAuthenticated(flag);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        Flags.raiseError(error);
      },
    );
  }, []);

  useEffect(() => {
    if (!authenticated.authenticated) return;
    console.log('Loading data...');

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
    ])
      .then(() => setProgress(100))
      .catch(Flags.raiseError);
  }, [authenticated.authenticated]);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [progress]);

  return (
    <Provider store={store}>
      {isLoading && <LoadingComponent progress={progress} />}
      {!isLoading &&
        (!authenticated.authenticated ||
          !authenticated.verified ||
          authenticated.unexisting) && (
          <AuthenticationPanel status={authenticated} />
        )}
      {!isLoading && authenticated.authenticated && authenticated.verified && (
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
