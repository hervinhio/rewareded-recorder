import './stats.scss';
import { Fragment } from 'react';
import { Publisher, Report, Role } from '../types';
import { GlobalState, Users, Publishers } from '../data';
import { PublishersListDialog } from '../comps/modals';
import { shallowEqual, useSelector } from 'react-redux';
import { PublisherStatusCards } from './publisher-status-cards';
import { SubmissionEntry } from './submission-entry';
import {
  Button,
  makeStyles,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
  Subtitle1,
} from '@fluentui/react-components';
import { List } from '@fluentui/react-list-preview';
import { ReportAccordion } from './report-accordion';
import { Navigate } from 'react-router-dom';

export function Stats() {
  const classes = useClasses();
  const { submissions } = useSelector((state: GlobalState) => {
    return {
      submissions: state.submissions.submissions,
    };
  }, shallowEqual);

  if (Users.getCurrent().role === Role.BASIC) {
    return (
      <Navigate
        to={
          '/groups/' +
          Users.getCurrent().groupId +
          '/' +
          Users.getCurrent().publisherId
        }
        replace={true}
      />
    );
  }

  return (
    <div role="page">
      <MessageBar intent="info" style={{ marginBottom: 32 }}>
        <MessageBarBody>
          <MessageBarTitle>Rewarded Keeper évolue</MessageBarTitle>
          <p>
            Rewarded Keeper introduit une nouvelle façon de gérer les
            autorisations. Ces récents changements pourraient avoir affecté
            votre utilisation de l'application. Si vous rencontrez des
            problèmes, veuillez contacter <b>Hervé Mutombo</b>.
          </p>
        </MessageBarBody>
      </MessageBar>

      <LatePublishersMessageSection />

      <PublisherStatusCards />

      <div role="grid">
        <div role="gridcell">
          <div className="dashboard">
            <ReportAccordion />
          </div>
        </div>

        <div className={classes.submissionHistory}>
          <Subtitle1>Historique des soumissions</Subtitle1>
          <List className="list-group list-group-flush">
            {submissions.map((s) => (
              <SubmissionEntry submission={s} />
            ))}
          </List>
        </div>
      </div>
    </div>
  );
}

const useClasses = makeStyles({
  message: {
    marginTop: '32px', // TODO remove when the info on permissions is removed
    marginBottom: '32px',
  },
  submissionHistory: {
    maxWidth: '900px',
    margin: '0 auto',
  },
});

function LatePublishersMessageSection() {
  const latePublishers = useSelector((state: GlobalState) => {
    const currentReports = Publishers.getCurrentMonthReports();
    return state.publishers.publishers.filter(
      (publisher: Publisher) =>
        !currentReports.some(
          (report: Report) => report.publisherId === publisher.id,
        ),
    );
  }, shallowEqual);
  const styles = useClasses();

  if (latePublishers.length === 0) {
    return null;
  }

  return (
    <Fragment>
      <MessageBar intent="warning" className={styles.message}>
        <MessageBarBody>
          <MessageBarTitle>{`Certains rapports manquent (${latePublishers.length})`}</MessageBarTitle>
          Veuillez contacter individuellement ceux de votre groupe qui n'ont pas
          encore remis leur rapports.
        </MessageBarBody>
        <MessageBarActions>
          <PublishersListDialog publishers={latePublishers} mode={'missing'}>
            <Button>Voir</Button>
          </PublishersListDialog>
        </MessageBarActions>
      </MessageBar>
      <div style={{ marginBottom: 32 }} />
    </Fragment>
  );
}
