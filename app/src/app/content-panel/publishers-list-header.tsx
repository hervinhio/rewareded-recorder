import SectionMessage, {
  SectionMessageAction,
} from '@atlaskit/section-message';
import { PublishersListDialog } from '../comps';
import { GlobalState } from '../data';
import { shallowEqual, useSelector } from 'react-redux';
import { Publisher } from '../types';
import { useState } from 'react';
import { makePublishersSelectionActions } from './publishers-selection-actions';
import { filterNonInactiveAndNonPioneersOut } from '../utils';

interface Props {
  selectedPublishersIds: string[];
  groupId: string;
  onBulkEditPublishers: () => void;
  onBulkDeletePublishers: () => void;
}

interface SelectionSectionMessageProps {
  selectedPublishersIds: string[];
  onBulkEditPublishers: () => void;
  onBulkDeletePublishers: () => void;
}

interface MissingReportsSectionMessageProps {
  selectedPublishersIds: string[];
  publishers: Publisher[];
  someReportsAreMissing: boolean;
}

interface AllReportsSubmitedSectionMessageProps {
  selectedPublishersIds: string[];
  someReportsAreMissing: boolean;
}

export function PublishersListHeader(props: Props) {
  const { publishers, someReportsAreMissing } = useSelector(
    (state: GlobalState) => {
      const pubs = state.publishers.byGroup[props.groupId] || [];
      const publishers = pubs.filter((publisher: Publisher) => {
        if (filterNonInactiveAndNonPioneersOut(publisher, props.groupId)) {
          if (props.groupId === 'inactives') {
            return true;
          }

          return !state.reports.current.some(
            (report) => report.publisherId === publisher.id
          );
        }

        return false;
      });

      return {
        publishers,
        someReportsAreMissing: publishers.length > 0,
      };
    },
    shallowEqual
  );

  return (
    <>
      <SelectionSectionMessage
        onBulkDeletePublishers={props.onBulkDeletePublishers}
        onBulkEditPublishers={props.onBulkEditPublishers}
        selectedPublishersIds={props.selectedPublishersIds}
      />
      <MissingReportsSectionMessage
        publishers={publishers}
        selectedPublishersIds={props.selectedPublishersIds}
        someReportsAreMissing={someReportsAreMissing}
      />
      <AllReportsSubmitedSectionMessage
        selectedPublishersIds={props.selectedPublishersIds}
        someReportsAreMissing={someReportsAreMissing}
      />
    </>
  );
}

function SelectionSectionMessage(props: SelectionSectionMessageProps) {
  if (props.selectedPublishersIds.length === 0) {
    return null;
  }

  return (
    <SectionMessage
      title={`Selection en cours (${props.selectedPublishersIds.length})`}
      appearance="information"
      actions={makePublishersSelectionActions({
        onBulkEditPublishers: () => props.onBulkEditPublishers(),
        onBulkDeletePublishers: () => props.onBulkDeletePublishers(),
      })}
    >
      <p>{props.selectedPublishersIds.length} proclamateurs sélectionnés</p>
    </SectionMessage>
  );
}

function MissingReportsSectionMessage(
  props: MissingReportsSectionMessageProps
) {
  const [isPublishersListDialogOpen, setIsPublishersListDialogOpen] =
    useState(false);

  if (!(!props.selectedPublishersIds.length && props.someReportsAreMissing)) {
    return null;
  }

  return (
    <SectionMessage
      title={`Certains rapports manquent (${props.publishers.length})`}
      appearance="warning"
      actions={
        <SectionMessageAction
          onClick={() => setIsPublishersListDialogOpen(true)}
        >
          Voir
        </SectionMessageAction>
      }
    >
      <p>
        Veuillez contacter individuellement ceux de votre groupe qui n'ont pas
        encore remis leur rapports.
      </p>
      {isPublishersListDialogOpen && (
        <PublishersListDialog
          mode="missing"
          publishers={props.publishers}
          onHide={() => setIsPublishersListDialogOpen(false)}
        />
      )}
    </SectionMessage>
  );
}

function AllReportsSubmitedSectionMessage(
  props: AllReportsSubmitedSectionMessageProps
) {
  if (!(!props.selectedPublishersIds.length && !props.someReportsAreMissing)) {
    return null;
  }

  return (
    <SectionMessage
      title="Tous les rapports ont été remis"
      appearance="success"
    >
      <p>
        Tous les rapports ont été remis et serons bientôt envoyés au béthel.
      </p>
    </SectionMessage>
  );
}
