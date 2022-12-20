import Banner from '@atlaskit/banner';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { useEffect, useState } from 'react';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { Events, Group } from '../../types';
import { Groups } from '../../data/groups';
import Button, { LoadingButton } from '@atlaskit/button';
import { Publishers } from '../../data/publishers';
import { Timestamp } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { LoadingIcon, MovingTrainIcon } from '..';

interface Props {
  groupId: string;
  show: boolean;
  onHide: () => void;
}

interface ValidationParams {
  firstName: string;
  name: string;
  lastName: string;
  groupId: string;
  onHide: () => void;
  setError: (error: any) => void;
}

export function CreatePublisherModal(props: Props) {
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Groups.get()
      .then(
        (groups) => setGroups(groups),
        (error: FirebaseError) => {
          console.error(error);
          setError(error.message);
        }
      )
      .finally(() => setIsLoading(false));
  }, []);

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
                  title={getGroupName(groupId, groups)}
                  disabled={isLoading}
                  onSelect={(v) =>
                    v ? setGroupId(groups[Number(v)].id) : null
                  }
                >
                  {groups.map((group, index) => (
                    <Dropdown.Item key={index} eventKey={index}>
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
                })
                  .then(() => {
                    Events.emit('publisher_updated');
                  })
                  .finally(() => setIsLoading(false));
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
      .then(() => {
        params.onHide();
      })
      .catch((error: any) => {
        params.setError(error?.message);
      });
  }
  params.setError(
    'Le formulaire contient des erreurs. Veuillez les corriger avant de continuer.'
  );
  return Promise.resolve();
};

const getGroupName = (groupId: string, groups: Group[]) => {
  return groups.find((group) => group.id === groupId)?.name || 'Non affilié';
};
