import { useEffect, useState } from "react";
import { Modal, Button, Form, Alert, DropdownButton, Dropdown } from "react-bootstrap";
import { setMonthConfig } from "../data";
import { localeMonthStrings } from "../types";

export interface AddMonthModalProps {
  show: boolean;
  onHide: () => void;
}

export function AddMonthModal(props: AddMonthModalProps) {
  const [ formUrl, setFormUrl ] = useState('');
  const [ month, setMonth ] = useState<number>(0);
  const [ year, setYear ] = useState<number>(0);
  const [ error, setError ] = useState('');

  const now = new Date();
  const years = [ now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  useEffect(() => {
    const currentMonth = now.getMonth();
    setMonth(currentMonth);
    setYear(now.getFullYear());
  }, []);

  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Ajouter un mois</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>URL du formulaire</Form.Label>
            <Form.Control type="url" placeholder="http://example.com" onChange={(e) => setFormUrl(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Mois</Form.Label>
            <DropdownButton
              title={localeMonthStrings[month]}
              onSelect={(v) => setMonth(Number(v))}
            >
              { localeMonthStrings.map((month, index) => <Dropdown.Item key={index} eventKey={index}> { month }</Dropdown.Item>) }
            </DropdownButton>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Année</Form.Label>
            <DropdownButton
              title={year}
              onSelect={(v) => setYear(Number(v))}
            >
              { years.map((year) => <Dropdown.Item key={year} eventKey={year}> { year }</Dropdown.Item>) }
            </DropdownButton>
          </Form.Group>
        </Form>
      </Modal.Body>

      {error &&
        <Alert key={1} variant={'danger'}>
          {error}
        </Alert>
      }

      <Modal.Footer>
        <Button variant="pirmary" type="submit" onClick={() => onValidate({ formUrl, month, year, onHide: props.onHide, setError })}>
          Ajouter
        </Button>
        <Button variant="secondary" onClick={props.onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const onValidate = (params: { formUrl: string, month: number, year: number, onHide: () => void, setError: (error: any) => void }) => {
  if (params.formUrl && params.month && params.year) {
    setMonthConfig({ id: `${params.year}#${params.month}`, formUrl: params.formUrl })
      .then(() => {
        params.onHide();
      })
      .catch((error: any) => {
        params.setError(error?.message);
      });
  }
}
