import './stats.scss';
import Page, { Grid, GridColumn } from '@atlaskit/page';
import { Fragment, useState } from 'react';
import { Publisher, Report } from '../types';
import { GlobalState, Reports, Users } from '../data';
import { ReportsStats, StatsType } from './reports-stats';
import { ConfirmationModal, PublishersListDialog } from '../comps/modals';
import { LoadingButton } from '@atlaskit/button';
import SectionMessage, {
  SectionMessageAction,
} from '@atlaskit/section-message';
import { Accordion } from 'react-bootstrap';
import { shallowEqual, useSelector } from 'react-redux';
import { PublishersCharts } from './publishers-chart';
import { SubmissionEntry } from './submission-entry';
import { token } from '@atlaskit/tokens';

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
  const accordionItemStyle = {
    backgroundColor: token('color.background.neutral'),
    color: token('color.text'),
    borderColor: token('color.text'),
  };
  const accordinHeaderStyle = {
    backgroundColor: token('color.background.neutral'),
    color: token('color.text'),
  };

  return (
    <Page>
      <LatePublishersMessageSection />
      <Grid layout="fluid" spacing="compact">
        <GridColumn medium={5}>
          <PublishersCharts />
        </GridColumn>
        <GridColumn medium={7}>
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0" style={accordionItemStyle}>
              <Accordion.Header style={accordinHeaderStyle}>
                Totaux
              </Accordion.Header>
              <Accordion.Body>
                <ReportsStats
                  type={StatsType.All}
                  reports={reports}
                  publishers={publishers}
                  filterOutSubOne={false}
                />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1" style={accordionItemStyle}>
              <Accordion.Header>Proclamateurs</Accordion.Header>
              <Accordion.Body>
                <ReportsStats
                  type={StatsType.Publishers}
                  reports={reports}
                  publishers={publishers}
                  filterOutSubOne={true}
                />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2" style={accordionItemStyle}>
              <Accordion.Header>Pionniers auxiliaires</Accordion.Header>
              <Accordion.Body>
                <ReportsStats
                  type={StatsType.AuxilaryPionneer}
                  reports={reports}
                  publishers={publishers}
                  filterOutSubOne={true}
                />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3" style={accordionItemStyle}>
              <Accordion.Header>Pioniers permanents</Accordion.Header>
              <Accordion.Body>
                <ReportsStats
                  type={StatsType.RegularPionneer}
                  reports={reports}
                  publishers={publishers}
                  filterOutSubOne={true}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <LoadingButton
            isDisabled={!Users.getCurrent().admin || !reports.length}
            appearance="danger"
            isLoading={isLoading}
            style={{ marginTop: 32 }}
            onClick={() => setShouldShowSubmitReportsModal(true)}
          >
            Soumettre
          </LoadingButton>
        </GridColumn>

        <GridColumn>
          <h4>Historique des soumissions</h4>
          <ul
            className="list-group list-group-flush"
            style={{ backgroundColor: token('color.background.neutral') }}
          >
            {submissions.map((s) => (
              <SubmissionEntry submission={s} />
            ))}
          </ul>
        </GridColumn>

        {shouldShowReportsModal && (
          <ConfirmationModal
            title="Soumttre tous les rapports"
            risky={true}
            onClose={(success: boolean) => {
              setShouldShowSubmitReportsModal(false);

              if (success) {
                setIsLoading(true);
                Reports.submitAll().finally(() => {
                  setIsLoading(false);
                  setCounter(counter + 1);
                });
              }
            }}
          >
            Voulez-vous vraiment soumettre tous les rapports ? Cette opération
            ne peut être annullée.
          </ConfirmationModal>
        )}
      </Grid>
    </Page>
  );
}

function LatePublishersMessageSection() {
  const [isPublishersListDialogOpen, setIsPublishersListDialogOpen] =
    useState(false);
  const latePublishers = useSelector((state: GlobalState) => {
    return state.publishers.publishers.filter(
      (publisher: Publisher) =>
        !state.reports.current.some(
          (report: Report) => report.publisherId === publisher.id,
        ),
    );
  }, shallowEqual);

  if (latePublishers.length === 0) {
    return null;
  }

  return (
    <Fragment>
      <SectionMessage
        title={`Certains rapports manquent (${latePublishers.length})`}
        appearance="warning"
        actions={
          <SectionMessageAction
            onClick={() => setIsPublishersListDialogOpen(true)}
          >
            Voir
          </SectionMessageAction>
        }
      >
        <p style={{ color: token('color.text') }}>
          Veuillez contacter individuellement ceux de votre groupe qui n'ont pas
          encore remis leur rapports.
        </p>
        {isPublishersListDialogOpen && (
          <PublishersListDialog
            publishers={latePublishers}
            mode={'missing'}
            onHide={() => setIsPublishersListDialogOpen(false)}
          />
        )}
      </SectionMessage>
      <div style={{ marginBottom: 32 }} />
    </Fragment>
  );
}
