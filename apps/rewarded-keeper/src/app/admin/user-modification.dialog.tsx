import { getGroupName, Publisher, User } from '../types';
import { ModalTransition } from '@atlaskit/modal-dialog';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button';
import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, Users } from '../data';
import { useState } from 'react';
import './user-modification.dialog.scss';
import { getPublisherName } from '../content-panel/util';

interface Props {
  user: User;
  onClose: () => void;
}

export function UserModificationDialog(props: Props) {
  const { groups, publishers } = useSelector(
    (state: GlobalState) => ({
      groups: state.groups.groups,
      publishers: state.publishers.publishers,
    }),
    shallowEqual
  );
  const [isLoading, setIsloading] = useState(false);
  const [user, setUser] = useState<User>({ ...props.user });

  return (
    <Modal onClose={props.onClose}>
      <ModalTransition>
        <ModalHeader>
          <ModalTitle>{user.displayName} | Modification</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Administrateur</Form.Label>
              <Form.Check
                checked={user.admin}
                onChange={(e) => {
                  setUser({ ...user, admin: e.target.checked });
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Validé</Form.Label>
              <Form.Check
                checked={user.validated}
                onChange={(e) => {
                  setUser({ ...user, validated: e.target.checked });
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Groupe</Form.Label>
              <DropdownButton
                title={getGroupName(user.groupId || 'unafiliated', groups)}
                disabled={isLoading}
                onSelect={(v) => {
                  if (v) {
                    setUser({
                      ...user,
                      groupId: groups[Number(v)].id || 'unafiliated',
                    });
                  }
                }}
              >
                {groups.map((group, index) => (
                  <Dropdown.Item key={group.id} eventKey={index}>
                    {' '}
                    {group.name}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Proclamateur</Form.Label>
              <DropdownButton
                title={getPublisherFullName(
                  user.publisherId || 'unassociated',
                  publishers
                )}
                disabled={isLoading}
                onSelect={(v) => {
                  if (v) {
                    setUser({
                      ...user,
                      publisherId: publishers[Number(v)].id || 'unassociated',
                    });
                  }
                }}
              >
                {publishers.map((pub, index) => (
                  <Dropdown.Item key={pub.id} eventKey={index}>
                    {' '}
                    {getPublisherName(pub)}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </Form.Group>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            appearance={'primary'}
            onClick={async () => {
              setIsloading(true);

              await Users.update({
                ...user,
              });

              setIsloading(false);
              props.onClose();
            }}
          >
            Confirmer
          </Button>
          <Button appearance="subtle" onClick={() => props.onClose()}>
            Anuller
          </Button>
        </ModalFooter>
      </ModalTransition>
    </Modal>
  );
}

function getPublisherFullName(
  publisherId: string,
  publishers: Publisher[]
): string {
  return getPublisherName(publishers.find((p) => p.id === publisherId));
}
