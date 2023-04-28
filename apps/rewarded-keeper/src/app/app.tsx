import 'bootstrap/dist/css/bootstrap.min.css';
import './app.module.scss';
import { nanoid } from '@reduxjs/toolkit';

import { useEffect, useState } from 'react';
import { AuthenticationPanel, AuthStatus, isAuthenticated } from './auth';
import { LoadingIcon } from './comps';
import {
  AttendanceRecords,
  Config,
  Groups,
  Publishers,
  Repports,
  Submissions,
  Users,
  store,
} from './data';
import { Flags } from './data/flags';
import { Panel } from './panel';
import { Provider } from 'react-redux';

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
    Publishers.all().catch((error) => {
      error.message = `Fetching publishers failed with error message; ${error.message}`;
      Flags.raiseError(error);
    });
  }, []);

  useEffect(() => {
    Submissions.all().catch(Flags.raiseError);
  }, []);

  useEffect(() => {
    Repports.all().catch((error) => {
      error.message = `Fetching reports failed with error message; ${error.message}`;
      Flags.raiseError(error);
    });
  }, []);

  useEffect(() => {
    Groups.get().catch(Flags.raiseError);
  }, []);

  useEffect(() => {
    Config.load().catch(Flags.raiseError);
  }, []);

  useEffect(() => {
    Users.all().catch((error) => {
      error.message = `Fetching users failed with error message; ${error.message}`;
      Flags.raiseError(error);
    });
  }, []);

  useEffect(() => {
    AttendanceRecords.load().catch((error) => {
      error.message = `Fetching attendance recors failed with error message; ${error.message}`;
      Flags.raiseError(error);
    });
  }, []);

  if (isLoading) {
    return <LoadingIcon />;
  }

  if (!authenticated.authenticated || !authenticated.verified) {
    return <AuthenticationPanel status={authenticated} />;
  }

  return (
    <Provider store={store}>
      <Panel />
    </Provider>
  );
}

export default App;
