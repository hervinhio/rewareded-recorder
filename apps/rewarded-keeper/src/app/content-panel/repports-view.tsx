import Button from '@atlaskit/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSProperties, useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { Repports } from '../data';
import { ConfirmationModal, RepportModal } from '../modals';
import { Month, Publisher, Repport } from '../types';
import { useLocation } from 'react-router-dom';

interface Props {
  publisher: Publisher;
}

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

  return (
    <div style={{ width: '100%', overflowY: 'scroll' } as CSSProperties}>
      {!!repportIdToDelete && (
        <ConfirmationModal
          title={'Supprimer un rapport de service'}
          risky={true}
          onClose={(confirmed: boolean) => {
            if (confirmed) {
              Repports.delete(repportIdToDelete).then(() => {
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

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Mois</th>
            <th>Publications</th>
            <th>Vidéos</th>
            <th>Heures</th>
            <th>Nouvelles visites</th>
            <th>Cours bibliques</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {repports.map((repport: Repport, index: number) => {
            return (
              <tr key={index}>
                <td>{Month.fromKey(repport.monthId).toLocaleFullMonth()}</td>
                <td>{repport.publications}</td>
                <td>{repport.videos}</td>
                <td>{repport.hours}</td>
                <td>{repport.visits}</td>
                <td>{repport.courses}</td>
                <td>
                  <Button
                    style={{ borderRadius: 26 }}
                    onClick={() => {
                      setRepportUnderEdit(repport);
                      setShowRepportModal(true);
                    }}
                  >
                    <FontAwesomeIcon icon="pen-square" />
                  </Button>
                  &nbsp;&nbsp;
                  <Button
                    appearance="danger"
                    style={{ borderRadius: 26 }}
                    onClick={() => setRepportIdToDelete(repport.id)}
                  >
                    <FontAwesomeIcon icon="trash" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {showRepportModal && (
        <RepportModal
          repport={repportUnderEdit}
          onHide={(created: boolean) => {
            setCounter(counter + 1)
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
