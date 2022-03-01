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

interface Props {
  publisherId: string | undefined;
  repport?: Repport | undefined;
  show: boolean;
  onHide: () => void;
}

interface ValidationParams {
  publications: number;
  videos: number;
  hours: number;
  visits: number;
  courses: number;
  comment: string;
  month: Month | undefined;
  publisherId: string;
  isEditMode: boolean;
  repport?: Repport;
  onHide: () => void;
  setError: (error: any) => void;
}

export function RepportModal(props: Props) {
  const defaultMonth = props.repport
    ? Month.fromKey(props.repport.monthId)
    : undefined;
  const [error, setError] = useState('');
  const [publications, setPublications] = useState(
    props.repport?.publications || 0
  );
  const [videos, setVideos] = useState(props.repport?.videos || 0);
  const [hours, setHours] = useState(props.repport?.hours || 0);
  const [visits, setVisits] = useState(props.repport?.visits || 0);
  const [courses, setCourses] = useState(props.repport?.courses || 0);
  const [comment, setComment] = useState<string>(props.repport?.comment || '');
  const [month, setMonth] = useState<Month | undefined>(defaultMonth);
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
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Mois</Form.Label>
                <MonthSelector
                  selectedMonth={month}
                  onMonthSelected={(month: Month | undefined) => {
                    setMonth(month);
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Publications</Form.Label>
                <Form.Control
                  value={props.repport?.publications}
                  type="number"
                  placeholder="0"
                  onChange={(e) => {
                    setPublications(Number(e.target.value));
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Videos</Form.Label>
                <Form.Control
                  value={props.repport?.videos}
                  type="number"
                  placeholder="0"
                  onChange={(e) => {
                    setVideos(Number(e.target.value));
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Heures</Form.Label>
                <Form.Control
                  type="number"
                  value={props.repport?.hours}
                  placeholder="0"
                  onChange={(e) => {
                    setHours(Number(e.target.value));
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Nouvelles visites</Form.Label>
                <Form.Control
                  type="number"
                  value={props.repport?.visits}
                  placeholder="0"
                  onChange={(e) => {
                    setVisits(Number(e.target.value));
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Cours bibliques</Form.Label>
                <Form.Control
                  type="number"
                  value={props.repport?.courses}
                  placeholder="0"
                  onChange={(e) => {
                    setCourses(Number(e.target.value));
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Commentaires</Form.Label>
                <Form.Control
                  as="textarea"
                  value={props.repport?.comment}
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
              onClick={() =>
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
              }
            >
              {isEditMode ? 'Enregistrer' : 'Créer'}
            </Button>
            <Button appearance="subtle" onClick={props.onHide}>
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
      updatePublisher(params);
    } else {
      createPublisher(params);
    }
  } else {
    params.setError(
      'Le formulaire contient des erreurs. Veuillez les corriger avant de continuer.'
    );
  }
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

const updatePublisher = (params: ValidationParams) => {
  Repports.update({
    id: params.repport?.id || '',
    videos: params.videos,
    hours: params.hours,
    visits: params.visits,
    courses: params.courses,
    comment: params.comment,
    publisherId: params.publisherId,
    monthId: params.month?.getKey() || '',
  } as Repport)
    .then(() => {
      params.onHide();
    })
    .catch((error: any) => {
      params.setError(error?.message);
    });
};

const createPublisher = (params: ValidationParams) => {
  Repports.create({
    publications: params.publications,
    videos: params.videos,
    hours: params.hours,
    visits: params.visits,
    courses: params.courses,
    comment: params.comment,
    publisherId: params.publisherId,
    monthId: params.month?.getKey() || '',
  } as Repport)
    .then(() => {
      params.onHide();
    })
    .catch((error: any) => {
      params.setError(error?.message);
    });
};
