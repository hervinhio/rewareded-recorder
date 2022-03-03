import Button from '@atlaskit/button';
import { CSSProperties, useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { Repports } from '../data';
import { RepportModal } from '../modals';
import { Month, Publisher, Repport } from '../types';

interface Props {
  publisher: Publisher;
}

export const RepportsView = (props: Props) => {
  const [repports, setRepports] = useState<Repport[]>([]);
  const [showRepportModal, setShowRepportModal] = useState(false);
  const [repportUnderEdit, setRepportUnderEdit] = useState<
    Repport | undefined
  >();

  useEffect(() => {
    Repports.byPublisherId(props.publisher.id).then(
      (repps) => setRepports(repps.sort(sortRepportsByMonth)),
      (err) => console.error(err)
    );
  }, [props.publisher.id]);

  return (
    <div style={{ width: '100%', overflowY: 'scroll' } as CSSProperties}>
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
          {repports.map((repport: Repport) => {
            return (
              <tr>
                <td>{Month.fromKey(repport.monthId).toLocaleFullMonth()}</td>
                <td>{repport.publications}</td>
                <td>{repport.videos}</td>
                <td>{repport.hours}</td>
                <td>{repport.visits}</td>
                <td>{repport.courses}</td>
                <td>
                  <Button
                    onClick={() => {
                      setRepportUnderEdit(repport);
                      setShowRepportModal(true);
                    }}
                  >
                    Modifier
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
          onHide={() => {
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
