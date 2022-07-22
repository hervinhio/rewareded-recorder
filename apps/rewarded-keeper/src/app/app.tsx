import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { AuthenticationPanel, AuthStatus, isAuthenticated } from './auth';
import { LoadingIcon } from './comps';
import Page from '@atlaskit/page';
import PageHeader from '@atlaskit/page-header';
import { TopBar } from './header/top-bar';
import { Stats } from './home-report';
import { Content, Main, PageLayout } from '@atlaskit/page-layout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PublishersList } from './content-panel';
import { Groups, Publishers, Repports } from './data';
import { Events, Group, Publisher, Repport } from './types';
import { getLastSixMonths } from './utils';

export function App() {
  const months = getLastSixMonths();
  const defaultMonth = months[0];
  const [error, setError] = useState<any>();
  const [authenticated, setAuthenticated] = useState<AuthStatus>({
    authenticated: false,
    verified: false,
    unexisting: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [menu, setMenu] = useState('home');
  const [counter, setCounter] = useState(0);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [repports, setRepports] = useState<Repport[]>([]);
  const [currentMonthRepports, setCurrentMonthRepports] = useState<Repport[]>(
    []
  );
  const [groups, setGroups] = useState<Group[]>([]);
  const [publishersCounter, setPublishersCounter] = useState(0);
  const [groupsCounter, setGroupsCounter] = useState(0);
  const [repportsCounter, setRepportsCounter] = useState(0);
  const [authNumber, setAuthNumber] = useState(Math.random());

  useEffect(() => {
    isAuthenticated()
      .then(
        (flags) => {
          setAuthenticated(flags);
          setCounter(counter + 1);
          setIsLoading(false);
        },
        (error) => {
          setIsLoading(false);
          setError(error);
        }
      )
      .catch((e) => {
        console.error(e);
      });
  }, [authNumber]);

  useEffect(() => {
    Publishers.all().then(
      (pubs) => setPublishers(pubs),
      (err) => console.error(err)
    );
  }, [publishersCounter]);

  useEffect(() => {
    Repports.unsubmitted().then(
      (reps) => setRepports(reps),
      (err) => console.error(err)
    );
    Repports.byMonthId(defaultMonth.getKey()).then(
      (reps) => setCurrentMonthRepports(reps),
      (err) => console.error(err)
    );
  }, [repportsCounter]);

  useEffect(() => {
    Groups.get().then(
      (gps) => setGroups(gps),
      (err) => console.error(err)
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

  return (
    <Router>
      <PageLayout>
        <TopBar
          publishers={publishers}
          groups={groups}
          repports={currentMonthRepports}
          currentRepports={currentMonthRepports}
          onMenuChange={(m: string) => {
            if (m !== menu) setMenu(menu);
          }}
        />
        <Content testId="content">
          <Main id="main-content" skipLinkTitle="Main Content">
            <div className="app-main-container">
              <Page>
                <PageHeader actions={undefined}>
                  Gestionnaire de rapports de service
                </PageHeader>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Stats
                        repports={repports}
                        publishers={publishers}
                      />
                    }
                  />
                  <Route
                    path="/publishers/:groupId"
                    element={
                      <PublishersList
                        publishers={publishers}
                        repports={currentMonthRepports}
                      />
                    }
                  />
                </Routes>
              </Page>
            </div>
          </Main>
        </Content>
      </PageLayout>
    </Router>
  );
}

export default App;
