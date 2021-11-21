import { Modal, Button } from "react-bootstrap";

export interface NoValidMonthModalProps {
  show: boolean;
  onHide: () => void;
}

export function NoValidMonthModal(props: NoValidMonthModalProps) {

  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Erreur</Modal.Title>
      </Modal.Header>
      <Modal.Body>La période sélectionnée est invalide.</Modal.Body>
      <Modal.Footer>
        <Button variant="pirmary" onClick={props.onHide}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
