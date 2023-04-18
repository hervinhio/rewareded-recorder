import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { Stats } from '../../data';
import { Form, Button as BootstrapButton, InputGroup } from 'react-bootstrap';
import Button, { ButtonGroup } from '@atlaskit/button';
import { useState } from 'react';

interface Props {
  stats: Stats;
  onClose: (stats?: Stats) => void;
}

export function StatsModificationDialog({ stats, onClose }: Props) {
  const [underRestrictions, setUnderRestriction] = useState(
    stats.underRestrictions || 0
  );
  const [baptized, setBaptized] = useState(stats.baptized || 0);

  return (
    <Modal shouldCloseOnEscapePress={true}>
      <ModalTransition>
        <ModalHeader>
          <ModalTitle>Mise à jour des stats</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Blâmés</Form.Label>
            <InputGroup>
              <Form.Control
                disabled={true}
                type="number"
                placeholder="0"
                onChange={(e) =>
                  setUnderRestriction(Number(e.target.value) || 0)
                }
                value={underRestrictions}
              />
              <BootstrapButton
                variant="outline-secondary"
                onClick={() => {
                  if (underRestrictions === 0) return;
                  setUnderRestriction(underRestrictions - 1);
                }}
              >
                -
              </BootstrapButton>
              <BootstrapButton
                variant="outline-secondary"
                onClick={() => setUnderRestriction(underRestrictions + 1)}
              >
                +
              </BootstrapButton>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Baptisés</Form.Label>
            <InputGroup>
              <Form.Control
                disabled={true}
                type="number"
                placeholder="0"
                value={baptized}
              />
              <BootstrapButton
                variant="outline-secondary"
                onClick={() => {
                  if (underRestrictions === 0) return;
                  setBaptized(baptized - 1);
                }}
              >
                -
              </BootstrapButton>
              <BootstrapButton
                variant="outline-secondary"
                onClick={() => setBaptized(baptized + 1)}
              >
                +
              </BootstrapButton>
            </InputGroup>
          </Form.Group>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              appearance="primary"
              onClick={() =>
                onClose({
                  ...stats,
                  underRestrictions,
                  baptized,
                })
              }
            >
              Valider
            </Button>
            <Button appearance="subtle" onClick={() => onClose()}>
              Annuler
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalTransition>
    </Modal>
  );
}
