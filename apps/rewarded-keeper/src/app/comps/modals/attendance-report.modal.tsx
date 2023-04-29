import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { MovingTrainIcon } from '..';
import { Fragment, useState } from 'react';
import { AttendanceRecord, AttendanceRecords } from '../../data';
import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button';
import { FirebaseError } from 'firebase/app';
import SectionMessage from '@atlaskit/section-message';
import { Timestamp } from 'firebase/firestore';
import AtlaskitForm, {
  CheckboxField,
  ErrorMessage,
  Field,
  FormSection,
  HelperMessage,
} from '@atlaskit/form';
import { DateTimePicker } from '@atlaskit/datetime-picker';
import { Checkbox } from '@atlaskit/checkbox';
import TextField from '@atlaskit/textfield';
import { token } from '@atlaskit/tokens';

interface Props {
  show: boolean;
  mode: 'edit' | 'create';
  record?: AttendanceRecord;
  onHide: () => void;
}

export function AttendanceReportModal(props: Props) {
  const now = new Date();
  now.setHours(1, 0, 0, 0);

  const initialState = {
    date: Timestamp.fromDate(now),
    monthId: `${now.getFullYear()}#${now.getMonth()}`,
    isMidweekMeeting: false,
  };
  const [error, setError] = useState<
    Error | FirebaseError | unknown | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [record, _setRecord] = useState<AttendanceRecord>(
    props.record || initialState
  );
  const [dateHasError, setDateHasError] = useState(false);

  if (!props.show) return null;

  const setRecord = (record: AttendanceRecord) => {
    _setRecord(record);
    setError(undefined);
  };

  const save = async () => {
    setIsLoading(true);
    try {
      validateRecord(record);

      if (
        props.mode === 'create' &&
        (await AttendanceRecords.existsForDate(record.date))
      ) {
        throw new Error('Un rapport existe déjà pour la date séléctionnée');
      }

      const promise$ =
        props.mode === 'edit'
          ? AttendanceRecords.update(record)
          : AttendanceRecords.create(record);
      await promise$;
      props.onHide();
    } catch (e: unknown) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal shouldCloseOnEscapePress={true} onClose={props.onHide}>
      <ModalTransition
        css={{ backgroundColor: token('elevation.surface.overlay') }}
      >
        <ModalHeader>
          <ModalTitle>
            {' '}
            {props.mode === 'edit' ? 'Modifier' : 'Créer'} un rapport
            d'assitance
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          {!!error && (
            <SectionMessage appearance="error">
              <p>{error.toString()}</p>
            </SectionMessage>
          )}
          {isLoading && <MovingTrainIcon />}
          <AtlaskitForm<Omit<AttendanceRecord, 'id,monthId'>>
            onSubmit={(data) => false}
          >
            {({ formProps, submitting }) => (
              <form
                {...formProps}
                style={{ backgroundColor: token('elevation.surface.overlay') }}
              >
                <FormSection>
                  <Field
                    aria-required={true}
                    name="date"
                    label="date"
                    isRequired
                  >
                    {({ fieldProps, error }) => (
                      <Fragment>
                        <DateTimePicker
                          {...fieldProps}
                          locale="fr-FR"
                          dateFormat="DD-MM-YYYY"
                          timeIsEditable={false}
                          autoFocus={false}
                          timePickerProps={{
                            isDisabled: true,
                          }}
                          value={record.date.toDate().toISOString()}
                          onChange={async (value) => {
                            setDateHasError(false);
                            const newDate = new Date(value);
                            setRecord({
                              ...record,
                              date: Timestamp.fromDate(newDate),
                              monthId: `${newDate.getFullYear()}#${newDate.getMonth()}`,
                            });

                            if (
                              props.mode === 'create' &&
                              (await thereAreRecordsOnDate(newDate))
                            ) {
                              setDateHasError(true);
                            }
                          }}
                        />
                        {!dateHasError && (
                          <HelperMessage>La date de la réunion.</HelperMessage>
                        )}
                        {dateHasError && (
                          <ErrorMessage>
                            Un enregistrement existe déjà pour ce jour.
                          </ErrorMessage>
                        )}
                      </Fragment>
                    )}
                  </Field>

                  <CheckboxField
                    name="isMidweekMeeting"
                    label="Type de réunion"
                  >
                    {({ fieldProps }) => (
                      <Checkbox
                        {...fieldProps}
                        isChecked={record.isMidweekMeeting}
                        label="Réunion de semaine ?"
                        onChange={(event) =>
                          setRecord({
                            ...record,
                            isMidweekMeeting: event.target.checked,
                          })
                        }
                      />
                    )}
                  </CheckboxField>
                </FormSection>

                <Field
                  aria-required={true}
                  name="inPerson"
                  label="En présentiel"
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
                        value={record.inPerson}
                        onChange={(e) => {
                          if ((e as any).target.value) {
                            setRecord({
                              ...record,
                              inPerson: Number((e as any).target.value),
                            });
                          } else {
                            setRecord({ ...record, inPerson: undefined });
                          }
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
                  name="inPerson"
                  label="Sur zoom"
                  isRequired
                  defaultValue=""
                >
                  {({ fieldProps, error }) => (
                    <Fragment>
                      <TextField
                        type="number"
                        autoComplete="off"
                        {...fieldProps}
                        value={record.zoom}
                        onChange={(e) => {
                          if ((e as any).target.value) {
                            setRecord({
                              ...record,
                              zoom: Number((e as any).target.value),
                            });
                          } else {
                            setRecord({ ...record, zoom: undefined });
                          }
                        }}
                      />
                      {error && (
                        <ErrorMessage>Ce champ ne peut être vide.</ErrorMessage>
                      )}
                    </Fragment>
                  )}
                </Field>
              </form>
            )}
          </AtlaskitForm>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <LoadingButton
              isLoading={isLoading}
              appearance="primary"
              onClick={save}
            >
              Sauvegarder
            </LoadingButton>
            <Button appearance="subtle" onClick={() => props.onHide()}>
              Annuler
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalTransition>
    </Modal>
  );
}

function validateRecord(record: AttendanceRecord) {
  if (!record.date || !record.monthId) {
    throw new Error('Vous devez définir la date');
  }

  if ((record.inPerson || 0) + (record.zoom || 0) === 0) {
    throw new Error("L'assistance ne peut être nulle");
  }
}

async function thereAreRecordsOnDate(date: Date): Promise<boolean> {
  return await AttendanceRecords.existsForDate(Timestamp.fromDate(date));
}
