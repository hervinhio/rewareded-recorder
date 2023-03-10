import Banner from '@atlaskit/banner';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { useState } from 'react';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import { Form } from 'react-bootstrap';
import { Month, Publisher, Repport } from '../../types';
import Button, { LoadingButton } from '@atlaskit/button';
import { MonthSelector } from '../../header/month-selector';
import { GlobalState, Repports } from '../../data';
import { MovingTrainIcon } from '..';
import { getPublisherName } from '../../content-panel/util';
import { shallowEqual, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';

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
    <Modal shouldCloseOnEscapePress={true}>
      {shouldShowModal && (
        <ModalTransition>
          <ModalHeader>
            <ModalTitle>Enregistrer un rapport</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Form onKeyUp={handleKeyUp as any}>
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
                <Form.Label>Mois</Form.Label>
                <MonthSelector
                  selectedMonth={month}
                  disabled={isLoading}
                  onMonthSelected={(month: Month | undefined) => {
                    setMonth(month);
                  }}
                />
              </Form.Group>

              {!publisher && (
                <Form.Group className="mb-3" controlId="publisher">
                  <Form.Label>Proclamateur</Form.Label>
                  <Form.Select
                    aria-label="Proclamateur"
                    onChange={(event) => {
                      setSelectedPublisherId(event.target.value || undefined);
                    }}
                  >
                    <option
                      selected={!selectedPublisherId}
                      key={nanoid()}
                      value={''}
                    >
                      Aucun
                    </option>
                    {publishers.map((publisher: Publisher) => {
                      return (
                        <option
                          selected={publisher.id === selectedPublisherId}
                          key={publisher.id}
                          value={publisher.id}
                        >
                          {getPublisherName(publisher)}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Publications</Form.Label>
                <Form.Control
                  value={publications}
                  type="number"
                  disabled={isLoading}
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setPublications(value);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Videos</Form.Label>
                <Form.Control
                  value={videos}
                  disabled={isLoading}
                  type="number"
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setVideos(value);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Heures</Form.Label>
                <Form.Control
                  type="number"
                  value={hours}
                  disabled={isLoading}
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setHours(value);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Nouvelles visites</Form.Label>
                <Form.Control
                  type="number"
                  value={visits}
                  disabled={isLoading}
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setVisits(value);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Cours bibliques</Form.Label>
                <Form.Control
                  type="number"
                  value={courses}
                  disabled={isLoading}
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setCourses(value);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Commentaires</Form.Label>
                <Form.Control
                  as="textarea"
                  value={comment}
                  disabled={isLoading}
                  rows={3}
                  onChange={(e) => {
                    setComment(e.target.value);
                  }}
                />
              </Form.Group>
            </Form>
          </ModalBody>
          <ModalFooter>
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
              Fermer
            </Button>
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
  } as Repport).then((report) => {
    params.onHide(true);
    return report;
  });
};
