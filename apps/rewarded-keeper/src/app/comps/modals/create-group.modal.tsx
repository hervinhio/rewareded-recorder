import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { Fragment, useState } from 'react';
import { Groups } from '../../data/groups';
import { Group, Publisher } from '../../types';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../../data';
import AtlaskitForm, { ErrorMessage, Field, FormSection } from '@atlaskit/form';
import { token } from '@atlaskit/tokens';
import TextField from '@atlaskit/textfield';
import DropdownMenu, { DropdownItem } from '@atlaskit/dropdown-menu';
import { MessageBar } from '@fluentui/react-components';

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
    props.group?.overseerId || '',
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isElderDropdownOpen, setIsElderDropdownOpen] = useState(false);
  const elders = useSelector(
    (state: GlobalState) =>
      state.publishers.publishers.filter((p) => p.isElder),
    shallowEqual,
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
          {error && <MessageBar intent="error">{error}</MessageBar>}
          <AtlaskitForm<Group> onSubmit={(data) => false}>
            {({ formProps, submitting }) => (
              <form {...formProps}>
                <FormSection>
                  <Field
                    aria-required={true}
                    name="name"
                    label="Nom"
                    isRequired
                    defaultValue=""
                  >
                    {({ fieldProps, error }) => (
                      <Fragment>
                        <TextField
                          autoComplete="off"
                          autoFocus={true}
                          {...fieldProps}
                          value={groupName}
                          onChange={(e) => {
                            setGroupName((e as any).target.value);
                            if (!props.group) {
                              setGroupId(groupName.replace(' ', '-'));
                            }
                          }}
                        />
                        {error && (
                          <ErrorMessage>
                            Ce champ ne peut être vide.
                          </ErrorMessage>
                        )}
                      </Fragment>
                    )}
                  </Field>

                  <Field
                    aria-required={true}
                    name="elder"
                    label="Responsable"
                    defaultValue=""
                  >
                    {({ fieldProps, error }) => (
                      <DropdownMenu
                        isOpen={isElderDropdownOpen}
                        trigger={({ triggerRef, ...triggerProps }) => (
                          <div {...(fieldProps as any)}>
                            <Button
                              ref={triggerRef}
                              {...triggerProps}
                              onClick={() =>
                                setIsElderDropdownOpen(!isElderDropdownOpen)
                              }
                            >
                              {pickElderName(groupOverseerId, elders)}
                            </Button>
                          </div>
                        )}
                      >
                        {elders.map((elder) => (
                          <DropdownItem
                            onClick={() => {
                              setGroupOverseerId(elder.id || null);
                              setIsElderDropdownOpen(false);
                            }}
                          >
                            <span style={{ color: token('color.text') }}>
                              {getElderFullName(elder)}
                            </span>
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    )}
                  </Field>
                </FormSection>
              </form>
            )}
          </AtlaskitForm>
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
    'Le formulaire contient des erreurs. Veuillez les corriger avant de continuer.',
  );
  return Promise.resolve();
};

function pickElderName(id: string | null, elders: Publisher[]): string {
  if (id === null) {
    return 'Aucun';
  }

  const elder = elders.find((e) => e.id === id);

  if (elder) {
    return getElderFullName(elder);
  }

  return 'Aucun';
}
