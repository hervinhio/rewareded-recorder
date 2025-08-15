import './user-modification.dialog.scss';
import { Publisher, User, Role, UserPermissions } from '../types';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, Users } from '../data';
import { FormEvent, useState } from 'react';
import { getPublisherName } from '../content-panel/util';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  Field,
  Option,
} from '@fluentui/react-components';
import { GroupDropdownMenu } from '../comps/group-dropdown.menu';
import { Flags } from '../data/flags';

interface Props {
  user: User;
  onClose: () => void;
}

export function UserModificationDialog(props: Props) {
  const { publishers } = useSelector(
    (state: GlobalState) => ({
      groups: state.groups.groups,
      publishers: state.publishers.publishers,
    }),
    shallowEqual,
  );
  const [user, setUser] = useState<User>({ ...props.user });

  function handleSubmission(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Get form data
    const formData = new FormData(e.target as HTMLFormElement);
    const admin = formData.get('admin') === 'on';
    const validated = formData.get('validated') === 'on';
    
    const updatedUser = {
      ...user,
      admin,
      validated,
    };

    Users.update(updatedUser)
      .then(() => {
        props.onClose();
      })
      .catch(Flags.raiseError);
  }

  return (
    <Dialog open={true}>
      <DialogSurface>
        <form onSubmit={handleSubmission}>
          <DialogBody>
            <DialogTitle>{user.displayName} | Modification</DialogTitle>
            <DialogContent>
              <Field hint="Sélectionnez le rôle de l'utilisateur">
                <Dropdown
                  name="role"
                  id="role"
                  defaultValue={UserPermissions.getRoleDisplayName(user.role || Role.BASIC)}
                  defaultSelectedOptions={[user.role || Role.BASIC]}>
                  {UserPermissions.getAllRoles().map((role) => (
                    <Option
                      text={`${UserPermissions.getRoleDisplayName(role)} - ${UserPermissions.getRoleDescription(role)}`}
                      value={role}
                      key={role}
                      onClick={() => {
                        setUser({ ...user, role });
                      }}>
                      {UserPermissions.getRoleDisplayName(role)} - {UserPermissions.getRoleDescription(role)}
                    </Option>
                  ))}
                </Dropdown>
              </Field>

              <Field hint="Coche pour rendre cet utilisateur adminitrateur (legacy)">
                <Checkbox
                  label="Administrateur (legacy)"
                  name="admin"
                  id="admin"
                  disabled={user.email.includes('hervinhio')}
                  defaultChecked={user.admin}
                />
              </Field>

              <Field hint="Coche pour valider cet utilisateur">
                <Checkbox
                  label="Validé"
                  name="validated"
                  id="validated"
                  disabled={user.email.includes('hervinhio')}
                  defaultChecked={user.validated}
                />
              </Field>

              <Field hint="Groupe de prédication auquel appertient l'utilisateur">
                <GroupDropdownMenu
                  onChange={(value: string) =>
                    setUser({ ...user, groupId: value })
                  }
                  value={user.groupId}
                />
              </Field>

              <Field hint="Proclamateur rattaché à cet utilisateur">
                <Dropdown
                  name="publisherId"
                  id="publisherId"
                  defaultValue={pickPublisherName(user.publisherId, publishers)}
                  defaultSelectedOptions={[user.publisherId]}>
                  {publishers.map((publisher) => (
                    <Option
                      value={publisher.id}
                      key={publisher.id}
                      onClick={() => {
                        setUser({ ...user, publisherId: publisher.id || '' });
                      }}>
                      {getPublisherName(publisher)}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
            </DialogContent>
          </DialogBody>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" onClick={() => props.onClose()}>
                Fermer
              </Button>
            </DialogTrigger>
            <Button type="submit" appearance="primary">
              Modifier
            </Button>
          </DialogActions>
        </form>
      </DialogSurface>
    </Dialog>
  );
}
function pickPublisherName(
  id: string | undefined,
  publishers: Publisher[],
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
