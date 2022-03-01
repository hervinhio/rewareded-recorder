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
import { Group } from '../types';
import { Groups } from '../data/groups';
import Button from '@atlaskit/button';
import { Publishers } from '../data/publishers';
import { Timestamp } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

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
  birthDate: string;
  baptismDate: string;
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
  const [birthDate, setBirthDate] = useState<string>('');
  const [baptismDate, setBaptismDate] = useState<string>('');

  useEffect(() => {
    Groups.get().then(
      (groups) => setGroups(groups),
      (error: FirebaseError) => {
        console.error(error);
        setError(error.message);
      }
    );
  }, []);

  return (
    <Modal>
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
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Prénom</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Patrick"
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
                  onChange={(e) => {
                    setLastName(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Date de naissance</Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Kiyuka"
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Date de baptême</Form.Label>
                <Form.Control
                  type="date"
                  placeholder="Kiyuka"
                  onChange={(e) => {
                    setBaptismDate(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Group</Form.Label>
                <DropdownButton
                  title={getGroupName(groupId, groups)}
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
            <Button
              appearance="primary"
              onClick={() =>
                onValidate({
                  groupId,
                  firstName,
                  name,
                  lastName,
                  birthDate,
                  baptismDate,
                  onHide: props.onHide,
                  setError,
                })
              }
            >
              Ajouter
            </Button>
            <Button appearance="subtle" onClick={props.onHide}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalTransition>
      )}
    </Modal>
  );
}

const onValidate = (params: ValidationParams) => {
  if (
    !!params.name &&
    !!params.firstName &&
    !!params.birthDate
  ) {

    const publisher = {
      firstName: params.firstName,
      name: params.name,
      lastName: params.lastName,
      birthDate: Timestamp.fromDate(new Date(params.birthDate)),
      groupId: params.groupId || 'unafiliated',
    } as any;

    if (params.baptismDate) {
      publisher.baptismDate = Timestamp.fromDate(new Date(params.baptismDate));
    }
    Publishers.create(publisher)
      .then(() => {
        params.onHide();
      })
      .catch((error: any) => {
        params.setError(error?.message);
      });
  } else {
    params.setError(
      'Le formulaire contient des erreurs. Veuillez les corriger avant de continuer.'
    );
  }
};

const getGroupName = (groupId: string, groups: Group[]) => {
  return groups.find((group) => group.id === groupId)?.name || 'Non affilié';
};
