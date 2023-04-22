import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button';
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
import { Group, Publisher } from '../../types';
import { MovingTrainIcon } from '..';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../../data';
import { nanoid } from '@reduxjs/toolkit';
import SectionMessage from '@atlaskit/section-message';

export interface CreateGroupModalProps {
  show: boolean;
  group?: Group;
  onHide: () => void;
}

interface ValidationParams {
  groupName: string;
  groupId: string;
  groupOverseerId: string | null;
  isCreating: boolean;
  onHide: () => void;
  setError: (error: any) => void;
}

export const CreateGroupModal = (props: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState<string>(props.group?.name || '');
  const [groupId, setGroupId] = useState<string>(props.group?.id || '');
  const [groupOverseerId, setGroupOverseerId] = useState<string | null>(
    props.group?.overseerId || ''
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const elders = useSelector(
    (state: GlobalState) =>
      state.publishers.publishers.filter((p) => p.isElder),
    shallowEqual
  );

  if (!props.show) return null;

  return (
    <Modal shouldCloseOnEscapePress={true}>
      <ModalTransition>
        <ModalHeader>
          {!props.group && <ModalTitle>Ajouter un groupe</ModalTitle>}
          {!!props.group && <ModalTitle>Modifier un groupe</ModalTitle>}
        </ModalHeader>
        <ModalBody>
          <Form>
            {error && (
              <SectionMessage appearance="error">{error}</SectionMessage>
            )}
            {isLoading && <MovingTrainIcon />}
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Nom du groupe</Form.Label>
              <Form.Control
                type="text"
                placeholder="Groupe Tel"
                disabled={isLoading}
                value={groupName}
                required={true}
                onChange={(e) => {
                  setGroupName(e.target.value);

                  if (!props.group) {
                    setGroupId(e.target.value.replace(/ /g, '-').trim());
                  }
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Responsable</Form.Label>
              <Form.Select
                disabled={isLoading}
                value={groupOverseerId || ''}
                onChange={(event) => {
                  if (event.target.value === 'none') {
                    setGroupOverseerId(null);
                  } else {
                    setGroupOverseerId(event.target.value);
                  }
                }}
              >
                <option key={nanoid()} value={'none'}>
                  Aucun
                </option>
                {elders.map((elder) => (
                  <option
                    key={elder.id}
                    value={elder.id}
                    selected={groupOverseerId === elder.id}
                  >
                    {getElderFullName(elder)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
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
                  isCreating: !!props.group,
                }).finally(() => setIsLoading(false));
              }}
            >
              {!props.group && 'Ajouter'}
              {!!props.group && 'Modifier'}
            </LoadingButton>
            <Button
              appearance="subtle"
              onClick={props.onHide}
              isDisabled={isLoading}
            >
              Annuler
            </Button>
          </ButtonGroup>
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
    return !params.isCreating
      ? Groups.create({
          id: params.groupId,
          overseerId: params.groupOverseerId || '',
          name: params.groupName,
        })
          .then(() => {
            params.onHide();
          })
          .catch((error: any) => {
            params.setError(error?.message);
          })
      : Groups.update({
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
