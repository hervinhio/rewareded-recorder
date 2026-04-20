import { useEffect, useState } from 'react';
import { AuthenticationPanel, AuthStatus, isAuthenticated } from './auth';
import {
  AttendanceRecords,
  Config,
  Congregations,
  GlobalState,
  Groups,
  Publishers,
  Reports,
  SpecialMonths,
  Submissions,
  Users,
  store,
} from './data';
import { Flags } from './data/flags';
import { Panel } from './panel';
import { Provider, shallowEqual, useSelector } from 'react-redux';
import {
  FluentProvider,
  MessageBar,
  MessageBarBody,
  ProgressBar,
} from '@fluentui/react-components';
import * as Sentry from '@sentry/react';
import { createSentryOptions } from './sentry';
import { darkTheme, determineThemeMode, lightTheme } from './theme';
import './app.module.scss';
import { Role } from './types';

export function App() {
  return (
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  );
}

function ThemedApp() {
  const [authenticated, setAuthenticated] = useState<AuthStatus>({
    authenticated: false,
    verified: false,
    unexisting: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [missingCongregation, setMissingCongregation] = useState(false);

  const config = useSelector(
    (state: GlobalState) => state.config,
    shallowEqual,
  );
  const currentThemeMode = determineThemeMode({ config } as GlobalState);

  useEffect(() => {
    Sentry.init(createSentryOptions());

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

    const currentUser = Users.getCurrent();
    const isRoot = currentUser?.role === Role.ROOT;

    // Guard: non-root users must have a congregationId
    if (!isRoot && !currentUser?.congregationId) {
      setMissingCongregation(true);
      setIsLoading(false);
      return;
    }

    // For non-root users, set the active congregationId for scoped queries
    if (!isRoot && currentUser?.congregationId) {
      Congregations.setActive(currentUser.congregationId);
    }

    Promise.allSettled([
      Groups.get()
        .then(() => setProgress(progress + 12.5))
        .catch(Flags.raiseError),
      Config.load()
        .then(() => setProgress(progress + 12.5))
        .catch(Flags.raiseError),
      Users.all()
        .then(() => setProgress(progress + 12.5))
        .catch(Flags.raiseError),
      Publishers.all() // This now loads and combines legacy reports automatically
        .then(() => setProgress(progress + 12.5))
        .catch(Flags.raiseError),
      AttendanceRecords.load()
        .then(() => setProgress(progress + 12.5))
        .catch(Flags.raiseError),
      Submissions.all()
        .then(() => setProgress(progress + 12.5))
        .catch(Flags.raiseError),
      SpecialMonths.getAll()
        .then(() => setProgress(progress + 12.5))
        .catch(Flags.raiseError),
      ...(isRoot
        ? [
            Congregations.getAll()
              .then(() => setProgress(progress + 12.5))
              .catch(Flags.raiseError),
          ]
        : []),
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
    <FluentProvider
      theme={currentThemeMode === 'light' ? lightTheme : darkTheme}
      style={{ height: '100%' }}>
      {isLoading && <LoadingComponent progress={progress} />}
      {!isLoading &&
        (!authenticated.authenticated ||
          !authenticated.verified ||
          authenticated.unexisting) && (
          <AuthenticationPanel
            status={authenticated}
            onAuthSuccess={(status) => {
              setAuthenticated(status);
              if (status.authenticated && status.verified) {
                setIsLoading(true);
              } else {
                setIsLoading(false);
              }
            }}
          />
        )}
      {!isLoading &&
        authenticated.authenticated &&
        authenticated.verified &&
        missingCongregation && <MissingCongregationError />}
      {!isLoading &&
        authenticated.authenticated &&
        authenticated.verified &&
        !missingCongregation && <Panel />}
    </FluentProvider>
  );
}

function MissingCongregationError() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '24px',
      }}>
      <MessageBar intent="error">
        <MessageBarBody>
          Veuillez demander à l'administrateur de vous assigner à une
          congrégation.
        </MessageBarBody>
      </MessageBar>
    </div>
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
