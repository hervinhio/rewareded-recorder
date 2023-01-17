import Banner from '@atlaskit/banner';
import Button, { LoadingButton } from '@atlaskit/button';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { Groups } from '../../data/groups';
import { Events, Publisher } from '../../types';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import { MovingTrainIcon } from '..';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../../data';

export interface CreateGroupModalProps {
  show: boolean;
  onHide: () => void;
}

interface ValidationParams {
  groupName: string;
  groupId: string;
  groupOverseerId: string | null;
  onHide: () => void;
  setError: (error: any) => void;
}

export const CreateGroupModal = (props: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState<string>('');
  const [groupId, setGroupId] = useState<string>('');
  const [groupOverseerId, setGroupOverseerId] = useState<string | null>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const elders = useSelector(
    (state: GlobalState) =>
      state.publishers.publishers.filter((p) => p.isElder),
    shallowEqual
  );

  return (
    <Modal shouldCloseOnEscapePress={true}>
      <ModalTransition>
        <ModalHeader>
          <ModalTitle>Ajouter un groupe</ModalTitle>
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
              <Form.Label>Nom du groupe</Form.Label>
              <Form.Control
                type="text"
                placeholder="John Doe"
                disabled={isLoading}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setGroupId(e.target.value.replace(/ /g, '-').trim());
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Responsable</Form.Label>
              <Form.Select
                disabled={isLoading}
                onChange={(event) => {
                  if (event.target.value === 'none') {
                    setGroupOverseerId(null);
                  } else {
                    setGroupOverseerId(
                      elders[Number(event.target.value)].id || ''
                    );
                  }
                }}
              >
                <option key={-1} value={'none'}>
                  Aucun
                </option>
                {elders.map((elder, index) => (
                  <option key={index} value={index}>
                    {getElderFullName(elder)}
                  </option>
                ))}
              </Form.Select>
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
                groupOverseerId,
                groupName,
                onHide: props.onHide,
                setError,
              }).finally(() => setIsLoading(false));
            }}
          >
            Ajouter
          </LoadingButton>
          <Button
            appearance="subtle"
            onClick={props.onHide}
            isDisabled={isLoading}
          >
            Fermer
          </Button>
        </ModalFooter>
      </ModalTransition>
    </Modal>
  );
};

const getElderFullName = (elder: Publisher) => {
  return (elder.name + ' ' + elder.lastName + ' ' + elder.firstName).trim();
};

const onValidate = (params: ValidationParams) => {
  if (!!params.groupName && !!params.groupOverseerId) {
    return Groups.create({
      id: params.groupId,
      overseerId: params.groupOverseerId || '',
      name: params.groupName,
    })
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
