import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { MovingTrainIcon } from '..';
import { useState } from 'react';
import { AttendanceRecord, AttendanceRecords } from '../../data';
import { Form } from 'react-bootstrap';
import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button';
import { FirebaseError } from 'firebase/app';
import SectionMessage from '@atlaskit/section-message';
import { Timestamp } from 'firebase/firestore';

interface Props {
  show: boolean;
  mode: 'edit' | 'create';
  record?: AttendanceRecord;
  onHide: () => void;
}

export function AttendanceReportModal(props: Props) {
  const now = new Date();
  now.setHours(1, 0, 0, 0);

  const initialState = {
    date: Timestamp.fromDate(now),
    inPerson: 0,
    monthId: `${now.getFullYear()}#${now.getMonth()}`,
    zoom: 0,
    isMidweekMeeting: false,
  };
  const [error, setError] = useState<
    Error | FirebaseError | unknown | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [record, _setRecord] = useState<AttendanceRecord>(
    props.record || initialState
  );

  if (!props.show) return null;

  const setRecord = (record: AttendanceRecord) => {
    _setRecord(record);
    setError(undefined);
  };

  const save = async () => {
    setIsLoading(true);
    try {
      if (props.mode === 'create' && await AttendanceRecords.existsForDate(record.date)) {
        throw new Error('Un rapport existe déjà pour la date séléctionnée');
      }

      validateRecord(record);
      const promise$ =
        props.mode === 'edit'
          ? AttendanceRecords.update(record)
          : AttendanceRecords.create(record);
      await promise$;
      props.onHide();
    } catch (e: unknown) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal shouldCloseOnEscapePress={true}>
      <ModalTransition>
        <ModalHeader>
          <ModalTitle>
            {' '}
            {props.mode === 'edit' ? 'Modifier' : 'Créer'} un rapport
            d'assitance
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          {!!error && (
            <SectionMessage appearance="error">
              <p>{error.toString()}</p>
            </SectionMessage>
          )}
          {isLoading && <MovingTrainIcon />}
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              placeholder="Patrick"
              disabled={isLoading}
              value={record.date.toDate().toISOString().substring(0, 10)}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                setRecord({
                  ...record,
                  date: Timestamp.fromDate(newDate),
                  monthId: `${newDate.getFullYear()}#${newDate.getMonth()}`,
                });
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Type de réunion</Form.Label>
            <Form.Check
              type="checkbox"
              label="Réunion de semaine ?"
              checked={record.isMidweekMeeting}
              disabled={isLoading}
              onChange={(e) => {
                setRecord({ ...record, isMidweekMeeting: e.target.checked });
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>En présentiel</Form.Label>
            <Form.Control
              type="number"
              placeholder="Nombre de personnes présentiel"
              value={record.inPerson}
              disabled={isLoading}
              onChange={(e) => {
                setRecord({ ...record, inPerson: Number(e.target.value) });
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Sur zoom</Form.Label>
            <Form.Control
              type="number"
              placeholder="Nombre de personnes sur zoom"
              disabled={isLoading}
              value={record.zoom}
              onChange={(e) => {
                setRecord({ ...record, zoom: Number(e.target.value) });
              }}
            />
          </Form.Group>
          <hr />
          <Form.Text>Total: {record.inPerson + record.zoom}</Form.Text>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <LoadingButton
              isLoading={isLoading}
              appearance="primary"
              onClick={save}
            >
              Sauvegarder
            </LoadingButton>
            <Button appearance="subtle" onClick={() => props.onHide()}>
              Annuler
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalTransition>
    </Modal>
  );
}

function validateRecord(record: AttendanceRecord) {
  if (!record.date || !record.monthId) {
    throw new Error('Vous devez définir la date');
  }

  if (record.inPerson + record.zoom === 0) {
    throw new Error("L'assistance ne peut être nulle");
  }
}
