import Page from '@atlaskit/page';
import PageHeader from '@atlaskit/page-header';
import { TopBar } from './header/top-bar';
import { Stats } from './home-report';
import { Content, Main, PageLayout } from '@atlaskit/page-layout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PublishersList } from './content-panel';
import { PublisherView } from './content-panel/publisher-view';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  AttendanceReportModal,
  CreateGroupModal,
  CreatePublisherModal,
  DownloadMissingReportsModal,
  FlagsContainer,
  RepportModal,
  SearchModal,
  Sidenav,
} from './comps';
import { Dialogs, GlobalState } from './data';
import { Fragment, useState } from 'react';
import { ConfigPage } from './config/config-page';
import {
  AttendancePage,
  ContactsPage,
  GroupsPage,
  StatsPage,
  UsersPage,
} from './admin';
import { AtlaskitThemeProvider } from '@atlaskit/theme';

export function Panel() {
  const [menu, setMenu] = useState('home');
  const theme = useSelector((state: GlobalState) => {
    return state.config.theme === 'system' ? 'light' : state.config.theme;
  });

  return (
    <Router>
      <AtlaskitThemeProvider mode={theme}>
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
      </AtlaskitThemeProvider>
    </Router>
  );
}

function DialogsFragment() {
  const {
    showSearchDialog,
    showCreatePublisherModal,
    showCreateGroupModal,
    showCreateReportModal,
    showDownloadMissingReportsModal,
    showAttendanceReportModal,
  } = useSelector((state: GlobalState) => state.dialogs, shallowEqual);
  const dispatch = useDispatch();

  return (
    <Fragment>
      {showSearchDialog && (
        <SearchModal
          onClose={() => dispatch(Dialogs.slice.actions.toggleSearchDialog())}
        />
      )}
      {showCreatePublisherModal && (
        <CreatePublisherModal
          show={showCreatePublisherModal}
          onHide={() =>
            dispatch(Dialogs.slice.actions.toggleCreatePublisherModal())
          }
        />
      )}
      {showCreateGroupModal && (
        <CreateGroupModal
          show={showCreateGroupModal}
          onHide={() =>
            dispatch(Dialogs.slice.actions.toggleCreateGroupModal())
          }
        />
      )}
      {showCreateReportModal && (
        <RepportModal
          show={showCreateReportModal}
          onHide={() =>
            dispatch(Dialogs.slice.actions.toggleCreateReportModal())
          }
          publisherId={undefined}
        />
      )}
      {showDownloadMissingReportsModal && (
        <DownloadMissingReportsModal
          show={showDownloadMissingReportsModal}
          onHide={() =>
            dispatch(Dialogs.slice.actions.toggleDownloadMissingReportsModal())
          }
        />
      )}
      {showAttendanceReportModal && (
        <AttendanceReportModal
          show={showAttendanceReportModal}
          mode="create"
          onHide={() =>
            dispatch(Dialogs.slice.actions.toggleAttendanceReportModal())
          }
        />
      )}
    </Fragment>
  );
}
