import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { useState } from 'react';
import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { getGroupName, Publisher } from '../../types';
import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button';
import { NewPublisherReason, Publishers } from '../../data/publishers';
import { MovingTrainIcon } from '..';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../../data';
import SectionMessage from '@atlaskit/section-message';

interface Props {
  show: boolean;
  onHide: () => void;
}

interface ValidationParams {
  firstName: string;
  name: string;
  lastName: string;
  groupId: string;
  reason: NewPublisherReason;
  onHide: () => void;
  setError: (error: string) => void;
}

export function CreatePublisherModal(props: Props) {
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState<NewPublisherReason | null>(null);
  const groups = useSelector(
    (state: GlobalState) => state.groups,
    shallowEqual
  );

  return (
    <Modal shouldCloseOnEscapePress={true}>
      {props.show && (
        <ModalTransition>
          <ModalHeader>
            <ModalTitle>Créer un proclamateur</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Form>
              {error && (
                <SectionMessage appearance="error">
                  {error}
                </SectionMessage>
              )}
              {isLoading && <MovingTrainIcon />}
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Patrick"
                  disabled={isLoading}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Nom</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Irenge"
                  disabled={isLoading}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Post-nom</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Kiyuka"
                  disabled={isLoading}
                  onChange={(e) => {
                    setLastName(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Groupe</Form.Label>
                <DropdownButton
                  title={getGroupName(groupId, groups.groups)}
                  disabled={isLoading}
                  onSelect={(v) =>
                    setGroupId(
                      groups.groups.find((g) => g.id === v)?.id || 'unafiliated'
                    )
                  }
                >
                  {groups.groups.map((group, index) => (
                    <Dropdown.Item key={group.id} eventKey={group.id}>
                      {' '}
                      {group.name}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Raison</Form.Label>
                <DropdownButton
                  title={'Raison'}
                  disabled={isLoading}
                  onSelect={(r) => setReason(r as NewPublisherReason | null)}
                >
                  <Dropdown.Item key={'new'} eventKey={NewPublisherReason.New}>
                    Nouveau proclamateur
                  </Dropdown.Item>
                  <Dropdown.Item
                    key={'transferred'}
                    eventKey={NewPublisherReason.Transferred}
                  >
                    Venant d'ailleurs
                  </Dropdown.Item>
                </DropdownButton>
              </Form.Group>
            </Form>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <LoadingButton
                appearance="primary"
                isLoading={isLoading}
                onClick={() => {
                  if (reason === null) {
                    setError('Préciez la raison');
                    return;
                  }

                  if (isLoading) return;

                  setIsLoading(true);
                  onValidate({
                    groupId,
                    firstName,
                    name,
                    lastName,
                    reason,
                    onHide: props.onHide,
                    setError,
                  }).finally(() => setIsLoading(false));
                }}
              >
                Ajouter
              </LoadingButton>
              <Button
                isDisabled={isLoading}
                appearance="subtle"
                onClick={props.onHide}
              >
                Fermer
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalTransition>
      )}
    </Modal>
  );
}

const onValidate = (params: ValidationParams) => {
  if (!!params.name && !!params.firstName) {
    const publisher = {
      firstName: params.firstName,
      name: params.name,
      lastName: params.lastName,
      groupId: params.groupId || 'unafiliated',
    } as any;

    return Publishers.create(publisher, params.reason)
      .then((publisher: Publisher) => {
        params.onHide();
        return publisher;
      })
      .catch((error: any) => {
        params.setError(error?.message);
        return publisher;
      });
  }
  params.setError(
    'Le formulaire contient des erreurs. Veuillez les corriger avant de continuer.'
  );
  return Promise.resolve();
};
