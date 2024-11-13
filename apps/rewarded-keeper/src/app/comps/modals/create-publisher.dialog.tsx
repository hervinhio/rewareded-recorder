import { FormEvent, useState } from 'react';
import { Publisher } from '../../types';
import { NewPublisherReason, Publishers } from '../../data/publishers';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  Field,
  Input,
  MessageBar,
  Option,
} from '@fluentui/react-components';
import { GroupDropdownMenu } from '../group-dropdown.menu';

interface Props {
  show: boolean;
  onHide: () => void;
}

export function CreatePublisherModal(props: Props) {
  const [error, setError] = useState('');
  const [groupId, setGroupId] = useState('');
  const [reason, setReason] = useState<NewPublisherReason | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const form = e.target as any;

    const publisher = {
      firstName: form.firstName.value,
      name: form.middleName.value,
      lastName: form.lastName.value,
      groupId: groupId || 'unafiliated',
    } as Publisher;

    if (reason === null) {
      setError('Veuilles spécifier la raison de la création du proclamateur.');
      return false;
    }

    if (!publisher.firstName || !publisher.name) {
      setError('Veuilles renseigner les champs obligatoires');
    }

    return Publishers.create(publisher, reason)
      .then((publisher: Publisher) => {
        props.onHide();
      })
      .catch((error: any) => {
        setError(error?.message);
      });

    return false;
  }

  return (
    <Dialog open={props.show}>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogBody>
            <DialogTitle>Créer un proclamateur</DialogTitle>
            <DialogContent>
              {error && <MessageBar intent="error">{error}</MessageBar>}
              <Field label="Prénom" required>
                <Input
                  autoComplete="off"
                  autoFocus={true}
                  name="firstName"
                  placeholder="John"
                />
              </Field>

              <Field label="Nom" required>
                <Input
                  autoComplete="off"
                  name="middleName"
                  placeholder="Ntambwe"
                />
              </Field>

              <Field label="Postnom">
                <Input
                  autoComplete="off"
                  name="lastName"
                  placeholder="Busuku"
                />
              </Field>

              <GroupDropdownMenu
                onChange={(value: string) => setGroupId(value)}
                value={groupId}
              />

              <Field label="Raison de la création du proclamateur" required>
                <Dropdown placeholder="Raison">
                  <Option
                    onClick={() => setReason(NewPublisherReason.New)}
                    value={NewPublisherReason.New.toFixed(0)}>
                    Nouveau
                  </Option>
                  <Option
                    onClick={() => setReason(NewPublisherReason.Transferred)}
                    value={NewPublisherReason.Transferred.toFixed(0)}>
                    Venu d'ailleur
                  </Option>
                </Dropdown>
              </Field>
            </DialogContent>

            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={() => props.onHide()}>
                  Annuler
                </Button>
              </DialogTrigger>
              <Button type="submit" appearance="primary">
                Ajouter
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
