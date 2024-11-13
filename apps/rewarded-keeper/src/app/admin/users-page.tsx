import './users-page.scss';
import { useSelector } from 'react-redux';
import { GlobalState, Users } from '../data';
import { User } from '../types';
import { useState } from 'react';
import { UserModificationDialog } from './user-modification.dialog';
import { ConfirmationDialog } from '../comps';
import { List, ListItem } from '@fluentui/react-list-preview';
import {
  Badge,
  Body1,
  makeStyles,
  Persona,
  themeToTokensObject,
  Title3,
  Toolbar,
  ToolbarButton,
  Tooltip,
} from '@fluentui/react-components';
import { DeleteFilled, EditFilled, MailFilled } from '@fluentui/react-icons';
import { darkTheme, lightTheme, themeMode } from '../theme';

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
});

const tokens = themeToTokensObject(
  themeMode === 'light' ? lightTheme : darkTheme,
);

export function UsersPage() {
  const styles = useStyles();
  const { users, groups } = useSelector((state: GlobalState) => ({
    users: state.users.users,
    groups: state.groups.groups,
  }));
  const usersArray = Object.values(users);
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [userToDelete, setUserToDelete] = useState<User | undefined>();

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
              {user.admin && (
                <div className={styles.lozenge}>
                  <Badge appearance="filled">Admin</Badge>
                </div>
              )}
              <Toolbar>
                <Tooltip
                  content="Send this user an email"
                  relationship="description">
                  <ToolbarButton
                    icon={<MailFilled />}
                    href={`mailto:${user.email}}`}
                  />
                </Tooltip>
                <Tooltip content="Edit this user" relationship="description">
                  <ToolbarButton
                    icon={<EditFilled />}
                    onClick={() => setCurrentUser(user)}
                  />
                </Tooltip>
                <Tooltip content="Delete this user" relationship="description">
                  <ToolbarButton
                    icon={
                      <DeleteFilled
                        color={tokens.colorStatusDangerForeground1}
                      />
                    }
                    disabled={user.admin}
                    onClick={() => setUserToDelete(user)}
                  />
                </Tooltip>
              </Toolbar>
            </ListItem>
          );
        })}
      </List>
      {currentUser && (
        <UserModificationDialog
          user={currentUser}
          onClose={() => setCurrentUser(undefined)}
        />
      )}
      {userToDelete && (
        <ConfirmationDialog
          risky={true}
          show={!!userToDelete}
          onClose={(confirmed: boolean) => {
            if (confirmed) {
              Users.delete(userToDelete.id);
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
