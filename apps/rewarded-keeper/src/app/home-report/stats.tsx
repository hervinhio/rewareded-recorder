import Page, { Grid, GridColumn } from '@atlaskit/page';
import { useState } from 'react';
import { Publisher, Repport } from '../types';
import { GlobalState, Repports, Users } from '../data';
import { RepportsStats, StatsType } from './repports-stats';
import { ConfirmationModal, PublishersListDialog } from '../comps/modals';
import { LoadingButton } from '@atlaskit/button';
import SectionMessage, {
  SectionMessageAction,
} from '@atlaskit/section-message';
import { Accordion } from 'react-bootstrap';
import { shallowEqual, useSelector } from 'react-redux';
import { PublishersCharts } from './publishers-chart';

export function Stats() {
  const [isLoading, setIsLoading] = useState(false);
  const [counter, setCounter] = useState<number>(0);
  const [shouldShowRepportsModal, setShouldShowSubmitRepportsModal] =
    useState(false);
  const { reports, publishers } = useSelector(
    (state: GlobalState) => {
      return {
        reports: state.reports.unsubmitted,
        publishers: state.publishers.publishers,
      };
    },
    shallowEqual
  );

  return (
    <Page
    >
      <LatePublishersMessageSection />
      <Grid layout="fluid" spacing="compact">
        <GridColumn medium={5}>
          <PublishersCharts />
        </GridColumn>
        <GridColumn medium={7}>
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Totaux</Accordion.Header>
              <Accordion.Body>
                <RepportsStats
                  type={StatsType.All}
                  repports={reports}
                  publishers={publishers}
                  filterOutSubOne={false}
                />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Proclamateurs</Accordion.Header>
              <Accordion.Body>
                <RepportsStats
                  type={StatsType.Publishers}
                  repports={reports}
                  publishers={publishers}
                  filterOutSubOne={true}
                />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Pionniers auxiliaires</Accordion.Header>
              <Accordion.Body>
                <RepportsStats
                  type={StatsType.AuxilaryPionneer}
                  repports={reports}
                  publishers={publishers}
                  filterOutSubOne={true}
                />
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
              <Accordion.Header>Pioniers permanents</Accordion.Header>
              <Accordion.Body>
                <RepportsStats
                  type={StatsType.RegularPionneer}
                  repports={reports}
                  publishers={publishers}
                  filterOutSubOne={true}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <LoadingButton
            isDisabled={!Users.getCurrent().admin}
            appearance="danger"
            isLoading={isLoading}
            style={{ marginTop: 32 }}
            onClick={() => setShouldShowSubmitRepportsModal(true)}
          >
            Soumettre
          </LoadingButton>
        </GridColumn>

        {shouldShowRepportsModal && (
          <ConfirmationModal
            title="Soumttre tous les rapports"
            risky={true}
            onClose={(success: boolean) => {
              setShouldShowSubmitRepportsModal(false);

              if (success) {
                setIsLoading(true);
                Repports.submitAll().finally(() => {
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
          (report: Repport) => report.publisherId === publisher.id
        )
    );
  }, shallowEqual);

  if (latePublishers.length === 0) {
    return null;
  }

  return (
    <>
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
        <p>
          Veuillez contacter individuellement ceux de votre groupe qui n'ont pas
          encore remis leur rapports.
        </p>
        {isPublishersListDialogOpen && (
          <PublishersListDialog
            publishers={latePublishers}
            onHide={() => setIsPublishersListDialogOpen(false)}
          />
        )}
      </SectionMessage>
      <div style={{ marginBottom: 32 }} />
    </>
  );
}
