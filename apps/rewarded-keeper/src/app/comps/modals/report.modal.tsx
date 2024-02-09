import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import AtlaskitForm, {
  CheckboxField,
  ErrorMessage,
  Field,
  FormSection,
} from '@atlaskit/form';
import { Fragment, useState } from 'react';
import { Month, Publisher, Report, isPecialPublisher } from '../../types';
import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button';
import { MonthSelector } from '../../header/month-selector';
import { GlobalState, Reports } from '../../data';
import { getPublisherName } from '../../content-panel/util';
import { shallowEqual, useSelector } from 'react-redux';
import SectionMessage from '@atlaskit/section-message';
import { token } from '@atlaskit/tokens';
import { Checkbox } from '@atlaskit/checkbox';
import DropdownMenu, { DropdownItem } from '@atlaskit/dropdown-menu';
import TextField from '@atlaskit/textfield';
import Textarea from '@atlaskit/textarea';

interface Props {
  publisherId: string | undefined;
  report?: Report | undefined;
  show: boolean;
  onHide: (created: boolean) => void;
}

interface ValidationParams {
  hours: number | undefined;
  courses: number | undefined;
  comment: string | undefined;
  month: Month | undefined;
  publisherId: string | undefined;
  isFirstReport: boolean;
  active?: boolean;
  isEditMode: boolean;
  report?: Report;
  shouldHaveHours: boolean;
  onHide: (created: boolean) => void;
  setError: (error: any) => void;
  reports: Report[];
}

