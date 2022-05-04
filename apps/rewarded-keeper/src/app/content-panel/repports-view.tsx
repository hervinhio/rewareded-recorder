import Button from '@atlaskit/button';
import { CSSProperties, useEffect, useState } from 'react';
import { Repports } from '../data';
import { ConfirmationModal, RepportModal } from '../comps/modals';
import { Events, Month, Publisher, Repport } from '../types';
import { useLocation } from 'react-router-dom';
import { HeadType } from '@atlaskit/dynamic-table/dist/types/types';
import DynamicTable from '@atlaskit/dynamic-table';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';

interface Props {
  publisher: Publisher;
};

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
      content: 'Actions'
    }
  ]
};

export const RepportsView = (props: Props) => {
  const [repports, setRepports] = useState<Repport[]>([]);
  const [showRepportModal, setShowRepportModal] = useState(false);
  const [repportUnderEdit, setRepportUnderEdit] = useState<
    Repport | undefined
  >();
  const [counter, setCounter] = useState(0);
  const [repportIdToDelete, setRepportIdToDelete] = useState<
    string | undefined
  >();
  const location = useLocation();

  useEffect(() => {
    Repports.byPublisherId(props.publisher.id).then(
      (repps) => setRepports(repps.sort(sortRepportsByMonth)),
      (err) => console.error(err)
    );
  }, [props.publisher.id, counter, location.hash]);

  useEffect(() => {
    const onRepportUpdated = () => setCounter(counter + 1);
    Events.on('repport_updated', onRepportUpdated);
    return () => Events.off('repport_updated', onRepportUpdated);
  });

  const rows = repports.map((repport: Repport, index: number) => {
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
            content: repport.visits
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
                  <EditFilledIcon label="" size="small"/>
                </Button>
                &nbsp;&nbsp;
                <Button
                  appearance="danger"
                  style={{ borderRadius: 40 }}
                  onClick={() => setRepportIdToDelete(repport.id)}
                >
                  <TrashIcon label="" size="small"/>
                </Button>
              </>
            )
          }
        ]
      }
    });

  return (
    <div style={{ width: '100%', overflowY: 'scroll' } as CSSProperties}>
      {!!repportIdToDelete && (
        <ConfirmationModal
          title={'Supprimer un rapport de service'}
          risky={true}
          onClose={(confirmed: boolean) => {
            if (confirmed) {
              Repports.delete(repportIdToDelete).then(() => {
                Events.emit('repport_updated');
                setCounter(counter + 1);
              });
            }

            setRepportIdToDelete(undefined);
          }}
        >
          Voulez-vous vraiment supprimer ce rapport de service ? Vous ne pourrez
          plus le recouvrer.
        </ConfirmationModal>
      )}

      <DynamicTable
        head={header}
        rows={rows}
        rowsPerPage={5}
        defaultPage={1}
        loadingSpinnerSize="large"
        isRankable
      />

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
    return -1;
  } else if (monthA.year > monthB.year) {
    return 1;
  } else {
    return monthA.month - monthB.month;
  }
};
