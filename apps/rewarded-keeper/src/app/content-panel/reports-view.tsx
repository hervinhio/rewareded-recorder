import { CSSProperties, useMemo, useState } from 'react';
import { GlobalState, Reports } from '../data';
import { ConfirmationDialog, ReportDialog } from '../comps/modals';
import { Month, Publisher, Report } from '../types';
import { shallowEqual, useSelector } from 'react-redux';
import { cloneDeep } from 'lodash';
import './reports-view.scss';
import { getNLastMonthsFromX } from '../utils';
import { Timestamp } from '@firebase/firestore';
import { ReportsTable } from './reports-table';
import { Body1 } from '@fluentui/react-components';
import { EmptyState } from '../comps/empty-state';

interface Props {
  publisher: Publisher;
}

export const ReportsView = (props: Props) => {
  const rawReports = useSelector(
    (state: GlobalState) =>
      cloneDeep(
        state.reports.byPublisher[props.publisher?.id || ''] || [],
      ).sort(sortReportsByMonth),
    shallowEqual,
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportUnderEdit, setReportUnderEdit] = useState<Report | undefined>();
  const [reportToDelete, setReportToDelete] = useState<Report | undefined>();

  const months = getNLastMonthsFromX(24, new Date());
  const reports = useMemo(() => {
    const _reports: Report[] = [];

    for (let i = 0; i < 24; i++) {
      const month = months[i];
      const report = rawReports.find((r) => r.monthId === month.getKey());
      const nullReport: Report = {
        comment: 'Rapport non remis',
        courses: 0,
        hours: 0,
        id: `null-report-${i}`,
        isFirstReport: false,
        monthId: month.getKey(),
        publisherId: props.publisher?.id || '',
        submitted: false,
        active: false,
        date: Timestamp.now(),
        isAPReport: false,
      };

      _reports.push(!report ? nullReport : report);
    }

    return _reports;
  }, [months, props.publisher?.id, rawReports]);

  return (
    <div style={{ width: '100%', overflowY: 'scroll' } as CSSProperties}>
      {!!reportToDelete && (
        <ConfirmationDialog
          title={'Supprimer un rapport de service'}
          risky={true}
          show={!!reportToDelete}
          onClose={(confirmed: boolean) => {
            if (confirmed) {
              Reports.delete(reportToDelete);
            }

            setReportToDelete(undefined);
          }}>
          <Body1>
            Voulez-vous vraiment supprimer ce rapport de service ? Vous ne
            pourrez plus le recouvrer.
          </Body1>
        </ConfirmationDialog>
      )}

      {reports.length && (
        <ReportsTable
          publisher={props.publisher}
          reports={reports}
          onDeleteReport={(report) => setReportToDelete(report)}
          onEditReport={(report) => {
            setReportUnderEdit(report);
            setShowReportModal(true);
          }}
        />
      )}
      {!reports.length && (
        <EmptyState header="Aucun rapport pour n'a encore été saisi pour ce proclamateur." />
      )}

      {showReportModal && (
        <ReportDialog
          report={reportUnderEdit}
          onHide={(created: boolean) => {
            setShowReportModal(false);
            setReportUnderEdit(undefined);
          }}
          publisherId={props.publisher.id}
          show={showReportModal}
        />
      )}
    </div>
  );
};

const sortReportsByMonth = (a: Report, b: Report): number => {
  const monthA = Month.fromKey(a.monthId);
  const monthB = Month.fromKey(b.monthId);

  if (monthA.year < monthB.year) {
    return 1;
  } else if (monthA.year > monthB.year) {
    return -1;
  } else {
    return monthB.month - monthA.month;
  }
};
