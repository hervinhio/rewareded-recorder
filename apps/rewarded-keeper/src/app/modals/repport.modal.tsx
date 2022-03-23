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
import { Month, Repport } from '../types';
import Button from '@atlaskit/button';
import { MonthSelector } from '../header/month-selector';
import { Repports } from '../data';
import { MovingTrainIcon } from '../comps';

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
  publisherId: string;
  isEditMode: boolean;
  repport?: Repport;
  onHide: (created: boolean) => void;
  setError: (error: any) => void;
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
  const [comment, setComment] = useState<string | undefined>(
    props.repport?.comment
  );
  const [month, setMonth] = useState<Month | undefined>(defaultMonth);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!props.repport;
  const shouldShowModal = props.show && !!props.publisherId;

  return (
    <Modal>
      {shouldShowModal && (
        <ModalTransition>
          <ModalHeader>
            <ModalTitle>Enregistrer un rapport</ModalTitle>
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
                <Form.Label>Mois</Form.Label>
                <MonthSelector
                  selectedMonth={month}
                  disabled={isLoading}
                  onMonthSelected={(month: Month | undefined) => {
                    setMonth(month);
                  }}
                />
              </Form.Group>

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
            <Button
              appearance="primary"
              isDisabled={isLoading}
              onClick={() => {
                setIsLoading(true);
                onValidate({
                  publications,
                  videos,
                  hours,
                  visits,
                  courses,
                  comment,
                  publisherId: props.publisherId || '',
                  month,
                  isEditMode,
                  repport: props.repport,
                  onHide: props.onHide,
                  setError,
                })
                  .catch((error) => setError(error))
                  .finally(() => setIsLoading(false));
              }}
            >
              {isEditMode ? 'Enregistrer' : 'Créer'}
            </Button>
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

    return Repports.byMonthIdAndPublisherId(
      params.month?.getKey(),
      params.publisherId
    ).then((repport: Repport | null) => {
      if (repport) {
        throw 'Ce rapport existe déjà';
      }

      return createRepport(params);
    });
  }

  return Promise.reject(
    'Le formulaire contient des erreurs. Veuillez les corriger avant de continuer.'
  );
};

const allParamsSet = (params: any) => {
  const requiredParams = [
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
  } as Repport).then(() => {
    params.onHide(true);
  });
};
