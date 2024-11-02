import { PublishersListDialog } from '../comps';
import { GlobalState, Users } from '../data';
import { shallowEqual, useSelector } from 'react-redux';
import { Publisher } from '../types';
import { useState } from 'react';
import { filterNonInactiveAndNonPioneersOut } from '../utils';
import {
  Button,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
} from '@fluentui/react-components';

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
            (report) => report.publisherId === publisher.id,
          );
        }

        return false;
      });

      return {
        publishers,
        someReportsAreMissing: publishers.length > 0,
      };
    },
    shallowEqual,
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

  const user = Users.getCurrent();

  return (
    <MessageBar intent="info">
      <MessageBarBody>
        <MessageBarTitle>{`Selection en cours (${props.selectedPublishersIds.length})`}</MessageBarTitle>
        {props.selectedPublishersIds.length} proclamateurs sélectionnés
      </MessageBarBody>
      <MessageBarActions>
        <Button
          disabled={!user.admin}
          onClick={() => props.onBulkEditPublishers()}>
          Modifier
        </Button>
        <Button
          disabled={!user.admin}
          onClick={() => props.onBulkDeletePublishers()}>
          Supprimer
        </Button>
      </MessageBarActions>
    </MessageBar>
  );
}

function MissingReportsSectionMessage(
  props: MissingReportsSectionMessageProps,
) {
  if (!(!props.selectedPublishersIds.length && props.someReportsAreMissing)) {
    return null;
  }

  return (
    <MessageBar intent="warning">
      <MessageBarBody>
        <MessageBarTitle>{`Certains rapports manquent (${props.publishers.length})`}</MessageBarTitle>
        Veuillez contacter individuellement ceux de votre groupe qui n'ont pas
        encore remis leur rapports.
      </MessageBarBody>
      <MessageBarActions
        containerAction={
          <PublishersListDialog mode="missing" publishers={props.publishers}>
            <Button>Voir</Button>
          </PublishersListDialog>
        }
      />
    </MessageBar>
  );
}

function AllReportsSubmitedSectionMessage(
  props: AllReportsSubmitedSectionMessageProps,
) {
  if (!(!props.selectedPublishersIds.length && !props.someReportsAreMissing)) {
    return null;
  }

  return (
    <MessageBar intent="success">
      <MessageBarBody>
        <MessageBarTitle>Tous les rapports ont été remis</MessageBarTitle>
        Tous les rapports ont été remis et serons bientôt envoyés au béthel.
      </MessageBarBody>
    </MessageBar>
  );
}
