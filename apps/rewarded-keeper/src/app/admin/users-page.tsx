import './users-page.scss';
import { useSelector } from 'react-redux';
import { GlobalState, Users } from '../data';
import { User, Permission, UserPermissions, Role } from '../types';
import { useState } from 'react';
import { UserModificationDialog } from './user-modification.dialog';
import { ConfirmationDialog } from '../comps';
import { PermissionGuard } from '../components/permission-guard';
import { Flags } from '../data/flags';
import { List, ListItem } from '@fluentui/react-list';
import {
  Badge,
  Body1,
  makeStyles,
  Persona,
  Spinner,
  tokens,
  Title3,
  Toolbar,
  ToolbarButton,
  Tooltip,
} from '@fluentui/react-components';
import { DeleteFilled, EditFilled, MailFilled } from '@fluentui/react-icons';

const useStyles = makeStyles({
  listItem: {
    display: 'flex',
    flexDirection: 'row',
  },
  list: {
    marginTop: '16px',
  },
  lozenge: {
    marginTop: 'auto',
    marginBottom: 'auto',
    height: 'fit-content',
    width: 'fit-content',
    top: '0',
    bottom: '0',
  },
  loadingSpinnerContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  loadingSpinner: {
    margin: 'auto',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export function UsersPage() {
  const styles = useStyles();
  const { users, groups, currentUser } = useSelector((state: GlobalState) => ({
    users: state.users.users,
    groups: state.groups.groups,
    currentUser: Users.getCurrent(),
  }));
  const usersArray = Object.values(users);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [userToDelete, setUserToDelete] = useState<User | undefined>();

  // Helper function to get role badge
  const getRoleBadge = (user: User) => {
    const role = UserPermissions.getEffectiveRole(user);
    const displayName = UserPermissions.getRoleDisplayName(role);

    // Color coding for different roles
    const getBadgeAppearance = () => {
      switch (role) {
        case 'root':
          return 'important';
        case 'admin':
          return 'filled';
        case 'reporter':
          return 'outline';
        case 'group_admin':
          return 'outline';
        default:
          return 'subtle';
      }
    };

    return (
      <div className={styles.lozenge}>
        <Badge appearance={getBadgeAppearance() as any}>{displayName}</Badge>
      </div>
    );
  };

  if (!currentUser) {
    return <Spinner size="large" className={styles.loadingSpinner} />;
  }

  return (
    <section>
      <Title3>Utilisateurs</Title3>
      <List className={styles.list}>
        {usersArray.map((user: User) => {
          return (
            <ListItem className={styles.listItem} key={user.id}>
              <Persona
                name={user.displayName}
                secondaryText={
                  groups.find((g) => g.id === user.groupId)?.name ||
                  'Aucun groupe'
                }
                avatar={{
                  image: {
                    src: user.photoURL,
                  },
                }}
              />
              <span className="flex-expand"></span>
              {getRoleBadge(user)}
              <Toolbar>
                <Tooltip
                  content="Send this user an email"
                  relationship="description">
                  <ToolbarButton
                    icon={<MailFilled />}
                    href={`mailto:${user.email}}`}
                  />
                </Tooltip>

                {/* Only show edit button if current user has user admin permission */}
                <PermissionGuard
                  user={currentUser!}
                  permission={Permission.USER_ADMIN}>
                  <Tooltip content="Edit this user" relationship="description">
                    <ToolbarButton
                      icon={<EditFilled />}
                      onClick={() => setEditingUser(user)}
                    />
                  </Tooltip>
                </PermissionGuard>

                {/* Only show delete button if current user has user admin permission and target user is not root */}
                <PermissionGuard
                  user={currentUser!}
                  permission={Permission.USER_ADMIN}>
                  <Tooltip
                    content="Delete this user"
                    relationship="description">
                    <ToolbarButton
                      icon={
                        <DeleteFilled
                          color={tokens.colorStatusDangerForeground1}
                        />
                      }
                      disabled={
                        UserPermissions.getEffectiveRole(user) === Role.ROOT ||
                        user.email.includes('hervinhio')
                      }
                      onClick={() => setUserToDelete(user)}
                    />
                  </Tooltip>
                </PermissionGuard>
              </Toolbar>
            </ListItem>
          );
        })}
      </List>

      {/* Only show modification dialog if current user has user admin permission */}
      {editingUser &&
        currentUser &&
        UserPermissions.userHasPermission(
          currentUser,
          Permission.USER_ADMIN,
        ) && (
          <UserModificationDialog
            user={editingUser}
            onClose={() => setEditingUser(undefined)}
          />
        )}

      {userToDelete && (
        <ConfirmationDialog
          risky={true}
          show={!!userToDelete}
          onClose={(confirmed: boolean) => {
            if (confirmed) {
              const loadingId = `delete-user-${userToDelete.id}`;
              Flags.raiseLoading({
                title: "Suppression de l'utilisateur en cours…",
                id: loadingId,
              });
              Users.delete(userToDelete.id).finally(() =>
                Flags.dismissLoading(loadingId),
              );
            }
            setUserToDelete(undefined);
          }}
          title="Suppression utilisateur">
          <Body1>
            Voulez-vous supprimer cette utilisateur ? Cette operétion ne peut
            être corrigée.
          </Body1>
        </ConfirmationDialog>
      )}
    </section>
  );
}
