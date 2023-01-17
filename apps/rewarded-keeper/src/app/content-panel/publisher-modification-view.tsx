import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { Publisher, Group } from '../types';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Banner from '@atlaskit/banner';
import { GlobalState, Publishers } from '../data';
import { useState } from 'react';
import Button from '@atlaskit/button';
import { FirebaseError } from 'firebase/app';
import { MovingTrainIcon, MultiMonthsSelector } from '../comps';
import { shallowEqual, useSelector } from 'react-redux';

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
  const groups = useSelector(
    (state: GlobalState) => state.groups.groups,
    shallowEqual
  );
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const initialChange = isBulkEdit
    ? { isBulk: true }
    : { isBulk: false, ...props.publisher };
  const [change, setChange] = useState<ChangeMap>(initialChange);

  return (
    <Form style={{ width: '100%' }}>
      <Form.Group className="mb-3">
        <h4>Modification du proclamateur</h4>
      </Form.Group>
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
        <Form.Label>Prénom</Form.Label>
        <Form.Control
          type="text"
          placeholder="Patrick"
          value={
            isBulkEdit
              ? '(Many)'
              : change.firstName || props.publisher.firstName
          }
          disabled={isLoading || isBulkEdit}
          onChange={(e) => {
            setChange({ ...change, firstName: e.target.value });
          }}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Nom</Form.Label>
        <Form.Control
          type="text"
          placeholder="Irenge"
          disabled={isLoading || isBulkEdit}
          value={isBulkEdit ? '(Many)' : change.name || props.publisher.name}
          onChange={(e) => {
            setChange({ ...change, name: e.target.value });
          }}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Post-nom</Form.Label>
        <Form.Control
          type="text"
          placeholder="Kiyuka"
          value={
            isBulkEdit ? '(Many)' : change.lastName || props.publisher.lastName
          }
          disabled={isLoading || isBulkEdit}
          onChange={(e) => {
            setChange({ ...change, lastName: e.target.value });
          }}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Check
          type="checkbox"
          label="Ancien ?"
          checked={isBulkEdit ? false : props.publisher.isElder}
          disabled={isLoading || isBulkEdit}
          onChange={(e) => {
            setChange({ ...change, isElder: e.target.checked });
          }}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Check
          type="checkbox"
          checked={isBulkEdit ? false : props.publisher.isRegularPioneer}
          label="Pionnier Permanent ?"
          disabled={isLoading || isBulkEdit}
          onChange={(e) => {
            setChange({ ...change, isRegularPioneer: e.target.checked });
          }}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicAuxilaryFor">
        <Form.Label>Pionnier Auxiliaire pour ?</Form.Label>
        <br />
        {!isBulkEdit && (
          <MultiMonthsSelector
            onValueChange={(value) => {
              setChange({ ...change, auxilaryPionierFor: value });
            }}
            value={change.auxilaryPionierFor || []}
          />
        )}
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Groupe de prédication</Form.Label>
        <DropdownButton
          title={getGroupName(change.groupId, groups)}
          disabled={isLoading}
          onSelect={(v) => {
            if (v) {
              const groupId = groups[Number(v)].id;
              setChange({ ...change, groupId });
            }
          }}
        >
          {groups.map((group, index) => (
            <Dropdown.Item key={index} eventKey={index}>
              {' '}
              {group.name}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </Form.Group>

      <Form.Group className="mt-5">
        <Button
          appearance="subtle"
          onClick={() => props.onHide()}
          isDisabled={isLoading}
        >
          Retour
        </Button>
        <Button
          appearance="primary"
          onClick={() => {
            setIsLoading(true);
            savePublisher(
              props.publishers,
              change,
              setError,
              props.onHide
            ).finally(() => setIsLoading(false));
          }}
          isDisabled={isLoading}
        >
          Enregistrer
        </Button>
      </Form.Group>
    </Form>
  );
}

function savePublisher(
  publishers: Publisher[] = [],
  change: ChangeMap,
  setError: any,
  onHide: () => void
) {
  if (change.isBulk) {
    return Publishers.transferToGroup(publishers || [], change.groupId)
      .then(() => {
        onHide();
      })
      .catch((error: FirebaseError) => {
        setError(error.message);
      });
  }

  return Publishers.save(change as unknown as Publisher)
    .then(() => {
      onHide();
    })
    .catch((error: FirebaseError) => {
      setError(error.message);
    });
}

function getGroupName(groupId: string, groups: Group[]) {
  return groups.find((group) => group.id === groupId)?.name || 'Non affilié';
}
