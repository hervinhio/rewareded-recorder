import Button from '@atlaskit/button';
import { CSSProperties, useState } from 'react';
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
  const repports = useSelector(
    (state: GlobalState) =>
      cloneDeep(
        state.reports.byPublisher[props.publisher?.id || ''] || []
      ).sort(sortRepportsByMonth),
    shallowEqual
  );
  const [showRepportModal, setShowRepportModal] = useState(false);
  const [repportUnderEdit, setRepportUnderEdit] = useState<
    Repport | undefined
  >();
  const [reportToDelete, setReportToDelete] = useState<Repport | undefined>();

  const rows =
    repports.map((repport: Repport, index: number) => {
      return {
        key: `row-${index}`,
        cells: [
          {
            key: `repport-month-${index}`,
            content: Month.fromKey(repport.monthId).toLocaleFullMonth(),
          },
          {
            key: `repport-publications-${index}`,
            content: repport.publications,
          },
          {
            key: `repport-videos-${index}`,
            content: repport.videos,
          },
          {
            key: `repport-hours-${index}`,
            content: repport.hours,
          },
          {
            key: `repport-visits-${index}`,
            content: repport.visits,
          },
          {
            key: `repport-courses-${index}`,
            content: repport.courses,
          },
          {
            key: `repport-actions-${index}`,
            content: (
              <>
                <Button
                  style={{ borderRadius: 26 }}
                  appearance="subtle"
                  onClick={() => {
                    setRepportUnderEdit(repport);
                    setShowRepportModal(true);
                  }}
                >
                  <EditFilledIcon label="" size="small" />
                </Button>
                &nbsp;&nbsp;
                <Button
                  appearance="danger"
                  style={{ borderRadius: 40 }}
                  onClick={() => setReportToDelete(repport)}
                >
                  <TrashIcon label="" size="small" />
                </Button>
              </>
            ),
          },
        ],
        className: getRowClass(repport, props.publisher),
      } as RowType;
    }) || [];

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
          rowsPerPage={5}
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
          repport={repportUnderEdit}
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
  }

  return undefined;
}
