import Button, { ButtonGroup } from '@atlaskit/button';
import Lozenge from '@atlaskit/lozenge';
import Page from '@atlaskit/page';
import PageHeader from '@atlaskit/page-header';
import { useState } from 'react';
import { Publishers } from '../data';
import { ConfirmationModal, RepportModal } from '../modals';
import { currentUserHasPermission, Publisher } from '../types';
import { PublisherModificationView } from './publisher-modification-view';
import { RepportsView } from './repports-view';
import { getPublisherName } from './util';

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
  const [publisherIdToDelete, setPublisherIdToDelete] = useState<string | undefined>();
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
  const isAdmin = currentUserHasPermission('admin');
  return (
    <ButtonGroup>
      <Button
        onClick={() => setShowModificationView(true)}
        isDisabled={!isAdmin}
      >
        Modifier
      </Button>
      <Button appearance="primary" onClick={() => setShowRepportModal(true)}>
        Créer rapport
      </Button>
      <Button
        appearance="danger"
        onClick={() => setPublisherIdToDelete(publisherId)}
        isDisabled={!isAdmin}
      >
        Supprimer
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
      <div>
        {publisher.isAuxylaryPioneer && (
          <Lozenge isBold>Pionnier auxiliaire</Lozenge>
        )}
      </div>
    </>
  );
};

const renderConfirmationModal = (params: State) => {
  return !params.publisherIdToDelete
    ? null
    : (
      <ConfirmationModal
        title={'Supprimer un rapport de service'}
        risky={true}
        onClose={(confirmed: boolean) => {
          if (confirmed) {
            Publishers.delete(params.publisherIdToDelete).then(params.onHide);
          }

          params.setPublisherIdToDelete(undefined);
        }}
      >
        Voulez-vous vraiment supprimer ce proclamateur ? Vous ne pourrez plus le recouvrer.
    </ConfirmationModal>
  );
}
