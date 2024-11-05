import { PublisherDeletionReason, Publishers } from '../data';
import { ConfirmationDialog } from '../comps/modals';
import { Group, Publisher } from '../types';
import { ReportsView } from './reports-view';
import EmptyState from '@atlaskit/empty-state';
import { Fragment, useState } from 'react';
import { PionnierGoalProgress } from './pionnier-goal-progress';
import { Dropdown, Field, Option } from '@fluentui/react-components';

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
    </Fragment>
  );
}

const PublisherDeleteConfirmationModal = (params: Props) => {
  const [deletionReason, setDeletionReason] =
    useState<PublisherDeletionReason | null>(null);

  return !params.publisherIdToDelete ? null : (
    <ConfirmationDialog
      title={'Supprimer un proclamateur'}
      risky={true}
      show={true}
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
      }}>
      <p>
        Voulez-vous vraiment supprimer ce proclamateur ? Vous ne pourrez plus le
        recouvrer.
      </p>
      <form onSubmit={(e) => e.preventDefault()}>
        <Field label={'Raison'} required>
          <Dropdown>
            <Option
              onClick={() => setDeletionReason(PublisherDeletionReason.Gone)}>
              Parti(e)
            </Option>
            <Option
              onClick={() =>
                setDeletionReason(PublisherDeletionReason.Disfellowshiped)
              }>
              Renvoyé(e)
            </Option>
          </Dropdown>
        </Field>
      </form>
    </ConfirmationDialog>
  );
};
