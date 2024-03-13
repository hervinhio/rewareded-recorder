import 'bootstrap/dist/css/bootstrap.min.css';
import { nanoid } from '@reduxjs/toolkit';
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
import ProgressBar from '@atlaskit/progress-bar';
import { AtlaskitThemeProvider } from '@atlaskit/theme';
import { setGlobalTheme } from '@atlaskit/tokens';
import './app.module.scss';

export function App() {
  const [authenticated, setAuthenticated] = useState<AuthStatus>({
    authenticated: false,
    verified: false,
    unexisting: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const theme = window.matchMedia('(prefers-color-scheme: dark)')
    ? 'dark'
    : 'light';

  setGlobalTheme({
    light: 'light',
    dark: 'dark',
    colorMode: theme,
  });

  useEffect(() => {
    isAuthenticated().then(
      (flag) => {
        setAuthenticated(flag);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        Flags.raiseError(error, nanoid());
      }
    );
  }, []);

  useEffect(() => {
    if (!authenticated.authenticated) return;

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
    ]).then(() => setIsLoading(false));
  }, [authenticated.authenticated]);

  return (
    <AtlaskitThemeProvider mode={theme}>
      <Provider store={store}>
        {getComponentToRender(authenticated, isLoading, progress)}
      </Provider>
    </AtlaskitThemeProvider>
  );
}

function getComponentToRender(
  authenticated: any,
  isLoading: boolean,
  progress: number
) {
  if (isLoading) {
    return (
      <div className="progress-bar-container">
        <ProgressBar appearance="success" value={progress} />;
      </div>
    );
  }

  if (!authenticated.authenticated || !authenticated.verified) {
    return <AuthenticationPanel status={authenticated} />;
  }

  return <Panel />;
}

export default App;
