import Page from '@atlaskit/page';
import {
  borderRadius as getBorderRadius,
  gridSize as getGridSize,
} from '@atlaskit/theme/constants';
import { token } from '@atlaskit/tokens';
import { useState } from 'react';
import { Events, Publisher, Repport } from '../types';
import { Repports, Users } from '../data';
import { RepportsStats, StatsType } from './repports-stats';
import { ConfirmationModal, PublishersListDialog } from '../comps/modals';
import Button, { LoadingButton } from '@atlaskit/button';
import SectionMessage, { SectionMessageAction } from '@atlaskit/section-message';
import { Accordion } from 'react-bootstrap';
import { getLastSixMonths } from '../utils';

const borderRadius = getBorderRadius();
const gridSize = getGridSize();
const style = {
  display: 'flex',
  marginTop: `${gridSize * 2}px`,
  marginBottom: `${gridSize}px`,
  padding: `${gridSize * 4}px`,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  flexGrow: 1,
  backgroundColor: token('color.background.neutral', '#3949ab'),
  borderRadius: `${borderRadius}px`,
  color: token('color.text.subtlest', '#fff'),
};

interface Props {
  repports: Repport[];
  publishers: Publisher[];
}

export const Stats = (props: Props) => {
  const lastestMonth = getLastSixMonths()[0];
  const [isLoading, setIsLoading] = useState(false);
  const [counter, setCounter] = useState<number>(0);
  const [shouldShowRepportsModal, setShouldShowSubmitRepportsModal] =
    useState(false);
  const [isPublishersListDialogOpen, setIsPublishersListDialogOpen] =
    useState(false);
  const latePublishers = props.publishers.filter(
    (publisher) =>
      !props.repports.some(
        (repport) =>
          repport.publisherId === publisher.id &&
          repport.monthId === lastestMonth.getKey()
      )
  );

  return (
    <Page>
      {latePublishers.length > 0 && (
        <SectionMessage
          title={`Certains rapports manquent (${latePublishers.length})`}
          appearance="warning"
          actions={(
            <SectionMessageAction
              onClick={() => setIsPublishersListDialogOpen(true)}>
                Voir
            </SectionMessageAction>
          )}
        >
          <p>
            Veuillez contacter individuellement ceux de votre groupe qui n'ont
            pas encore remis leur rapports.
          </p>
          {isPublishersListDialogOpen && (
            <PublishersListDialog
              publishers={latePublishers}
              onHide={() => setIsPublishersListDialogOpen(false)}
            />)
        }
        </SectionMessage>
      )}
      {latePublishers.length > 0 && <div style={{ marginBottom: 32 }} />}

      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Totaux</Accordion.Header>
          <Accordion.Body>
            <RepportsStats
              type={StatsType.All}
              repports={props.repports}
              publishers={props.publishers}
              filterOutSubOne={false}
            />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Proclamateurs</Accordion.Header>
          <Accordion.Body>
            <RepportsStats
              type={StatsType.Publishers}
              repports={props.repports}
              publishers={props.publishers}
              filterOutSubOne={true}
            />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>Pionniers auxiliaires</Accordion.Header>
          <Accordion.Body>
            <RepportsStats
              type={StatsType.AuxilaryPionneer}
              repports={props.repports}
              publishers={props.publishers}
              filterOutSubOne={true}
            />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>Pioniers permanents</Accordion.Header>
          <Accordion.Body>
            <RepportsStats
              type={StatsType.RegularPionneer}
              repports={props.repports}
              publishers={props.publishers}
              filterOutSubOne={true}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {shouldShowRepportsModal && (
        <ConfirmationModal
          title="Soumttre tous les rapports"
          risky={true}
          onClose={(success: boolean) => {
            setShouldShowSubmitRepportsModal(false);

            if (success) {
              setIsLoading(true);
              Repports.submitAll()
                .then(() => {
                  Events.emit('reports_submitted');
                })
                .catch((error: any) => {
                  Events.emit('reports_submission_failed', error);
                })
                .finally(() => {
                  setIsLoading(false);
                  setCounter(counter + 1);
                });
            }
          }}
        >
          Voulez-vous vraiment soumettre tous les rapports ? Cette opération ne
          peut être annullée.
        </ConfirmationModal>
      )}
      <LoadingButton
        isDisabled={!Users.getCurrent().admin}
        appearance="danger"
        isLoading={isLoading}
        style={{ marginTop: 32 }}
        onClick={() => setShouldShowSubmitRepportsModal(true)}
      >
        Soumettre
      </LoadingButton>
    </Page>
  );
};
