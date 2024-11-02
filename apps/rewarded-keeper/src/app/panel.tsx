import { TopBar } from './header/top-bar';
import { Stats } from './home-report';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PublishersList } from './content-panel';
import { PublisherView } from './content-panel/publisher-view';
import { FlagsContainer } from './comps';
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
import { makeStyles, MessageBar, Title2 } from '@fluentui/react-components';
import { AppDrawer } from './drawer';
import { Hamburger } from '@fluentui/react-nav-preview';

const useClasses = makeStyles({
  message: {
    marginBottom: '8px',
  },
});

export function Panel() {
  const [menu, setMenu] = useState('home');
  const theme = useSelector(determineThemeMode);
  const styles = useClasses();
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);
  const toggleAppDrawerOpen = () => setAppDrawerOpen(!appDrawerOpen);

  setGlobalTheme({
    light: 'light',
    dark: 'dark',
    colorMode: theme,
  });

  return (
    <Router>
      <div className="panel">
        <AppDrawer
          isOpen={appDrawerOpen}
          onHide={() => setAppDrawerOpen(false)}
        />

        <div className="main">
          <TopBar
            onMenuChange={(m: string) => {
              if (m !== menu) setMenu(menu);
            }}
            hamburger={
              <Hamburger
                className="hamburger"
                onClick={() => toggleAppDrawerOpen()}
              />
            }
          />

          <div className="content">
            <Title2>Gestionnaire de rapports de service</Title2>
            <MessageBar intent="info" className={styles.message}>
              L'interface utilisateur est en cours de révision. Vous remarquerez
              certains changements dans l'affichage.
            </MessageBar>
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
            <DialogsFragment />
          </div>
        </div>
      </div>
    </Router>
  );
}
