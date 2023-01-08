import Button, { ButtonGroup } from '@atlaskit/button';
import Lozenge from '@atlaskit/lozenge';
import Page from '@atlaskit/page';
import PageHeader from '@atlaskit/page-header';
import fontawesome from '@fortawesome/fontawesome';
import {
  faPenSquare,
  faPlusCircle,
  faTrash,
} from '@fortawesome/fontawesome-free-solid';
import { useEffect, useState } from 'react';
import { Groups, Publishers, Users } from '../data';
import { ConfirmationModal, RepportModal } from '../comps/modals';
import { Events, Group, Publisher } from '../types';
import { PublisherModificationView } from './publisher-modification-view';
import { RepportsView } from './repports-view';
import { getPublisherName } from './util';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import AddCircleIcon from '@atlaskit/icon/glyph/add-circle';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import { Link, useLocation, useParams } from 'react-router-dom';
import EmptyState from '@atlaskit/empty-state';
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import __noop from '@atlaskit/ds-lib/noop';
import { token } from '@atlaskit/tokens';
import {
  borderRadius as getBorderRadius,
  gridSize as getGridSize,
} from '@atlaskit/theme/constants';
import { N20, N200 } from '@atlaskit/theme/colors';

fontawesome.library.add(faPenSquare, faTrash, faPlusCircle);

const borderRadius = getBorderRadius();
const gridSize = getGridSize();
const style = {
  display: 'flex',
  marginTop: `${gridSize * 2}px`,
  marginBottom: `${gridSize}px`,
  padding: `${gridSize * 4}px`,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  flexGrow: 1,
  backgroundColor: token('color.background.neutral', N20),
  borderRadius: `${borderRadius}px`,
  color: token('color.text.subtlest', N200),
};

interface Props {
  publisher?: Publisher;
  onHide: () => void;
}

interface State {
  publisher?: Publisher;
  group?: Group;
  showRepportModal: boolean;
  showModificationView: boolean;
  publisherIdToDelete: string | undefined;
  setShowRepportModal: (show: boolean) => void;
  setShowModificationView: (show: boolean) => void;
  onHide: () => void;
  setPublisherIdToDelete: (publisherId: string | undefined) => void;
}

export const PublisherView = (props: Props) => {
  const [publisher, setPublisher] = useState<Publisher | undefined>(
    props.publisher
  );
  const [group, setGroup] = useState<Group | undefined>();
  const [showRepportModal, setShowRepportModal] = useState(false);
  const [showModificationView, setShowModificationView] = useState(false);
  const [publisherIdToDelete, setPublisherIdToDelete] = useState<
    string | undefined
  >();
  const state: State = {
    showRepportModal,
    showModificationView,
    publisherIdToDelete,
    setShowRepportModal,
    setShowModificationView,
    onHide: props.onHide,
    setPublisherIdToDelete,
    publisher: props.publisher,
  };
  const location = useLocation();
  const { publisherId, groupId } = useParams();

  useEffect(() => {
    if (!props.publisher && !!publisherId) {
      Publishers.getOne(publisherId).then(
        (pub) => setPublisher(pub),
        (err) => console.error(err)
      );
    }

    if (groupId || publisher?.groupId) {
      Groups.getOne(groupId || publisher?.groupId || '').then(
        (group) => setGroup(group),
        (err) => console.error(err)
      );
    }
  }, [location.hash]);

  return (
    <div style={style as React.CSSProperties}>
      {showModificationView && !!publisher
        ? renderModificationView({ ...state, publisher, group })
        : renderThisView({ ...state, publisher, group })}
    </div>
  );
};

const renderModificationView = (state: State) => {
  if (!state.publisher) {
    return <EmptyState header="Cet utilisateur semble ne pas exister pas" />;
  }
  return (
    <PublisherModificationView
      publisher={state.publisher}
      onHide={() => state.setShowModificationView(false)}
    />
  );
};

const renderThisView = (state: State) => {
  if (!state.publisher) {
    return (
      <EmptyState
        header="Chargement en cours"
        description="Veuillez patienter pendant que nous chargeons les données du proclamateur selectionné"
        isLoading={true}
      />
    );
  }

  const breadcrumbs = (
    <Breadcrumbs onExpand={__noop}>
      {!!state.group && <BreadcrumbsItem
        text={state.group?.name || 'Non affilié'}
        key="Group"
        component={() => (
          <Link
            to={`/groups/${state.group?.id || 'unafiliated'}`}
            replace={true}
          >
            {state.group?.name || 'Non affilié'}
          </Link>
        )}
      />}
      <BreadcrumbsItem
        text={getPublisherName(state.publisher)}
        key="Publisher"
        href="javascript:void(0)"
      />
    </Breadcrumbs>
  );

  return (
    <Page>
      <PageHeader
        breadcrumbs={breadcrumbs}
        actions={makeActionsContent(
          state.publisher.id,
          state.setShowRepportModal,
          state.setShowModificationView,
          state.setPublisherIdToDelete
        )}
        bottomBar={makeBottomBar(state.publisher)}
      >
        {getPublisherName(state.publisher)}
      </PageHeader>
      <RepportsView publisher={state.publisher} />
      {renderConfirmationModal(state)}
      {state.showRepportModal && (
        <RepportModal
          publisherId={state.publisher.id}
          show={state.showRepportModal}
          onHide={() => state.setShowRepportModal(false)}
        />
      )}
    </Page>
  );
};

const makeActionsContent = (
  publisherId: string | undefined,
  setShowRepportModal: (show: boolean) => void,
  setShowModificationView: (show: boolean) => void,
  setPublisherIdToDelete: (id: string | undefined) => void
) => {
  const isAdmin = Users.getCurrent().admin;
  return (
    <ButtonGroup>
      <Button
        style={{ borderRadius: 26 }}
        onClick={() => setShowModificationView(true)}
        appearance="subtle"
        isDisabled={!isAdmin}
      >
        <EditFilledIcon label="" size="small" />
      </Button>
      <Button
        style={{ borderRadius: 26 }}
        appearance="subtle"
        onClick={() => setShowRepportModal(true)}
      >
        <AddCircleIcon label="" size="small" />
      </Button>
      <Button
        appearance="danger"
        style={{ borderRadius: 26 }}
        onClick={() => setPublisherIdToDelete(publisherId)}
        isDisabled={!isAdmin}
      >
        <TrashIcon label="" size="small" />
      </Button>
    </ButtonGroup>
  );
};

const makeBottomBar = (publisher: Publisher) => {
  return (
    <>
      <div>{publisher.isElder && <Lozenge>Ancien</Lozenge>}</div>
      <div>
        {publisher.isRegularPioneer && <Lozenge isBold>Pionnier</Lozenge>}
      </div>
    </>
  );
};

const renderConfirmationModal = (params: State) => {
  return !params.publisherIdToDelete ? null : (
    <ConfirmationModal
      title={'Supprimer un proclamateur'}
      risky={true}
      onClose={(confirmed: boolean) => {
        if (confirmed) {
          Publishers.delete(params.publisherIdToDelete).then(() => {
            params.onHide();
            Events.emit('publisher_updated');
          });
        }

        params.setPublisherIdToDelete(undefined);
      }}
    >
      Voulez-vous vraiment supprimer ce proclamateur ? Vous ne pourrez plus le
      recouvrer.
    </ConfirmationModal>
  );
};
