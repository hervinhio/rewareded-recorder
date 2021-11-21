import { Modal, Button } from "react-bootstrap";

interface ErrorModalProps {
  show: boolean;
  error: any;
  onHide: () => void;
}

export function ErrorModal(props: ErrorModalProps) {

  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Erreur</Modal.Title>
      </Modal.Header>
      <Modal.Body>
       <p>Une erreur est survenue. Veuillez contacter l'administrateur de l'application</p>
       <p>{ props.error?.toString?.() }</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="pirmary" onClick={props.onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
