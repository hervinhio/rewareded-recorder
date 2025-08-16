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
} from '@fluentui/react-components';
import { ReportsStats, StatsType } from './reports-stats';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, Reports, Users } from '../data';
import { Fragment, useState } from 'react';
import { ConfirmationDialog } from '../comps';

export function ReportAccordion() {
  const { publishers } = useSelector((state: GlobalState) => {
    return {
      publishers: state.publishers.publishers,
      submissions: state.submissions.submissions,
    };
  }, shallowEqual);
  
  // Get unsubmitted reports from users
  const reports = Users.getUnsubmittedReports();
  
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
                isLoading || !Users.getCurrent().admin || !reports.length
              }
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
              Reports.submitAll().finally(() => {
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
