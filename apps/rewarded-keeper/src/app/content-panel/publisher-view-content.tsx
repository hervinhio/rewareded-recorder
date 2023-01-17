import { Publishers } from '../data';
import { ConfirmationModal, RepportModal } from '../comps/modals';
import { Group, Publisher } from '../types';
import { RepportsView } from './repports-view';
import EmptyState from '@atlaskit/empty-state';

interface Props {
  publisher?: Publisher;
  group?: Group;
  showRepportModal: boolean;
  showModificationView: boolean;
  publisherIdToDelete: string | undefined;
  show: boolean;
  setShowRepportModal: (show: boolean) => void;
  setShowModificationView: (show: boolean) => void;
  onHide: () => void;
  setPublisherIdToDelete: (publisherId: string | undefined) => void;
}

export function PublisherViewContent(props: Props) {
  if (!props.show) return null;
  if (!props.publisher) {
    return (
      <EmptyState
        header="Chargement en cours"
        description="Veuillez patienter pendant que nous chargeons les données du proclamateur selectionné"
        isLoading={true}
      />
    );
  }

  return (
    <>
      <RepportsView publisher={props.publisher} />
      {renderConfirmationModal(props)}
      {props.showRepportModal && (
        <RepportModal
          publisherId={props.publisher.id}
          show={props.showRepportModal}
          onHide={() => props.setShowRepportModal(false)}
        />
      )}
    </>
  );
}

const renderConfirmationModal = (params: Props) => {
  return !params.publisherIdToDelete ? null : (
    <ConfirmationModal
      title={'Supprimer un proclamateur'}
      risky={true}
      onClose={(confirmed: boolean) => {
        if (confirmed) {
          Publishers.delete(params.publisherIdToDelete).then(() => {
            params.onHide();
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
