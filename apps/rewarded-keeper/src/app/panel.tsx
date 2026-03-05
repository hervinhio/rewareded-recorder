import { TopBar } from './header/top-bar';
import { Stats } from './home-report';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PublishersList, AppointedMembers } from './content-panel';
import { PublisherView } from './content-panel/publisher-view';
import { FlagsContainer, BottomNav } from './comps';
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
import { SpecialMonthsPage } from './special-months';
import './panel.scss';
import {
  makeStyles,
  tokens,
  Title2,
} from '@fluentui/react-components';
import { AppDrawer } from './drawer';
import { Hamburger } from '@fluentui/react-nav-preview';
import { HelpPage } from './help/help-page';
import { CasesPage } from './cases/cases-page';
import { RequestsPage } from './requests/requests-page';

const useClasses = makeStyles({
  message: {
    marginBottom: '8px',
  },
  panel: {
    backgroundColor: tokens.colorNeutralBackground1,
  },
});

export function Panel() {
  const [menu, setMenu] = useState('home');
  const styles = useClasses();
  const [appDrawerOpen, setAppDrawerOpen] = useState(false);
  const toggleAppDrawerOpen = () => setAppDrawerOpen(!appDrawerOpen);

  return (
    <div className={`panel ${styles.panel}`}>
      <Router>
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
            <Routes>
              <Route path="/" element={<Stats />} />
              <Route path="/appointed-members" element={<AppointedMembers />} />
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
              <Route path="/months" element={<SpecialMonthsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/cases" element={<CasesPage />} />
              <Route path="/requests" element={<RequestsPage />} />
            </Routes>
            <FlagsContainer />
            <DialogsFragment />
          </div>
          <BottomNav />
        </div>
      </Router>
    </div>
  );
}
