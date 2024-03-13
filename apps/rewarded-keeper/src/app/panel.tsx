import Page from '@atlaskit/page';
import PageHeader from '@atlaskit/page-header';
import { TopBar } from './header/top-bar';
import { Stats } from './home-report';
import { Content, Main, PageLayout } from '@atlaskit/page-layout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PublishersList } from './content-panel';
import { PublisherView } from './content-panel/publisher-view';
import { FlagsContainer, Sidenav } from './comps';
import { useState } from 'react';
import { ConfigPage } from './config/config-page';
import {
  AttendancePage,
  ContactsPage,
  GroupsPage,
  StatsPage,
  UsersPage,
} from './admin';
import { DialogsFragment } from './dialogs-fragment';
import './panel.scss';
import { setGlobalTheme } from '@atlaskit/tokens';
import { useSelector } from 'react-redux';
import { determineThemeMode } from './theme';

export function Panel() {
  const [menu, setMenu] = useState('home');
  const theme = useSelector(determineThemeMode);

  setGlobalTheme({
    light: 'light',
    dark: 'dark',
    colorMode: theme,
  });

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
              <div className="sidenav">
                <Sidenav onClose={() => undefined} isDrawerMode={false} />
              </div>
              <Page>
                <PageHeader>Gestionnaire de rapports de service</PageHeader>
                <Routes>
                  <Route path="/" element={<Stats />} />
                  <Route path="/groups/:groupId" element={<PublishersList />} />
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
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/attendance" element={<AttendancePage />} />
                </Routes>
                <FlagsContainer />
              </Page>
            </div>
            <DialogsFragment />
          </Main>
        </Content>
      </PageLayout>
    </Router>
  );
}
