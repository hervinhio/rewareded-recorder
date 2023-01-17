import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { AuthenticationPanel, AuthStatus, isAuthenticated } from './auth';
import { LoadingIcon } from './comps';
import { Groups, Publishers, Repports } from './data';
import { Events } from './types';
import { getLastSixMonths } from './utils';

import { store } from './data';
import { Panel } from './panel';

export function App() {
  const months = getLastSixMonths();
  const defaultMonth = months[0];
  const [authenticated, setAuthenticated] = useState<AuthStatus>({
    authenticated: false,
    verified: false,
    unexisting: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [counter, setCounter] = useState(0);
  const [publishersCounter, setPublishersCounter] = useState(0);
  const [groupsCounter, setGroupsCounter] = useState(0);
  const [repportsCounter, setRepportsCounter] = useState(0);
  const [authNumber, setAuthNumber] = useState(Math.random());

  useEffect(() => {
    isAuthenticated().then(
      (flags) => {
        setAuthenticated(flags);
        setCounter(counter + 1);
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        console.log(error);
      }
    );
  }, [authNumber]);

  useEffect(() => {
    Publishers.all().then(
      (pubs) => store.dispatch(Publishers.slice.actions.loaded(pubs)),
      console.error
    );
  }, [publishersCounter]);

  useEffect(() => {
    Repports.unsubmitted().then(
      (reps) => store.dispatch(Repports.slice.actions.unsubmittedLoaded(reps)),
      console.error
    );
    Repports.byMonthId(defaultMonth.getKey()).then(
      (reps) => store.dispatch(Repports.slice.actions.currentLoaded(reps)),
      console.error
    );
  }, [repportsCounter]);

  useEffect(() => {
    Groups.get().then(
      (gps) => store.dispatch(Groups.slice.actions.loaded(gps)),
      console.error
    );
  }, [groupsCounter]);

  useEffect(() => {
    const onPublisherUpdate = () => setPublishersCounter(publishersCounter + 1);
    Events.on('publisher_updated', onPublisherUpdate);

    return () => Events.off('publisher_updated', onPublisherUpdate);
  });

  useEffect(() => {
    const onGroupUpdated = () => setGroupsCounter(groupsCounter + 1);
    Events.on('group_updated', onGroupUpdated);

    return () => Events.off('group_updated', onGroupUpdated);
  });

  useEffect(() => {
    const onRepportUpdated = () => setRepportsCounter(repportsCounter + 1);
    Events.on('repport_updated', onRepportUpdated);

    return () => Events.off('repport_updated', onRepportUpdated);
  });

  useEffect(() => {
    const onLogout = () => setAuthNumber(Math.random());
    Events.on('logout', onLogout);

    return () => Events.off('logout', onLogout);
  });

  if (isLoading) {
    return <LoadingIcon />;
  }

  if (!authenticated.authenticated || !authenticated.verified) {
    return <AuthenticationPanel status={authenticated} />;
  }

  return <Panel />;
}

export default App;
