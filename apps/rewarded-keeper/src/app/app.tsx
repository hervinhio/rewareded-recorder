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

export function App() {
  const [error, setError] = useState<any>();
  const [authenticated, setAuthenticated] = useState<AuthStatus>({
    authenticated: false,
    verified: false,
    unexisting: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [menu, setMenu] = useState('home');

  useEffect(() => {
    isAuthenticated()
      .then(
        (flags) => {
          setAuthenticated(flags);
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
  }, []);

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
                  <Route path="/" element={<Stats />} />
                  <Route
                    path="/publishers/:groupId"
                    element={<PublishersList />}
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
