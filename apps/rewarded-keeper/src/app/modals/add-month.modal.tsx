import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { setMonthConfig } from "../data";

export interface AddMonthModalProps {
  show: boolean;
  onHide: () => void;
}

export function AddMonthModal(props: AddMonthModalProps) {
  const [ formUrl, setFormUrl ] = useState('');
  const [ month, setMonth ] = useState('');
  const [ year, setYear ] = useState('');
  const [ error, setError ] = useState('');

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
            <Form.Control type="number" placeholder="Mois" onChange={(e) => setMonth(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Année</Form.Label>
            <Form.Control type="number" placeholder="Année" onChange={(e) => setYear(e.target.value)} />
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

const onValidate = (params: { formUrl: string, month: string, year: string, onHide: () => void, setError: (error: any) => void }) => {
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
