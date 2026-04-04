import { useState } from 'react';
import { Groups } from '../../data/groups';
import { Group, Publisher } from '../../types';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../../data';
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
  Spinner,
} from '@fluentui/react-components';

export interface CreateGroupModalProps {
  show: boolean;
  group?: Group;
  onHide: () => void;
}

interface ValidationParams {
  groupName: string;
  groupId: string;
  groupOverseerId: string | null;
  isCreating: boolean;
  onHide: () => void;
  setError: (error: any) => void;
}

export const CreateGroupDialog = (props: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState<string>(props.group?.name || '');
  const [groupId, setGroupId] = useState<string>(props.group?.id || '');
  const [groupOverseerId, setGroupOverseerId] = useState<string | null>(
    props.group?.overseerId || '',
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const elders = useSelector(
    (state: GlobalState) =>
      state.publishers.publishers.filter((p) => p.isElder),
    shallowEqual,
  );

  if (!props.show) return null;

  function handleSubmit() {
    if (isLoading) return;
    setIsLoading(true);
    onValidate({
      groupId,
      groupOverseerId,
      groupName,
      onHide: props.onHide,
      setError,
      isCreating: !!props.group,
    })
      .catch((e) => setError(e))
      .finally(() => setIsLoading(false));
  }

  return (
    <Dialog open={props.show}>
      <DialogSurface>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }}>
          <DialogBody>
            <DialogTitle>
              {!props.group && 'Ajouter un groupe'}
              {!!props.group && 'Modifier un groupe'}
            </DialogTitle>
            <DialogContent>
              {error && <MessageBar intent="error">{error}</MessageBar>}

              <Field
                label="Nom"
                required
                hint={'Nom du groupe, minimum 2 caractères'}>
                <Input
                  type="text"
                  placeholder="Nom du groupe"
                  defaultValue={props.group?.name}
                  minLength={2}
                  onChange={(e) => {
                    setGroupName((e as any).target.value);
                    if (!props.group) {
                      setGroupId(groupName.replace(' ', '-'));
                    }
                  }}
                />
              </Field>

              <Field
                label="Responsable"
                required
                hint="Responsable du groupe et non son adjoint">
                <Dropdown
                  placeholder="Nom du responsable"
                  defaultSelectedOptions={[props.group?.overseerId || '']}
                  defaultValue={pickElderName(props.group?.overseerId, elders)}>
                  {elders.map((elder) => (
                    <Option
                      value={elder.id}
                      onClick={() => setGroupOverseerId(elder.id || null)}>
                      {getElderFullName(elder)}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={() => props.onHide()}>
                  Fermer
                </Button>
              </DialogTrigger>
              <Button
                type="submit"
                appearance="primary"
                disabled={isLoading}
                icon={isLoading ? <Spinner size="tiny" /> : undefined}>
                {!props.group ? 'Créer' : 'Modifier'}
              </Button>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  );
};

const getElderFullName = (elder?: Publisher) => {
  if (!elder) return 'Aucun';

  return (elder.name + ' ' + elder.lastName + ' ' + elder.firstName).trim();
};

const onValidate = (params: ValidationParams) => {
  if (!params.groupName || !params.groupOverseerId) {
    return Promise.reject(
      'Le formulaire contient des erreurs. Veuillez les corriger avant de continuer.',
    );
  }

  return !params.isCreating
    ? Groups.create({
        id: params.groupId,
        overseerId: params.groupOverseerId || '',
        name: params.groupName,
      })
        .then(() => {
          params.onHide();
        })
        .catch((error: any) => {
          params.setError(error?.message);
        })
    : Groups.update({
        id: params.groupId,
        overseerId: params.groupOverseerId || '',
        name: params.groupName,
      })
        .then(() => {
          params.onHide();
        })
        .catch((error: any) => {
          params.setError(error?.message);
        });

  return Promise.resolve();
};

function pickElderName(
  id: string | null | undefined,
  elders: Publisher[],
): string {
  if (id === null) {
    return 'Aucun';
  }

  const elder = elders.find((e) => e.id === id);

  if (elder) {
    return getElderFullName(elder);
  }

  return 'Aucun';
}
