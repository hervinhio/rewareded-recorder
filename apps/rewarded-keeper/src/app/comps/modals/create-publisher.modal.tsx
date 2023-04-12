import Banner from '@atlaskit/banner';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { useState } from 'react';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { getGroupName, Publisher } from '../../types';
import Button, { LoadingButton } from '@atlaskit/button';
import { Publishers } from '../../data/publishers';
import { MovingTrainIcon } from '..';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../../data';

interface Props {
  show: boolean;
  onHide: () => void;
}

interface ValidationParams {
  firstName: string;
  name: string;
  lastName: string;
  groupId: string;
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
                <Banner
                  appearance="warning"
                  icon={<WarningIcon label="" secondaryColor="inherit" />}
                  isOpen
                >
                  {error}
                </Banner>
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
                    v ? setGroupId(groups.groups[Number(v)].id) : null
                  }
                >
                  {groups.groups.map((group, index) => (
                    <Dropdown.Item key={group.id} eventKey={index}>
                      {' '}
                      {group.name}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </Form.Group>
            </Form>
          </ModalBody>
          <ModalFooter>
            <LoadingButton
              appearance="primary"
              isLoading={isLoading}
              onClick={() => {
                if (isLoading) return;
                setIsLoading(true);
                onValidate({
                  groupId,
                  firstName,
                  name,
                  lastName,
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

    return Publishers.create(publisher)
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
