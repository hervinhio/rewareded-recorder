import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Button, { ButtonGroup } from '@atlaskit/button';
import Lozenge from '@atlaskit/lozenge';
import Page from '@atlaskit/page';
import PageHeader from '@atlaskit/page-header';
import { useState } from 'react';
import { Publishers } from '../data';
import { RepportModal } from '../modals';
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
  setShowRepportModal: (show: boolean) => void;
  setShowModificationView: (show: boolean) => void;
  onHide: () => void;
}

export const PublisherView = (props: Props) => {
  const [showRepportModal, setShowRepportModal] = useState(false);
  const [showModificationView, setShowModificationView] = useState(false);
  const state: State = {
    showRepportModal,
    showModificationView,
    setShowRepportModal,
    setShowModificationView,
    onHide: props.onHide,
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
          state.onHide
        )}
        bottomBar={makeBottomBar(props.publisher)}
      >
        {getPublisherName(props.publisher)}
      </PageHeader>
      <RepportsView publisher={props.publisher} />
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
  onHide: () => void
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
        onClick={() => Publishers.delete(publisherId).then(onHide)}
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
