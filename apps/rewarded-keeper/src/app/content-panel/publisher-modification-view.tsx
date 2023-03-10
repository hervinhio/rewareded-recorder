import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { Publisher, Group } from '../types';
import { GlobalState, Publishers } from '../data';
import { useState } from 'react';
import Button from '@atlaskit/button';
import { MovingTrainIcon, MultiMonthsSelector } from '../comps';
import { shallowEqual, useSelector } from 'react-redux';
import { Flags } from '../data/flags';

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
  const [isLoading, setIsLoading] = useState(false);
  const initialChange = isBulkEdit
    ? { isBulk: true }
    : { isBulk: false, ...props.publisher };
  const [change, setChange] = useState<ChangeMap>(initialChange);
  const groupId = isBulkEdit
    ? props.publishers?.[0].groupId
    : props.publisher.groupId;

  return (
    <Form style={{ width: '100%' }}>
      <Form.Group className="mb-3">
        <h4>Modification du proclamateur</h4>
      </Form.Group>
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
        <Form.Check
          type="checkbox"
          checked={
            isBulkEdit ? false : props.publisher.isPermanentAuxilaryPioneer
          }
          label="Pionnier Auxiliare à durée indéterminée ?"
          disabled={isLoading || isBulkEdit}
          onChange={(e) => {
            setChange({
              ...change,
              isPermanentAuxilaryPioneer: e.target.checked,
            });
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
          defaultValue={props.groupId}
          onSelect={(v) => {
            if (v) {
              const groupId = groups[Number(v)].id;
              setChange({ ...change, groupId });
            }
          }}
        >
          {groups.map((group, index) => (
            <Dropdown.Item key={group.id} eventKey={index}>
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
              groupId,
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
