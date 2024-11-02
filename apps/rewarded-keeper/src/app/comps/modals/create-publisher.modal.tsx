import './create-publisher.modal.scss';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { Fragment, useState } from 'react';
import { Publisher } from '../../types';
import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button';
import { NewPublisherReason, Publishers } from '../../data/publishers';
import { token } from '@atlaskit/tokens';
import AtlaskitForm, { ErrorMessage, Field, FormSection } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import DropdownMenu, { DropdownItem } from '@atlaskit/dropdown-menu';
import { GroupDropdownMenu } from '../group-dropdown.menu';
import { MessageBar } from '@fluentui/react-components';

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
  const [isReasonDropdownOpen, setIsReasonDropdownOpen] = useState(false);

  return (
    <Modal shouldCloseOnEscapePress={true} onClose={props.onHide}>
      {props.show && (
        <ModalTransition>
          <ModalHeader>
            <ModalTitle>Créer un proclamateur</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {error && <MessageBar intent="error">{error}</MessageBar>}
            <AtlaskitForm<Publisher> onSubmit={(data) => false}>
              {({ formProps, submitting }) => (
                <form {...formProps}>
                  <FormSection>
                    <Field
                      aria-required={true}
                      name="firstName"
                      label="Prénom"
                      isRequired
                      defaultValue="">
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextField
                            autoComplete="off"
                            autoFocus={true}
                            {...fieldProps}
                            value={firstName}
                            onChange={(e) => {
                              setFirstName((e as any).target.value);
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
                      name="middleName"
                      label="Nom"
                      isRequired
                      defaultValue="">
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextField
                            autoComplete="off"
                            {...fieldProps}
                            value={name}
                            onChange={(e) => {
                              setName((e as any).target.value);
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
                      name="lastName"
                      label="Postnom"
                      defaultValue="">
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextField
                            autoComplete="off"
                            {...fieldProps}
                            value={lastName}
                            onChange={(e) => {
                              setLastName((e as any).target.value);
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
                      name="group"
                      label="Groupe"
                      defaultValue="unafiliated">
                      {({ fieldProps, error }) => (
                        <GroupDropdownMenu
                          {...fieldProps}
                          onChange={(value: string) => setGroupId(value)}
                          value={groupId}
                        />
                      )}
                    </Field>

                    <Field
                      aria-required={true}
                      name="reason"
                      label="Raison"
                      defaultValue="">
                      {({ fieldProps, error }) => (
                        <DropdownMenu
                          isOpen={isReasonDropdownOpen}
                          trigger={({ triggerRef, ...triggerProps }) => (
                            <div {...(fieldProps as any)}>
                              <Button
                                ref={triggerRef}
                                {...triggerProps}
                                onClick={() =>
                                  setIsReasonDropdownOpen(!isReasonDropdownOpen)
                                }>
                                {reason === null
                                  ? 'Raison'
                                  : getReasonText(reason)}
                              </Button>
                            </div>
                          )}>
                          <DropdownItem
                            onClick={() => {
                              setReason(NewPublisherReason.New);
                              setIsReasonDropdownOpen(false);
                            }}>
                            <span style={{ color: token('color.text') }}>
                              {getReasonText(NewPublisherReason.New)}
                            </span>
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => {
                              setReason(NewPublisherReason.Transferred);
                              setIsReasonDropdownOpen(false);
                            }}>
                            <span style={{ color: token('color.text') }}>
                              {getReasonText(NewPublisherReason.Transferred)}
                            </span>
                          </DropdownItem>
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
                }}>
                Ajouter
              </LoadingButton>
              <Button
                isDisabled={isLoading}
                appearance="subtle"
                onClick={props.onHide}>
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
    'Le formulaire contient des erreurs. Veuillez les corriger avant de continuer.',
  );
  return Promise.resolve();
};

function getReasonText(reason: NewPublisherReason): string {
  return reason === NewPublisherReason.New
    ? 'Nommé proclamateur'
    : "Venu d'ailleur";
}
