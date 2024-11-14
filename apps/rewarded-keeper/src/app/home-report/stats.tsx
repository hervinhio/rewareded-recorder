import './stats.scss';
import { Fragment } from 'react';
import { Publisher, Report } from '../types';
import { GlobalState } from '../data';
import { PublishersListDialog } from '../comps/modals';
import { shallowEqual, useSelector } from 'react-redux';
import { PublishersCharts } from './publishers-chart';
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

export function Stats() {
  const { submissions } = useSelector((state: GlobalState) => {
    return {
      reports: state.reports.unsubmitted,
      publishers: state.publishers.publishers,
      submissions: state.submissions.submissions,
    };
  }, shallowEqual);

  return (
    <div role="page">
      <LatePublishersMessageSection />
      <div role="grid">
        <div role="gridcell">
          <div className="dashboard">
            <PublishersCharts />
            <ReportAccordion />
          </div>
        </div>

        <div>
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
    marginBottom: '32px',
  },
});

function LatePublishersMessageSection() {
  const latePublishers = useSelector((state: GlobalState) => {
    return state.publishers.publishers.filter(
      (publisher: Publisher) =>
        !state.reports.current.some(
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
