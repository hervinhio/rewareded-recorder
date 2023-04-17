import { PublisherDeletionReason, Publishers } from '../data';
import { ConfirmationModal, RepportModal } from '../comps/modals';
import { Group, Publisher } from '../types';
import { RepportsView } from './repports-view';
import EmptyState from '@atlaskit/empty-state';
import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { useState } from 'react';

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
      <PublisherDeleteConfirmationModal {...props} />
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

const PublisherDeleteConfirmationModal = (params: Props) => {
  const [deletionReason, setDeletionReason] =
    useState<PublisherDeletionReason | null>(null);

  return !params.publisherIdToDelete ? null : (
    <ConfirmationModal
      title={'Supprimer un proclamateur'}
      risky={true}
      onClose={(confirmed: boolean) => {
        if (confirmed && !deletionReason) {
          return;
        }

        if (confirmed) {
          Publishers.delete(
            params.publisherIdToDelete,
            deletionReason as PublisherDeletionReason
          ).then(() => {
            params.onHide();
          });
        }

        params.setPublisherIdToDelete(undefined);
      }}
    >
      <p>
        Voulez-vous vraiment supprimer ce proclamateur ? Vous ne pourrez plus le
        recouvrer.
      </p>
      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Raison</Form.Label>
        <DropdownButton
          title="Raison"
          onSelect={(r) =>
            setDeletionReason(r as PublisherDeletionReason | null)
          }
        >
          <Dropdown.Item eventKey={PublisherDeletionReason.Gone}>
            Parti(e)
          </Dropdown.Item>
          <Dropdown.Item eventKey={PublisherDeletionReason.Disfellowshiped}>
            Excommunié(e)
          </Dropdown.Item>
        </DropdownButton>
      </Form.Group>
    </ConfirmationModal>
  );
};