export function ReportModal(props: Props) {
  const defaultMonth = props.report
    ? Month.fromKey(props.report.monthId)
    : undefined;
  const [error, setError] = useState('');
  const [hours, setHours] = useState(props.report?.hours);
  const [courses, setCourses] = useState(props.report?.courses);
  const [isFirstReport, setIsFirstReport] = useState(
    props.report?.isFirstReport || false
  );
  const [hasPreached, setHasPreached] = useState<boolean>(
    props.report?.active || false
  );
  const [selectedPublisherId, setSelectedPublisherId] = useState<
    string | undefined
  >(props.publisherId);
  const [comment, setComment] = useState<string | undefined>(
    props.report?.comment
  );
  const { publishers, publisher, reports } = useSelector(
    (state: GlobalState) => ({
      publishers: state.publishers.publishers,
      publisher: state.publishers.publishers.find(
        (p) => p.id === props.publisherId
      ),
      reports: state.reports.byPublisher[props.publisherId || ''] || [],
    }),
    shallowEqual
  );
  const [isPubDropdownOpen, setIsPubDropdownOpen] = useState(false);
  const [month, setMonth] = useState<Month | undefined>(defaultMonth);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!props.report;
  const shouldShowModal = props.show;
  const showRequestHoursCount = isPecialPublisher(publisher, month);

  const submit = () => {
    if (isLoading) return;
    setIsLoading(true);
    onValidate({
      courses,
      comment,
      hours,
      publisherId: props.publisherId || selectedPublisherId,
      month,
      isFirstReport,
      active: hasPreached,
      isEditMode,
      shouldHaveHours: showRequestHoursCount || false,
      report: props.report,
      onHide: props.onHide,
      setError,
      reports,
    })
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal shouldCloseOnEscapePress={true} onClose={() => props.onHide(false)}>
      {shouldShowModal && (
        <ModalTransition>
          <ModalHeader>
            <ModalTitle>Enregistrer un rapport</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {error && (
              <SectionMessage appearance="error">
                {error.toString()}
              </SectionMessage>
            )}
            <AtlaskitForm<Report> onSubmit={(data) => false}>
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
                      name="month"
                      label="Mois"
                      defaultValue=""
                    >
                      {({ fieldProps, error }) => (
                        <div {...(fieldProps as any)}>
                          <MonthSelector
                            selectedMonth={month}
                            disabled={isLoading}
                            onMonthSelected={(month: Month | undefined) => {
                              setMonth(month);
                            }}
                          />
                        </div>
                      )}
                    </Field>

                    <CheckboxField name="reportType" label="Type de rapport">
                      {({ fieldProps }) => (
                        <Checkbox
                          {...fieldProps}
                          isChecked={isFirstReport}
                          label="Premier rapport ?"
                          onChange={(event) =>
                            setIsFirstReport((event as any).target.checked)
                          }
                        />
                      )}
                    </CheckboxField>

                    <CheckboxField
                      name="participation"
                      label="As-t-il (as-tu) participé à une forme de précication durant le mois?"
                    >
                      {({ fieldProps }) => (
                        <Checkbox
                          {...fieldProps}
                          isChecked={hasPreached}
                          label="A prêché ?"
                          onChange={(event) =>
                            setHasPreached((event as any).target.checked)
                          }
                        />
                      )}
                    </CheckboxField>

                    {!publisher && (
                      <Field
                        aria-required={true}
                        name="publisher"
                        label="Proclamateur"
                        defaultValue=""
                      >
                        {({ fieldProps, error }) => (
                          <DropdownMenu
                            isOpen={isPubDropdownOpen}
                            trigger={({ triggerRef, ...triggerProps }) => (
                              <div {...(fieldProps as any)}>
                                <Button
                                  ref={triggerRef}
                                  {...triggerProps}
                                  onClick={() =>
                                    setIsPubDropdownOpen(!isPubDropdownOpen)
                                  }
                                >
                                  {selectedPublisherId
                                    ? pickPublisherName(
                                        selectedPublisherId,
                                        publishers
                                      )
                                    : 'Aucun'}
                                </Button>
                              </div>
                            )}
                          >
                            {publishers.map((pub) => (
                              <DropdownItem
                                onClick={() => {
                                  setSelectedPublisherId(pub.id);
                                  setIsPubDropdownOpen(false);
                                }}
                              >
                                <span style={{ color: token('color.text') }}>
                                  {getPublisherName(pub)}
                                </span>
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        )}
                      </Field>
                    )}

                    {showRequestHoursCount && (
                      <Field
                        aria-required={true}
                        name="hours"
                        label="Heures"
                        isRequired
                        defaultValue=""
                      >
                        {({ fieldProps, error }) => (
                          <Fragment>
                            <TextField
                              type="number"
                              autoComplete="off"
                              {...fieldProps}
                              value={hours}
                              onChange={(e) => {
                                if ((e as any).target.value) {
                                  const value =
                                    Number((e as any).target.value || 0) || 0;
                                  setHours(value.valueOf() || 0);

                                  if ((value.valueOf() || 0) > 0) {
                                    setHasPreached(true);
                                  }
                                } else {
                                  setHours(undefined);
                                  setHasPreached(false);
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
                    )}

                    <Field
                      aria-required={true}
                      name="studies"
                      label="Cours bibliques"
                      isRequired
                      defaultValue=""
                    >
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextField
                            type="number"
                            autoComplete="off"
                            {...fieldProps}
                            value={courses}
                            onChange={(e) => {
                              if ((e as any).target.value) {
                                const value = Number((e as any).target.value);
                                setCourses(value.valueOf() || 0);

                                if ((value.valueOf() || 0) > 0) {
                                  setHasPreached(true);
                                }
                              } else {
                                setCourses(undefined);
                                setHasPreached(false);
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
                      name="comments"
                      label="Commentaires"
                      isRequired
                      defaultValue=""
                    >
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <Textarea
                            autoComplete="off"
                            {...fieldProps}
                            value={comment}
                            onKeyUp={(event) => {
                              if (event.key === 'Enter') {
                                event.stopPropagation();
                              }
                            }}
                            onChange={(e) => {
                              e.stopPropagation();
                              setComment((e as any).target.value);
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
              <LoadingButton
                appearance="primary"
                isLoading={isLoading}
                onClick={submit}
              >
                {isEditMode ? 'Enregistrer' : 'Créer'}
              </LoadingButton>
              <Button
                appearance="subtle"
                onClick={() => props.onHide(false)}
                isDisabled={isLoading}
              >
                Annuler
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalTransition>
      )}
    </Modal>
  );
}

const onValidate = (params: ValidationParams) => {
  if (allParamsSet(params)) {
    if (params.isEditMode) {
      return updateReport(params);
    }

    if (params.reports.some((r) => r.monthId === params.month?.getKey())) {
      return Promise.reject('Ce rapport existe déjà');
    }

    return createReport(params);
  }

  return Promise.reject(
    'Le formulaire contient des erreurs. Veuillez les corriger avant de continuer.'
  );
};

const allParamsSet = (params: any) => {
  const requiredParams = ['publisherId', 'courses'];

  if (params.shouldHaveHours && !params.hours) {
    return false;
  }

  if (params.active === undefined) return false;

  return requiredParams.every(
    (param: string) => params[param] !== null && params[param] !== undefined
  );
};

const updateReport = (params: ValidationParams) => {
  return Reports.update({
    id: params.report?.id || '',
    hours: params.hours || 0,
    courses: params.courses || 0,
    comment: params.comment || '',
    publisherId: params.publisherId,
    monthId: params.month?.getKey() || '',
    isFirstReport: params.isFirstReport,
  } as Report).then(() => {
    params.onHide(true);
  });
};

const createReport = (params: ValidationParams) => {
  return Reports.create({
    hours: params.hours || 0,
    courses: params.courses || 0,
    comment: params.comment || '',
    publisherId: params.publisherId,
    monthId: params.month?.getKey() || '',
    submitted: false,
    active: params.active,
    isFirstReport: params.isFirstReport,
  } as Report).then((report) => {
    params.onHide(true);
    return report;
  });
};

function pickPublisherName(
  id: string | undefined,
  publishers: Publisher[]
): string {
  if (!id) {
    return 'Aucun';
  }

  const pub = publishers.find((p) => p.id === id);
  if (pub) {
    return getPublisherName(pub);
  }

  return 'Aucun';
}
