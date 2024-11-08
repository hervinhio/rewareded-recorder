import './stats.scss';
import Page, { Grid, GridColumn } from '@atlaskit/page';
import { Fragment, useState } from 'react';
import { Publisher, Report } from '../types';
import { GlobalState, Reports, Users } from '../data';
import { ReportsStats, StatsType } from './reports-stats';
import { ConfirmationDialog, PublishersListDialog } from '../comps/modals';
import { LoadingButton } from '@atlaskit/button';
import { shallowEqual, useSelector } from 'react-redux';
import { PublishersCharts } from './publishers-chart';
import { SubmissionEntry } from './submission-entry';
import { token } from '@atlaskit/tokens';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Button,
  makeStyles,
  MessageBar,
  MessageBarActions,
  MessageBarBody,
  MessageBarTitle,
} from '@fluentui/react-components';
import { List } from '@fluentui/react-list-preview';

export function Stats() {
  const [isLoading, setIsLoading] = useState(false);
  const [counter, setCounter] = useState<number>(0);
  const [shouldShowReportsModal, setShouldShowSubmitReportsModal] =
    useState(false);
  const { reports, publishers, submissions } = useSelector(
    (state: GlobalState) => {
      return {
        reports: state.reports.unsubmitted,
        publishers: state.publishers.publishers,
        submissions: state.submissions.submissions,
      };
    },
    shallowEqual,
  );

  return (
    <Page>
      <LatePublishersMessageSection />
      <Grid layout="fluid" spacing="compact">
        <GridColumn medium={5}>
          <PublishersCharts />
        </GridColumn>
        <GridColumn medium={7}>
          <Accordion defaultValue="0">
            <AccordionItem value="0">
              <AccordionHeader>Totaux</AccordionHeader>
              <AccordionPanel>
                <ReportsStats
                  type={StatsType.All}
                  reports={reports}
                  publishers={publishers}
                  filterOutSubOne={false}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="1">
              <AccordionHeader>Proclamateurs</AccordionHeader>
              <AccordionPanel>
                <ReportsStats
                  type={StatsType.Publishers}
                  reports={reports}
                  publishers={publishers}
                  filterOutSubOne={true}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionHeader>Pionniers auxiliaires</AccordionHeader>
              <AccordionPanel>
                <ReportsStats
                  type={StatsType.AuxilaryPionneer}
                  reports={reports}
                  publishers={publishers}
                  filterOutSubOne={true}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="3">
              <AccordionHeader>Pioniers permanents</AccordionHeader>
              <AccordionPanel>
                <ReportsStats
                  type={StatsType.RegularPionneer}
                  reports={reports}
                  publishers={publishers}
                  filterOutSubOne={true}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <LoadingButton
            isDisabled={!Users.getCurrent().admin || !reports.length}
            appearance="danger"
            isLoading={isLoading}
            style={{ marginTop: 32 }}
            onClick={() => setShouldShowSubmitReportsModal(true)}>
            Soumettre
          </LoadingButton>
        </GridColumn>

        <GridColumn>
          <h4>Historique des soumissions</h4>
          <List className="list-group list-group-flush">
            {submissions.map((s) => (
              <SubmissionEntry submission={s} />
            ))}
          </List>
        </GridColumn>

        {shouldShowReportsModal && (
          <ConfirmationDialog
            title="Soumettre tous les rapports"
            risky={true}
            show={shouldShowReportsModal}
            onClose={(success: boolean) => {
              setShouldShowSubmitReportsModal(false);

              if (success) {
                setIsLoading(true);
                Reports.submitAll().finally(() => {
                  setIsLoading(false);
                  setCounter(counter + 1);
                });
              }
            }}>
            Voulez-vous vraiment soumettre tous les rapports ? Cette opération
            ne peut être annullée.
          </ConfirmationDialog>
        )}
      </Grid>
    </Page>
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
