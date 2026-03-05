import './report-accordion.scss';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Body1,
  Button,
  Caption1,
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
  Spinner,
} from '@fluentui/react-components';
import { ReportsStats, StatsType } from './reports-stats';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, Publishers, Users } from '../data';
import { Fragment, useState } from 'react';
import { ConfirmationDialog } from '../comps';
import { Flags } from '../data/flags';
import { Role } from '../types';

export function ReportAccordion() {
  const { reports, publishers } = useSelector((state: GlobalState) => {
    return {
      reports: Publishers.getAllUnsubmittedReports(),
      publishers: state.publishers.publishers,
      submissions: state.submissions.submissions,
    };
  }, shallowEqual);
  const [isLoading, setIsLoading] = useState(false);
  const [counter, setCounter] = useState<number>(0);
  const [shouldShowReportsModal, setShouldShowSubmitReportsModal] =
    useState(false);

  return (
    <Fragment>
      <Card className="s1-card">
        <CardHeader
          header={<Body1>Rapport S-1</Body1>}
          description={<Caption1>A soumettre en début de mois</Caption1>}
        />
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
        <CardFooter
          action={
            <Button
              disabled={
                isLoading || ![Role.ROOT, Role.ADMIN].includes(Users.getCurrent()!.role || Role.BASIC) || !reports.length
              }
              icon={isLoading ? <Spinner size="tiny" /> : undefined}
              onClick={() => setShouldShowSubmitReportsModal(true)}>
              Soumettre
            </Button>
          }
        />
      </Card>
      {shouldShowReportsModal && (
        <ConfirmationDialog
          title="Soumettre tous les rapports"
          risky={true}
          show={shouldShowReportsModal}
          onClose={(success: boolean) => {
            setShouldShowSubmitReportsModal(false);

            if (success) {
              setIsLoading(true);
              const loadingId = 'submit-reports';
              Flags.raiseLoading({ title: 'Soumission des rapports en cours…', id: loadingId });
              Publishers.submitAllReports().finally(() => {
                Flags.dismissLoading(loadingId);
                setIsLoading(false);
                setCounter(counter + 1);
              });
            }
          }}>
          <Body1>
            Voulez-vous vraiment soumettre tous les rapports ? Cette opération
            ne peut être annullée.
          </Body1>
        </ConfirmationDialog>
      )}
    </Fragment>
  );
}
