import './publisher-modification-view.scss';
import { Publisher } from '../types';
import { Publishers } from '../data';
import { FormEvent, useState } from 'react';
import { MultiMonthsSelector } from '../comps';
import { Flags } from '../data/flags';
import { GroupDropdownMenu } from '../comps/group-dropdown.menu';
import { CongregationDropdown } from '../comps/congregation-dropdown.menu';
import {
  Button,
  Field,
  Input,
  Radio,
  RadioGroup,
  Spinner,
  Title3,
} from '@fluentui/react-components';
import { Timestamp } from 'firebase/firestore';
import { DatePicker } from '@fluentui/react-datepicker-compat';

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

  const onSubmit = (event: FormEvent) => {
    const form = event.target as any;
    event.preventDefault();

    const publisher: Publisher = {
      activityStatus: props.publisher.activityStatus,
      address: form.address.value,
      emailAddress: form.emailAddress.value,
      emergencyPhone: form.emergencyPhone.value,
      firstName: form.firstName.value,
      groupId: change.groupId || 'unafiliated',
      lastName: form.lastName.value,
      name: form.name.value,
      telephone: form.telephone.value,
      auxilaryPionierFor: change.auxilaryPionierFor || [],
      isElder: change.isElder || false,
      isMinisterialServant: change.isMinisterialServant || false,
      isPermanentAuxilaryPioneer: change.isPermanentAuxilaryPioneer || false,
      isRegularPioneer: change.isRegularPioneer || false,
      id: props.publisher.id,
      reports: props.publisher.reports,
      congregationId: change.congregationId ?? props.publisher.congregationId,
    };

    if (form.birthDate.value) {
      publisher.birthDate = Timestamp.fromDate(new Date(form.birthDate.value));
    }
    if (form.baptismDate.value) {
      publisher.baptismDate = Timestamp.fromDate(
        new Date(form.baptismDate.value),
      );
    }

    setIsLoading(true);
    savePublisher(
      props.publishers,
      publisher,
      isBulkEdit,
      groupId,
      props.onHide,
    ).finally(() => setIsLoading(false));

    return false;
  };

  return (
    <form onSubmit={onSubmit} className="publisher-edit-form">
      <section>
        <Title3>Identité</Title3>
        <Field label="Prénom" required>
          <Input
            required
            minLength={2}
            defaultValue={
              isBulkEdit ? '(Plusieurs)' : props.publisher.firstName
            }
            placeholder="Prénom"
            name="firstName"
            disabled={isLoading || isBulkEdit}
            autoFocus={true}
          />
        </Field>
        <Field label="Nom" required>
          <Input
            required
            minLength={2}
            defaultValue={isBulkEdit ? '(Plusieurs)' : props.publisher.name}
            placeholder="Nom"
            name="name"
            disabled={isLoading || isBulkEdit}
          />
        </Field>
        <Field label="Postnom">
          <Input
            minLength={2}
            defaultValue={isBulkEdit ? '(Plusieurs)' : props.publisher.lastName}
            placeholder="Postnom"
            name="lastName"
            disabled={isLoading || isBulkEdit}
          />
        </Field>

        <Field label="Date de baptême">
          <DatePicker
            value={props.publisher?.baptismDate?.toDate() || null}
            placeholder="Date de baptême"
            name="baptismDate"
            disabled={isLoading || isBulkEdit}
          />
        </Field>

        <Field label="Date de naissance">
          <DatePicker
            value={props.publisher?.birthDate?.toDate() || null}
            placeholder="Date de naissance"
            name="birthDate"
            disabled={isLoading || isBulkEdit}
          />
        </Field>
      </section>

      <section>
        <Title3>Informations de contact</Title3>
        <Field label="Addresse">
          <Input
            minLength={2}
            defaultValue={isBulkEdit ? '(Plusieurs)' : props.publisher.address}
            placeholder="Addresse"
            name="address"
            disabled={isLoading || isBulkEdit}
          />
        </Field>
        <Field label="N° Téléphone">
          <Input
            type="tel"
            minLength={2}
            defaultValue={
              isBulkEdit ? '(Plusieurs)' : props.publisher.telephone
            }
            placeholder="+243xxxxxxxxx"
            name="telephone"
            disabled={isLoading || isBulkEdit}
          />
        </Field>
        <Field label="N° Téléphone de secours">
          <Input
            type="tel"
            defaultValue={
              isBulkEdit ? '(Plusieurs)' : props.publisher.emergencyPhone
            }
            placeholder="+243xxxxxxxxx"
            name="emergencyPhone"
            disabled={isLoading || isBulkEdit}
          />
        </Field>
        <Field label="Addresse email">
          <Input
            type="email"
            defaultValue={
              isBulkEdit ? '(Plusieurs)' : props.publisher.emailAddress
            }
            placeholder="john@example.com"
            name="emailAddress"
            disabled={isLoading || isBulkEdit}
          />
        </Field>
      </section>

      {!isBulkEdit && (
        <section>
          <Title3>Attributions</Title3>
          <Field label="Dans l'assemblée locale">
            <RadioGroup
              onChange={(_, data) =>
                setChange({
                  ...change,
                  isElder: data.value === 'elder',
                  isMinisterialServant: data.value === 'servant',
                })
              }
              defaultValue={
                props.publisher.isElder
                  ? 'elder'
                  : props.publisher.isMinisterialServant
                    ? 'servant'
                    : ''
              }>
              <Radio value="elder" label="Ancien"></Radio>
              <Radio value="servant" label="Assistant"></Radio>
              <Radio value="" label="Aucun"></Radio>
            </RadioGroup>
          </Field>
          <Field label="En prédication">
            <RadioGroup
              onChange={(_, data) =>
                setChange({
                  ...change,
                  isRegularPioneer: data.value === 'regularPioneer',
                  isPermanentAuxilaryPioneer: data.value === 'regularAP',
                })
              }
              defaultValue={
                props.publisher.isRegularPioneer
                  ? 'regularPioneer'
                  : props.publisher.isPermanentAuxilaryPioneer
                    ? 'regularAP'
                    : ''
              }>
              <Radio value="regularPioneer" label="Pionnier permanent"></Radio>
              <Radio
                value="regularAP"
                label="Pionnier auxiliaire à durée indéterminée"></Radio>
              <Radio value="" label="Aucun"></Radio>
            </RadioGroup>
          </Field>
          <Field label="Pionnier auxiliaire pour les mois de">
            <MultiMonthsSelector
              disabled={change.isPermanentAuxilaryPioneer}
              onValueChange={(value) => {
                setChange({ ...change, auxilaryPionierFor: value });
              }}
              value={change.auxilaryPionierFor || []}
            />
          </Field>
        </section>
      )}

      <section>
        <Title3>Liens</Title3>
        <GroupDropdownMenu
          onChange={(value: string) =>
            setChange({ ...change, groupId: value || 'unafiliated' })
          }
          value={groupId}
        />
        {!isBulkEdit && (
          <CongregationDropdown
            label="Congrégation"
            value={props.publisher.congregationId}
            onChange={(congregationId: number | null) =>
              setChange({ ...change, congregationId })
            }
          />
        )}
      </section>

      <section className="action-buttons-section">
        <Button
          appearance="primary"
          type="submit"
          disabled={isLoading}
          icon={isLoading ? <Spinner size="tiny" /> : undefined}>
          Enregistrer
        </Button>
        <Button
          appearance="subtle"
          onClick={() => props.onHide()}
          disabled={isLoading}>
          Annuler
        </Button>
      </section>
    </form>
  );
}

function savePublisher(
  publishers: Publisher[] = [],
  change: Publisher,
  isBulk: boolean,
  groupId: string | undefined,
  onHide: () => void,
) {
  if (isBulk) {
    return Publishers.transferToGroup(
      publishers || [],
      change.groupId,
      false,
      groupId || '',
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
