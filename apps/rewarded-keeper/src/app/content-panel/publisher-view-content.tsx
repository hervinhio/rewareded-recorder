import { PublisherDeletionReason, Publishers } from '../data';
import { ConfirmationModal, ReportModal } from '../comps/modals';
import { Group, Publisher } from '../types';
import { ReportsView } from './reports-view';
import EmptyState from '@atlaskit/empty-state';
import { Form } from 'react-bootstrap';
import { Fragment, useState } from 'react';
import DropdownMenu, { DropdownItem } from '@atlaskit/dropdown-menu';
import Button from '@atlaskit/button';
import { token } from '@atlaskit/tokens';
import { PionnierGoalProgress } from './pionnier-goal-progress';

interface Props {
  publisher?: Publisher;
  group?: Group;
  showReportModal: boolean;
  showModificationView: boolean;
  publisherIdToDelete: string | undefined;
  show: boolean;
  setShowReportModal: (show: boolean) => void;
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
    <Fragment>
      <PionnierGoalProgress publisher={props.publisher} />
      <ReportsView publisher={props.publisher} />
      <PublisherDeleteConfirmationModal {...props} />
      {props.showReportModal && (
        <ReportModal
          publisherId={props.publisher.id}
          show={props.showReportModal}
          onHide={() => props.setShowReportModal(false)}
        />
      )}
    </Fragment>
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
        if (confirmed && deletionReason === null) {
          return;
        }

        if (confirmed) {
          Publishers.delete(
            params.publisherIdToDelete,
            deletionReason as PublisherDeletionReason,
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
        <br />
        <DropdownMenu
          trigger={({ triggerRef, ...props }) => (
            <Button ref={triggerRef} {...props}>
              {deletionReason === null
                ? 'Raison'
                : getDeletionReasonText(deletionReason)}
            </Button>
          )}
        >
          <DropdownItem
            onClick={() => setDeletionReason(PublisherDeletionReason.Gone)}
          >
            <span style={{ color: token('color.text') }}>Parti(e)</span>
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              setDeletionReason(PublisherDeletionReason.Disfellowshiped)
            }
          >
            <span style={{ color: token('color.text') }}>Excommunié(e)</span>
          </DropdownItem>
        </DropdownMenu>
      </Form.Group>
    </ConfirmationModal>
  );
};

function getDeletionReasonText(reason: PublisherDeletionReason): string {
  if (reason === null) return 'Raison';

  return reason === PublisherDeletionReason.Disfellowshiped
    ? 'Excommunié(e)'
    : 'Parti(e)';
}
