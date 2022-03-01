import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { AuthenticationPanel, AuthStatus, isAuthenticated } from './auth';
import { LoadingIcon } from './comps';
import { GroupsPanel } from './groups-panel';
import Page from '@atlaskit/page';
import DropdownMenu, { DropdownItem } from '@atlaskit/dropdown-menu';
import PageHeader from '@atlaskit/page-header';
import { CreateGroupModal, CreatePublisherModal } from './modals';
import { Header } from './header/header';
import { currentUserHasPermission } from './types';
import { Stats } from './home-report';

export function App() {
  const [error, setError] = useState<any>();
  const [authenticated, setAuthenticated] = useState<AuthStatus>({
    authenticated: false,
    verified: false,
    unexisting: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreatePublisherModal, setShowCreatePublisherModal] =
    useState(false);
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
    <>
      <Header onMenuChange={(menu: string) => setMenu(menu)} />
      {menu === 'home' && (
        <div className="app-main-container">
          <Page>
            <PageHeader actions={undefined}>
              Gestionnaire de rapports de service
            </PageHeader>
            <Stats />
          </Page>
        </div>
      )}
      {menu === 'publishers' && (
        <div className="app-main-container">
          <Page>
            <PageHeader
              actions={makeActionsContent(
                setShowCreateGroupModal,
                setShowCreatePublisherModal
              )}
            >
              Gestionnaire de rapports de service
            </PageHeader>
            <GroupsPanel />
            {showCreateGroupModal && (
              <CreateGroupModal
                onHide={() => setShowCreateGroupModal(false)}
                show={showCreateGroupModal}
              />
            )}
            {showCreatePublisherModal && (
              <CreatePublisherModal
                groupId={'unafiliated'}
                onHide={() => setShowCreatePublisherModal(false)}
                show={showCreatePublisherModal}
              />
            )}
          </Page>
        </div>
      )}
    </>
  );
}

const makeActionsContent = (
  setShowCreateGroupModal: (show: boolean) => void,
  setShowCreatePublisherModal: (show: boolean) => void
) => {
  const isAdmin = currentUserHasPermission('admin');
  const dropdown = (
    <DropdownMenu trigger="Créer">
      <DropdownItem onClick={() => setShowCreateGroupModal(true)}>
        Un groupe
      </DropdownItem>
      <DropdownItem onClick={() => setShowCreatePublisherModal(true)}>
        Un proclamateur
      </DropdownItem>
    </DropdownMenu>
  );

  return isAdmin ? dropdown : undefined;
};

export default App;
