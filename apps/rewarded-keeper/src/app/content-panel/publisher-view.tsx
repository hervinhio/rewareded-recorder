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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Publishers, Users } from '../data';
import { ConfirmationModal, RepportModal } from '../comps/modals';
import { Events, Publisher } from '../types';
import { PublisherModificationView } from './publisher-modification-view';
import { RepportsView } from './repports-view';
import { getPublisherName } from './util';

fontawesome.library.add(faPenSquare, faTrash, faPlusCircle);

interface Props {
  publisher: Publisher;
  onHide: () => void;
}

interface State {
  showRepportModal: boolean;
  showModificationView: boolean;
  publisherIdToDelete: string | undefined;
  setShowRepportModal: (show: boolean) => void;
  setShowModificationView: (show: boolean) => void;
  onHide: () => void;
  setPublisherIdToDelete: (publisherId: string | undefined) => void;
}

export const PublisherView = (props: Props) => {
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
  };

  return showModificationView
    ? renderModificationView(state, props)
    : renderThisView(state, props);
};

const renderModificationView = (state: State, props: Props) => {
  return (
    <PublisherModificationView
      publisher={props.publisher}
      onHide={() => state.setShowModificationView(false)}
    />
  );
};

const renderThisView = (state: State, props: Props) => {
  return (
    <Page>
      <PageHeader
        actions={makeActionsContent(
          props.publisher.id,
          state.setShowRepportModal,
          state.setShowModificationView,
          state.setPublisherIdToDelete
        )}
        bottomBar={makeBottomBar(props.publisher)}
      >
        {getPublisherName(props.publisher)}
      </PageHeader>
      <RepportsView publisher={props.publisher} />
      {renderConfirmationModal(state)}
      {state.showRepportModal && (
        <RepportModal
          publisherId={props.publisher.id}
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
        isDisabled={!isAdmin}
      >
        <FontAwesomeIcon icon="pen-square" />
      </Button>
      <Button
        style={{ borderRadius: 26 }}
        appearance="primary"
        onClick={() => setShowRepportModal(true)}
      >
        <FontAwesomeIcon icon="plus-circle" />
      </Button>
      <Button
        appearance="danger"
        style={{ borderRadius: 26 }}
        onClick={() => setPublisherIdToDelete(publisherId)}
        isDisabled={!isAdmin}
      >
        <FontAwesomeIcon icon="trash" />
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
