import './publisher-modification-view.scss';
import { Publisher, Group } from '../types';
import { Publishers } from '../data';
import { Fragment, useState } from 'react';
import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button';
import { MultiMonthsSelector } from '../comps';
import { Flags } from '../data/flags';
import AtlaskitForm, {
  CheckboxField,
  ErrorMessage,
  Field,
  FormSection,
} from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { Checkbox } from '@atlaskit/checkbox';
import { GroupDropdownMenu } from '../comps/group-dropdown.menu';

interface ChangeMap {
  isBulk: boolean;
  [property: string]: any;
}

interface Props {
  publisher: Publisher;
  publishers?: Publisher[];
  groupId?: string;
  onHide: () => void;
}

export function PublisherModificationView(props: Props) {
  const isBulkEdit = (props.publishers?.length || 0) > 0;
  const [isLoading, setIsLoading] = useState(false);
  const initialChange = isBulkEdit
    ? { isBulk: true }
    : { isBulk: false, ...props.publisher };
  const [change, setChange] = useState<ChangeMap>(initialChange);
  const groupId = isBulkEdit
    ? props.publishers?.[0].groupId
    : props.publisher.groupId;

  return (
    <AtlaskitForm<Publisher> onSubmit={(data) => false}>
      {({ formProps, submitting }) => (
        <form {...formProps}>
          <h4>Modification du proclamateur</h4>
          <FormSection title="Identité">
            <Field
              aria-required={true}
              name="firstName"
              label="Prénom"
              isRequired
              defaultValue=""
            >
              {({ fieldProps, error }) => (
                <Fragment>
                  <TextField
                    autoComplete="off"
                    autoFocus={true}
                    {...fieldProps}
                    isDisabled={isLoading || isBulkEdit}
                    value={isBulkEdit ? '(Many)' : change.firstName}
                    onChange={(e) => {
                      setChange({
                        ...change,
                        firstName: (e.target as any).value,
                      });
                    }}
                  />
                  {error && (
                    <ErrorMessage>Ce champ ne peut être vide.</ErrorMessage>
                  )}
                </Fragment>
              )}
            </Field>

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
                    {...fieldProps}
                    isDisabled={isLoading || isBulkEdit}
                    value={isBulkEdit ? '(Many)' : change.name}
                    onChange={(e) => {
                      setChange({ ...change, name: (e.target as any).value });
                    }}
                  />
                  {error && (
                    <ErrorMessage>Ce champ ne peut être vide.</ErrorMessage>
                  )}
                </Fragment>
              )}
            </Field>

            <Field
              aria-required={true}
              name="lastName"
              label="Postnom"
              isRequired
              defaultValue=""
            >
              {({ fieldProps, error }) => (
                <Fragment>
                  <TextField
                    autoComplete="off"
                    {...fieldProps}
                    isDisabled={isLoading || isBulkEdit}
                    value={isBulkEdit ? '(Many)' : change.lastName}
                    onChange={(e) => {
                      setChange({
                        ...change,
                        lastName: (e.target as any).value,
                      });
                    }}
                  />
                  {error && (
                    <ErrorMessage>Ce champ ne peut être vide.</ErrorMessage>
                  )}
                </Fragment>
              )}
            </Field>
          </FormSection>

          <FormSection title="Contact">
            <Field
              aria-required={true}
              name="address"
              label="Addresse"
              isRequired
              defaultValue=""
            >
              {({ fieldProps, error }) => (
                <Fragment>
                  <TextField
                    autoComplete="off"
                    {...fieldProps}
                    type="address"
                    isDisabled={isLoading || isBulkEdit}
                    value={isBulkEdit ? '(Many)' : change.address}
                    onChange={(e) => {
                      setChange({
                        ...change,
                        address: (e.target as any).value,
                      });
                    }}
                  />
                  {error && (
                    <ErrorMessage>Ce champ ne peut être vide.</ErrorMessage>
                  )}
                </Fragment>
              )}
            </Field>

            <Field
              aria-required={true}
              name="telephone"
              label="N° téléphone"
              isRequired
              defaultValue=""
            >
              {({ fieldProps, error }) => (
                <Fragment>
                  <TextField
                    autoComplete="off"
                    {...fieldProps}
                    isDisabled={isLoading || isBulkEdit}
                    type="tel"
                    value={isBulkEdit ? '(Many)' : change.telephone}
                    onChange={(e) => {
                      setChange({
                        ...change,
                        telephone: (e.target as any).value,
                      });
                    }}
                  />
                  {error && (
                    <ErrorMessage>Ce champ ne peut être vide.</ErrorMessage>
                  )}
                </Fragment>
              )}
            </Field>

            <Field
              aria-required={true}
              name="telephone"
              label="N° téléphone de secours"
              isRequired
              defaultValue=""
            >
              {({ fieldProps, error }) => (
                <Fragment>
                  <TextField
                    autoComplete="off"
                    {...fieldProps}
                    isDisabled={isLoading || isBulkEdit}
                    type="tel"
                    value={isBulkEdit ? '(Many)' : change.emergencyPhone}
                    onChange={(e) => {
                      setChange({
                        ...change,
                        emergencyPhone: (e.target as any).value,
                      });
                    }}
                  />
                  {error && (
                    <ErrorMessage>Ce champ ne peut être vide.</ErrorMessage>
                  )}
                </Fragment>
              )}
            </Field>

            <Field
              aria-required={true}
              name="email"
              label="Addresse email"
              isRequired
              defaultValue=""
            >
              {({ fieldProps, error }) => (
                <Fragment>
                  <TextField
                    autoComplete="off"
                    {...fieldProps}
                    isDisabled={isLoading || isBulkEdit}
                    type="tel"
                    value={isBulkEdit ? '(Many)' : change.emailAddress}
                    onChange={(e) => {
                      setChange({
                        ...change,
                        emailAddress: (e.target as any).value,
                      });
                    }}
                  />
                  {error && (
                    <ErrorMessage>Ce champ ne peut être vide.</ErrorMessage>
                  )}
                </Fragment>
              )}
            </Field>
          </FormSection>

          <FormSection title="Attributions">
            <CheckboxField name="isElder" label="Ancien">
              {({ fieldProps }) => (
                <Checkbox
                  {...fieldProps}
                  isChecked={isBulkEdit ? false : change.isElder}
                  label="Ancien ?"
                  onChange={(e) =>
                    setChange({
                      ...change,
                      isElder: e.target.checked,
                    })
                  }
                />
              )}
            </CheckboxField>

            <CheckboxField name="isRegularPioneer" label="Pionnier permanent">
              {({ fieldProps }) => (
                <Checkbox
                  {...fieldProps}
                  isChecked={isBulkEdit ? false : change.isRegularPioneer}
                  label="Pionnier permanent ?"
                  onChange={(e) =>
                    setChange({
                      ...change,
                      isRegularPioneer: e.target.checked,
                    })
                  }
                />
              )}
            </CheckboxField>

            <CheckboxField
              name="isRegularPioneer"
              label="Pionnier auxiliare à durée indéterminée"
            >
              {({ fieldProps }) => (
                <Checkbox
                  {...fieldProps}
                  isChecked={
                    isBulkEdit ? false : change.isPermanentAuxilaryPioneer
                  }
                  label="Pionnier auxiliaire à durée indeterminée ?"
                  onChange={(e) =>
                    setChange({
                      ...change,
                      isPermanentAuxilaryPioneer: e.target.checked,
                    })
                  }
                />
              )}
            </CheckboxField>

            {!isBulkEdit && (
              <Field
                aria-required={true}
                name="Pionnier auxiliaire pour"
                label="Mois"
              >
                {({ fieldProps, error }) => (
                  <div {...(fieldProps as any)}>
                    <MultiMonthsSelector
                      disabled={change.isPermanentAuxilaryPioneer}
                      onValueChange={(value) => {
                        setChange({ ...change, auxilaryPionierFor: value });
                      }}
                      value={change.auxilaryPionierFor || []}
                    />
                  </div>
                )}
              </Field>
            )}
          </FormSection>

          <FormSection title="Liens">
            <Field
              aria-required={true}
              name="group"
              label="Groupe"
              defaultValue="unafiliated"
            >
              {({ fieldProps, error }) => (
                <GroupDropdownMenu
                  {...fieldProps}
                  onChange={(value: string) =>
                    setChange({ ...change, groupId: value || 'unafiliated' })
                  }
                  value={groupId}
                />
              )}
            </Field>
          </FormSection>

          <FormSection>
            <ButtonGroup>
              <LoadingButton
                appearance="primary"
                isLoading={isLoading}
                onClick={() => {
                  setIsLoading(true);
                  savePublisher(
                    props.publishers,
                    change,
                    groupId,
                    props.onHide
                  ).finally(() => setIsLoading(false));
                }}
                isDisabled={isLoading}
              >
                Enregistrer
              </LoadingButton>
              <Button
                appearance="subtle"
                onClick={() => props.onHide()}
                isDisabled={isLoading}
              >
                Annuler
              </Button>
            </ButtonGroup>
          </FormSection>
        </form>
      )}
    </AtlaskitForm>
  );
}

function savePublisher(
  publishers: Publisher[] = [],
  change: ChangeMap,
  groupId: string | undefined,
  onHide: () => void
) {
  if (change.isBulk) {
    return Publishers.transferToGroup(
      publishers || [],
      change.groupId,
      false,
      groupId || ''
    )
      .then(() => {
        onHide();
      })
      .catch(Flags.raiseError);
  }

  return Publishers.save(change as unknown as Publisher)
    .then(() => {
      onHide();
    })
    .catch(Flags.raiseError);
}

function getGroupName(groupId: string, groups: Group[]) {
  return groups.find((group) => group.id === groupId)?.name || 'Non affilié';
}
