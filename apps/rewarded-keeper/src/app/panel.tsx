import Page from '@atlaskit/page';
import PageHeader from '@atlaskit/page-header';
import { TopBar } from './header/top-bar';
import { Stats } from './home-report';
import { Content, Main, PageLayout } from '@atlaskit/page-layout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PublishersList } from './content-panel';
import { PublisherView } from './content-panel/publisher-view';
import { Provider } from 'react-redux';
import { FlagsContainer } from './comps';
import { store } from './data';
import { useState } from 'react';
import { ConfigPage } from './config/config-page';
import { GroupsPage, UsersPage } from './admin';

export function Panel() {
  const [menu, setMenu] = useState('home');

  return (
    <Provider store={store}>
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
                      path="/groups/:groupId"
                      element={<PublishersList />}
                    />
                    <Route
                      path="/groups/:groupId/:publisherId"
                      element={
                        <PublisherView
                          onHide={() => {
                            // Nothing
                          }}
                        />
                      }
                    />
                    <Route
                      path="/publishers/:publisherId"
                      element={
                        <PublisherView
                          onHide={() => {
                            // Nothing
                          }}
                        />
                      }
                    />
                    <Route path="/settings" element={<ConfigPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/groups" element={<GroupsPage />} />
                  </Routes>
                  <FlagsContainer />
                </Page>
              </div>
            </Main>
          </Content>
        </PageLayout>
      </Router>
    </Provider>
  );
}
