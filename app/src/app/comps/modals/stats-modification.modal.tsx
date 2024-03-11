import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { Stats } from '../../data';
import Button, { ButtonGroup } from '@atlaskit/button';
import { Fragment, useState } from 'react';
import AtlaskitForm, { ErrorMessage, Field, FormSection } from '@atlaskit/form';
import { token } from '@atlaskit/tokens';
import TextField from '@atlaskit/textfield';

interface Props {
  stats: Stats;
  onClose: (stats?: Stats) => void;
}

export function StatsModificationDialog({ stats, onClose }: Props) {
  const [underRestrictions, setUnderRestriction] = useState<number | undefined>(
    stats.underRestrictions
  );
  const [baptized, setBaptized] = useState<number | undefined>(stats.baptized);
  const [blamed, setBlamed] = useState<number | undefined>(stats.blamed);
  const [families, setFamilies] = useState<number | undefined>(stats.families);

  return (
    <Modal shouldCloseOnEscapePress={true}>
      <ModalTransition>
        <ModalHeader>
          <ModalTitle>Mise à jour des stats</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <AtlaskitForm<Stats> onSubmit={(data) => false}>
            {({ formProps, submitting }) => (
              <form
                {...formProps}
                style={{
                  backgroundColor: token('elevation.surface.overlay'),
                }}
              >
                <FormSection>
                  <Field
                    aria-required={true}
                    name="blamished"
                    label="Blâmés"
                    isRequired
                    defaultValue=""
                  >
                    {({ fieldProps, error }) => (
                      <Fragment>
                        <TextField
                          type="number"
                          autoComplete="off"
                          autoFocus={true}
                          {...fieldProps}
                          value={blamed}
                          onChange={(e) => {
                            if ((e.target as any).value) {
                              setBlamed(Number((e.target as any).value) || 0);
                            } else {
                              setBlamed(undefined);
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
                    name="restricted"
                    label="Sous restrictions"
                    isRequired
                    defaultValue=""
                  >
                    {({ fieldProps, error }) => (
                      <Fragment>
                        <TextField
                          type="number"
                          autoComplete="off"
                          autoFocus={true}
                          {...fieldProps}
                          value={underRestrictions}
                          onChange={(e: any) => {
                            if (e.target.value) {
                              setUnderRestriction(
                                Number((e.target as any).value) || 0
                              );
                            } else {
                              setUnderRestriction(undefined);
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
                    name="baptized"
                    label="Baptisés"
                    isRequired
                    defaultValue=""
                  >
                    {({ fieldProps, error }) => (
                      <Fragment>
                        <TextField
                          type="number"
                          autoComplete="off"
                          autoFocus={true}
                          {...fieldProps}
                          value={baptized}
                          onChange={(e: any) => {
                            if (e.target.value) {
                              setBaptized(Number((e.target as any).value) || 0);
                            } else {
                              setBaptized(undefined);
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
                    name="families"
                    label="Familles"
                    isRequired
                    defaultValue=""
                  >
                    {({ fieldProps, error }) => (
                      <Fragment>
                        <TextField
                          type="number"
                          autoComplete="off"
                          autoFocus={true}
                          {...fieldProps}
                          value={families}
                          onChange={(e: any) => {
                            if (e.target.value) {
                              setFamilies(Number((e.target as any).value) || 0);
                            } else {
                              setFamilies(undefined);
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
                </FormSection>
              </form>
            )}
          </AtlaskitForm>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button
              appearance="primary"
              onClick={() =>
                onClose({
                  ...stats,
                  underRestrictions: underRestrictions || 0,
                  baptized: baptized || 0,
                  blamed: blamed || 0,
                  families: families || 0,
                })
              }
            >
              Valider
            </Button>
            <Button appearance="subtle" onClick={() => onClose()}>
              Annuler
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalTransition>
    </Modal>
  );
}
