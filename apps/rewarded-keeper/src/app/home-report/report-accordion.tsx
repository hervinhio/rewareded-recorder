import './report-accordion.scss';
import {
  Body1,
  Body1Stronger,
  Button,
  Caption1,
  Card,
  CardFooter,
  CardHeader,
  makeStyles,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components';
import {
  getMatchingPublishers,
  getMatchingReports,
  getNumberOfHours,
  getNumberOfStudies,
  StatsType,
} from './reports-stats';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, Publishers, Users } from '../data';
import { Fragment, useState } from 'react';
import { ConfirmationDialog } from '../comps';
import { Flags } from '../data/flags';
import { Publisher, Report, Role } from '../types';
import { PublishersListDialog } from '../comps/modals';

interface TableRowData {
  label: string;
  type: StatsType;
  filterOutSubOne: boolean;
  showHours: boolean;
}

const ROW_DEFINITIONS: TableRowData[] = [
  { label: 'Totaux', type: StatsType.All, filterOutSubOne: false, showHours: true },
  { label: 'Proclamateurs', type: StatsType.Publishers, filterOutSubOne: true, showHours: false },
  { label: 'Pionniers auxiliaires', type: StatsType.AuxilaryPionneer, filterOutSubOne: true, showHours: true },
  { label: 'Pionniers permanents', type: StatsType.RegularPionneer, filterOutSubOne: true, showHours: true },
];

function buildRowStats(
  rowDef: TableRowData,
  reports: Report[],
  publishers: Publisher[],
) {
  const props = {
    type: rowDef.type,
    filterOutSubOne: rowDef.filterOutSubOne,
    reports,
    publishers,
  };
  const filteredReports =
    rowDef.type === StatsType.All ? reports : getMatchingReports(props);
  const matchingPublishers = getMatchingPublishers(props);
  return {
    label: rowDef.label,
    count: filteredReports.length,
    hours: getNumberOfHours(filteredReports),
    courses: getNumberOfStudies(filteredReports),
    publishers: matchingPublishers,
    showHours: rowDef.showHours,
  };
}

const useStyles = makeStyles({
  table: {
    marginTop: '8px',
    marginBottom: '8px',
  },
  clickableCount: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
});

export function ReportAccordion() {
  const styles = useStyles();
  const { reports, publishers } = useSelector((state: GlobalState) => {
    return {
      reports: Publishers.getAllUnsubmittedReports(),
      publishers: state.publishers.publishers,
    };
  }, shallowEqual);
  const [isLoading, setIsLoading] = useState(false);
  const [counter, setCounter] = useState<number>(0);
  const [shouldShowReportsModal, setShouldShowSubmitReportsModal] =
    useState(false);

  const rows = ROW_DEFINITIONS.map((def) =>
    buildRowStats(def, reports, publishers),
  );

  return (
    <Fragment>
      <Card className="s1-card" appearance="filled-alternative">
        <CardHeader
          header={<Body1>Rapport S-1</Body1>}
          description={<Caption1>A soumettre en début de mois</Caption1>}
        />
        <Table className={styles.table} size="small">
          <TableHeader>
            <TableRow>
              <TableHeaderCell></TableHeaderCell>
              <TableHeaderCell>
                <Caption1>Fiches d'activité (S-4)</Caption1>
              </TableHeaderCell>
              <TableHeaderCell>
                <Caption1>Heures</Caption1>
              </TableHeaderCell>
              <TableHeaderCell>
                <Caption1>Cours</Caption1>
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell>
                  <TableCellLayout>
                    <Body1>{row.label}</Body1>
                  </TableCellLayout>
                </TableCell>
                <TableCell>
                  <PublishersListDialog
                    publishers={row.publishers}
                    mode="regular">
                    <Body1Stronger className={styles.clickableCount}>
                      {row.count}
                    </Body1Stronger>
                  </PublishersListDialog>
                </TableCell>
                <TableCell>
                  <Body1Stronger>
                    {row.showHours ? row.hours : '—'}
                  </Body1Stronger>
                </TableCell>
                <TableCell>
                  <Body1Stronger>{row.courses}</Body1Stronger>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CardFooter
          action={
            <Button
              disabled={
                isLoading ||
                ![Role.ROOT, Role.ADMIN].includes(
                  Users.getCurrent()!.role || Role.BASIC,
                ) ||
                !reports.length
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
              Flags.raiseLoading({
                title: 'Soumission des rapports en cours…',
                id: loadingId,
              });
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
