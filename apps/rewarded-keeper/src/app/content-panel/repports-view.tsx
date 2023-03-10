import { CSSProperties, Dispatch, SetStateAction, useState } from 'react';
import { GlobalState, Repports } from '../data';
import { ConfirmationModal, RepportModal } from '../comps/modals';
import { Month, Publisher, Repport } from '../types';
import { HeadType, RowType } from '@atlaskit/dynamic-table/dist/types/types';
import DynamicTable from '@atlaskit/dynamic-table';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import { shallowEqual, useSelector } from 'react-redux';
import EmptyState from '@atlaskit/empty-state';
import { cloneDeep } from 'lodash';
import './reports-view.scss';
import { IconButton } from '@atlaskit/atlassian-navigation';
import { R300 } from '@atlaskit/theme/colors';

const visibleMonthsRange = 6;

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
      key: 'publications',
      content: 'Publications',
      isSortable: true,
    },
    {
      key: 'videos',
      content: 'Vidéos',
    },
    {
      key: 'hours',
      content: 'Heures',
    },
    {
      key: 'visits',
      content: 'Visites',
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

export const RepportsView = (props: Props) => {
  const reports = useSelector(
    (state: GlobalState) =>
      cloneDeep(
        state.reports.byPublisher[props.publisher?.id || ''] || []
      ).sort(sortRepportsByMonth),
    shallowEqual
  );
  const [showRepportModal, setShowRepportModal] = useState(false);
  const [reportUnderEdit, setRepportUnderEdit] = useState<
    Repport | undefined
  >();
  const [reportToDelete, setReportToDelete] = useState<Repport | undefined>();
  const setters = {
    setShowRepportModal,
    setRepportUnderEdit,
    setReportToDelete,
  };

  const rows =
    reports.map((report: Repport, index: number) =>
      reportToRow(report, index, props.publisher, setters)
    ) || [];

  if (rows.length) {
    const averageReport: Repport = {
      id: '',
      monthId: 'Averrage',
      publisherId: props.publisher.id || '',
      submitted: false,
      comment: '',
      courses:
        reports.map((r) => r.courses).reduce((p, c) => p + c) / reports.length,
      hours:
        reports.map((r) => r.hours).reduce((p, c) => p + c) / reports.length,
      publications:
        reports.map((r) => r.publications).reduce((p, c) => p + c) /
        reports.length,
      videos:
        reports.map((r) => r.videos).reduce((p, c) => p + c) / reports.length,
      visits:
        reports.map((r) => r.visits).reduce((p, c) => p + c) / reports.length,
    };
    rows.push(
      reportToRow(averageReport, reports.length, props.publisher, setters)
    );
  }

  return (
    <div style={{ width: '100%', overflowY: 'scroll' } as CSSProperties}>
      {!!reportToDelete && (
        <ConfirmationModal
          title={'Supprimer un rapport de service'}
          risky={true}
          onClose={(confirmed: boolean) => {
            if (confirmed) {
              Repports.delete(reportToDelete);
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

      {showRepportModal && (
        <RepportModal
          repport={reportUnderEdit}
          onHide={(created: boolean) => {
            setShowRepportModal(false);
            setRepportUnderEdit(undefined);
          }}
          publisherId={props.publisher.id}
          show={showRepportModal}
        />
      )}
    </div>
  );
};

const sortRepportsByMonth = (a: Repport, b: Repport): number => {
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

function getRowClass(
  report: Repport,
  publisher: Publisher
): string | undefined {
  if (publisher.auxilaryPionierFor?.includes(report.monthId)) {
    return 'auxilary';
  } else if (report.monthId === 'Averrage') {
    return 'averrage';
  }

  return undefined;
}

function reportToRow(
  report: Repport,
  index: number,
  publisher: Publisher,
  setters: {
    setShowRepportModal: Dispatch<SetStateAction<boolean>>;
    setRepportUnderEdit: Dispatch<SetStateAction<Repport | undefined>>;
    setReportToDelete: Dispatch<SetStateAction<Repport | undefined>>;
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
        key: `report-publications-${index}`,
        content: report.publications,
      },
      {
        key: `report-videos-${index}`,
        content: report.videos,
      },
      {
        key: `report-hours-${index}`,
        content: report.hours,
      },
      {
        key: `report-visits-${index}`,
        content: report.visits,
      },
      {
        key: `report-courses-${index}`,
        content: report.courses,
      },
      {
        key: `report-actions-${index}`,
        content:
          report.monthId !== 'Averrage' ? (
            <span style={{ display: 'flex', flexDirection: 'row' }}>
              <IconButton
                icon={<EditFilledIcon label="" />}
                tooltip="Edit this report"
                onClick={() => {
                  setters.setRepportUnderEdit(report);
                  setters.setShowRepportModal(true);
                }}
              />
              <IconButton
                tooltip="Delete this report"
                onClick={() => setters.setReportToDelete(report)}
                icon={<TrashIcon label="" primaryColor={R300} />}
              />
            </span>
          ) : null,
      },
    ],
    className: getRowClass(report, publisher),
  } as RowType;
}
