import { CSSProperties, Dispatch, SetStateAction, useState } from 'react';
import { GlobalState, Reports } from '../data';
import { ConfirmationModal, ReportModal } from '../comps/modals';
import { Month, Publisher, Report, isPecialPublisher } from '../types';
import { HeadType, RowType } from '@atlaskit/dynamic-table/dist/types/types';
import DynamicTable from '@atlaskit/dynamic-table';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import { shallowEqual, useSelector } from 'react-redux';
import EmptyState from '@atlaskit/empty-state';
import { cloneDeep } from 'lodash';
import './reports-view.scss';
import { IconButton } from '@atlaskit/atlassian-navigation';
import { token } from '@atlaskit/tokens';
import { getNLastMonthsFromX } from '../utils';
import { Timestamp } from '@firebase/firestore';

const visibleMonthsRange = 7; // 1 row for the average and 6 for the months

interface Props {
  publisher: Publisher;
}

const header: HeadType = {
  cells: [
    {
      key: 'mois',
      content: 'Mois',
      isSortable: true,
    },
    {
      key: 'hours',
      content: 'Heures',
    },
    {
      key: 'courses',
      content: 'Cours',
    },
    {
      key: 'actions',
      content: 'Actions',
    },
  ],
};

export const ReportsView = (props: Props) => {
  const rawReports = useSelector(
    (state: GlobalState) =>
      cloneDeep(
        state.reports.byPublisher[props.publisher?.id || ''] || []
      ).sort(sortReportsByMonth),
    shallowEqual
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportUnderEdit, setReportUnderEdit] = useState<Report | undefined>();
  const [reportToDelete, setReportToDelete] = useState<Report | undefined>();
  const setters = {
    setShowReportModal,
    setReportUnderEdit,
    setReportToDelete,
  };

  const rows: RowType[] = [];
  const months = getNLastMonthsFromX(24, new Date());
  const reports: Report[] = [];

  for (let i = 0; i < 24; i++) {
    const month = months[i];
    const report = rawReports.find((r) => r.monthId === month.getKey());
    const nullReport: Report = {
      comment: '',
      courses: 0,
      hours: 0,
      id: '',
      isFirstReport: false,
      monthId: month.getKey(),
      publisherId: props.publisher?.id || '',
      submitted: false,
      active: false,
      date: Timestamp.now(),
    };

    reports.push(!report ? nullReport : report);
  }

  const lastSixReports = reports.filter((_r, index) => index < 6);

  if (reports.length) {
    const averageReport: Report = {
      id: '',
      monthId: 'Averrage',
      publisherId: props.publisher.id || '',
      active: true,
      submitted: false,
      comment: '',
      courses:
        lastSixReports.map((r) => r.courses || 0).reduce((p, c) => p + c) /
        (lastSixReports.length || 1),
      hours:
        lastSixReports.map((r) => r.hours || 0).reduce((p, c) => p + c) /
        (lastSixReports.length || 1),
      isFirstReport: false,
    };
    rows.push(
      reportToRow(averageReport, reports.length, props.publisher, setters)
    );
  }

  rows.push(
    ...reports.map((report: Report, index: number) =>
      reportToRow(report, index, props.publisher, setters)
    )
  );

  return (
    <div style={{ width: '100%', overflowY: 'scroll' } as CSSProperties}>
      {!!reportToDelete && (
        <ConfirmationModal
          title={'Supprimer un rapport de service'}
          risky={true}
          onClose={(confirmed: boolean) => {
            if (confirmed) {
              Reports.delete(reportToDelete);
            }

            setReportToDelete(undefined);
          }}
        >
          Voulez-vous vraiment supprimer ce rapport de service ? Vous ne pourrez
          plus le recouvrer.
        </ConfirmationModal>
      )}

      {!!rows.length && (
        <DynamicTable
          head={header}
          rows={rows}
          rowsPerPage={visibleMonthsRange}
          defaultPage={1}
          loadingSpinnerSize="large"
          isRankable
        />
      )}
      {!rows.length && (
        <EmptyState header="Aucun rapport pour n'a encore été saisi pour ce proclamateur." />
      )}

      {showReportModal && (
        <ReportModal
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

function getRowClass(report: Report, publisher: Publisher): string | undefined {
  if (publisher.auxilaryPionierFor?.includes(report.monthId)) {
    return 'auxilary';
  } else if (report.monthId === 'Averrage') {
    return 'averrage';
  } else if (report.isFirstReport) {
    return 'first-report';
  }

  return undefined;
}

function reportToRow(
  report: Report,
  index: number,
  publisher: Publisher,
  setters: {
    setShowReportModal: Dispatch<SetStateAction<boolean>>;
    setReportUnderEdit: Dispatch<SetStateAction<Report | undefined>>;
    setReportToDelete: Dispatch<SetStateAction<Report | undefined>>;
  }
): RowType {
  return {
    key: `row-${index}`,
    cells: [
      {
        key: `report-month-${index}`,
        content:
          report.monthId === 'Averrage'
            ? 'Moyenne'
            : Month.fromKey(report.monthId).toLocaleFullMonth(),
      },
      {
        key: `report-hours-${index}`,
        content: isPecialPublisher(publisher, Month.fromKey(report.monthId))
          ? roundIfNeeded(report.hours || 0, report.monthId)
          : 'N/A',
      },
      {
        key: `report-courses-${index}`,
        content: roundIfNeeded(report.courses || 0, report.monthId),
      },
      {
        key: `report-actions-${index}`,
        content:
          report.monthId !== 'Averrage' ? (
            <span style={{ display: 'flex', flexDirection: 'row' }}>
              <IconButton
                icon={
                  <EditFilledIcon label="" primaryColor={token('color.icon')} />
                }
                tooltip="Edit this report"
                onClick={() => {
                  setters.setReportUnderEdit(report);
                  setters.setShowReportModal(true);
                }}
              />
              <IconButton
                tooltip="Delete this report"
                onClick={() => setters.setReportToDelete(report)}
                icon={
                  <TrashIcon
                    label=""
                    primaryColor={token('color.icon.danger')}
                  />
                }
              />
            </span>
          ) : null,
      },
    ],
    className: getRowClass(report, publisher),
  } as RowType;
}

function roundIfNeeded(value: number, trigger: string): number {
  return trigger === 'Averrage' ? Math.round(value) : value;
}
