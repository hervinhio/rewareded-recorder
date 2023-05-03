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
import { Month, Publisher, Repport } from '../../types';
import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button';
import { MonthSelector } from '../../header/month-selector';
import { GlobalState, Repports } from '../../data';
import { MovingTrainIcon } from '..';
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
  repport?: Repport | undefined;
  show: boolean;
  onHide: (created: boolean) => void;
}

interface ValidationParams {
  publications: number | undefined;
  videos: number | undefined;
  hours: number | undefined;
  visits: number | undefined;
  courses: number | undefined;
  comment: string | undefined;
  month: Month | undefined;
  publisherId: string | undefined;
  isFirstReport: boolean;
  isEditMode: boolean;
  repport?: Repport;
  onHide: (created: boolean) => void;
  setError: (error: any) => void;
  reports: Repport[];
}

export function RepportModal(props: Props) {
  const defaultMonth = props.repport
    ? Month.fromKey(props.repport.monthId)
    : undefined;
  const [error, setError] = useState('');
  const [publications, setPublications] = useState(props.repport?.publications);
  const [videos, setVideos] = useState(props.repport?.videos);
  const [hours, setHours] = useState(props.repport?.hours);
  const [visits, setVisits] = useState(props.repport?.visits);
  const [courses, setCourses] = useState(props.repport?.courses);
  const [isFirstReport, setIsFirstReport] = useState(
    props.repport?.isFirstReport || false
  );
  const [selectedPublisherId, setSelectedPublisherId] = useState<
    string | undefined
  >(props.publisherId);
  const [comment, setComment] = useState<string | undefined>(
    props.repport?.comment
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
  const isEditMode = !!props.repport;
  const shouldShowModal = props.show;

  const submit = () => {
    if (isLoading) return;
    setIsLoading(true);
    onValidate({
      publications,
      videos,
      hours,
      visits,
      courses,
      comment,
      publisherId: props.publisherId || selectedPublisherId,
      month,
      isFirstReport,
      isEditMode,
      repport: props.repport,
      onHide: props.onHide,
      setError,
      reports,
    })
      .catch((error) => setError(error))
      .finally(() => setIsLoading(false));
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === 'enter') {
      submit();
    }
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
              <SectionMessage appearance="error">{error}</SectionMessage>
            )}
            {isLoading && <MovingTrainIcon />}
            <AtlaskitForm<Repport> onSubmit={(data) => false}>
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

                    <CheckboxField
                      name="isMidweekMeeting"
                      label="Type de rapport"
                    >
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

                    <Field
                      aria-required={true}
                      name="publications"
                      label="Publications"
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
                            value={publications}
                            onChange={(e) => {
                              if ((e as any).target.value) {
                                setPublications(
                                  Number((e as any).target.value)
                                );
                              } else {
                                setPublications(undefined);
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
                      name="videos"
                      label="Vidéos"
                      isRequired
                      defaultValue=""
                    >
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextField
                            type="number"
                            autoComplete="off"
                            {...fieldProps}
                            value={videos}
                            onChange={(e) => {
                              if ((e as any).target.value) {
                                setVideos(Number((e as any).target.value));
                              } else {
                                setVideos(undefined);
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
                                setHours(Number((e as any).target.value));
                              } else {
                                setHours(undefined);
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
                      name="visits"
                      label="Nouvelles visites"
                      isRequired
                      defaultValue=""
                    >
                      {({ fieldProps, error }) => (
                        <Fragment>
                          <TextField
                            type="number"
                            autoComplete="off"
                            {...fieldProps}
                            value={visits}
                            onChange={(e) => {
                              if ((e as any).target.value) {
                                setVisits(Number((e as any).target.value));
                              } else {
                                setVisits(undefined);
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
                                setCourses(Number((e as any).target.value));
                              } else {
                                setCourses(undefined);
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
      return updateRepport(params);
    }

    if (params.reports.some((r) => r.monthId === params.month?.getKey())) {
      return Promise.reject('Ce rapport existe déjà');
    }

    return createRepport(params);
  }

  return Promise.reject(
    'Le formulaire contient des erreurs. Veuillez les corriger avant de continuer.'
  );
};

const allParamsSet = (params: any) => {
  const requiredParams = [
    'publisherId',
    'publications',
    'videos',
    'hours',
    'visits',
    'courses',
  ];
  return requiredParams.every(
    (param: string) => params[param] !== null && params[param] !== undefined
  );
};

const updateRepport = (params: ValidationParams) => {
  return Repports.update({
    id: params.repport?.id || '',
    publications: params.publications || 0,
    videos: params.videos || 0,
    hours: params.hours || 0,
    visits: params.visits || 0,
    courses: params.courses || 0,
    comment: params.comment || '',
    publisherId: params.publisherId,
    monthId: params.month?.getKey() || '',
    isFirstReport: params.isFirstReport,
  } as Repport).then(() => {
    params.onHide(true);
  });
};

const createRepport = (params: ValidationParams) => {
  return Repports.create({
    publications: params.publications || 0,
    videos: params.videos || 0,
    hours: params.hours || 0,
    visits: params.visits || 0,
    courses: params.courses || 0,
    comment: params.comment || '',
    publisherId: params.publisherId,
    monthId: params.month?.getKey() || '',
    submitted: false,
    isFirstReport: params.isFirstReport,
  } as Repport).then((report) => {
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
