import Page, { Grid, GridColumn } from '@atlaskit/page';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { GlobalState, Users } from '../data';
import { User } from '../types';
import StarFilledIcon from '@atlaskit/icon/glyph/star-filled';
import { IconButton } from '@atlaskit/atlassian-navigation';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import { useState } from 'react';
import { UserModificationDialog } from './user-modification.dialog';
import EmailIcon from '@atlaskit/icon/glyph/email';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import { ConfirmationModal } from '../comps';
import { R300 } from '@atlaskit/theme/colors';

export function UsersPage() {
  const users = useSelector((state: GlobalState) => state.users.users);
  const usersArray = Object.keys(users).map((key) => users[key]);
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [userToDelete, setUserToDelete] = useState<User | undefined>();

  return (
    <Page>
      <Grid layout="fluid" spacing="comfortable">
        <GridColumn medium={12}>
          <h5>Utilisateurs</h5>
          <ListGroup style={{ width: '100%' }}>
            {usersArray.map((user: User) => {
              return (
                <ListGroupItem key={user.id}>
                  <div className="publisher-name-group">
                    {user.admin && (
                      <span style={{ marginRight: 8 }}>
                        <StarFilledIcon label="" />
                      </span>
                    )}
                    <span>
                      <div>{user.displayName}</div>
                    </span>
                    <span className="flex-expand"></span>
                    <IconButton
                      icon={<EmailIcon label="" />}
                      tooltip="Send this user an email"
                      href={`mailto:${user.email}}`}
                    />
                    <IconButton
                      icon={<EditFilledIcon label="" />}
                      tooltip="Edit this user"
                      onClick={() => setCurrentUser(user)}
                    />
                    <IconButton
                      icon={<TrashIcon primaryColor={R300} label="" />}
                      tooltip="Delete this user"
                      isDisabled={user.admin}
                      onClick={() => setUserToDelete(user)}
                    />
                  </div>
                </ListGroupItem>
              );
            })}
          </ListGroup>
          {!!currentUser && (
            <UserModificationDialog
              user={currentUser}
              onClose={() => setCurrentUser(undefined)}
            />
          )}
          {!!userToDelete && (
            <ConfirmationModal
              risky={true}
              onClose={(confirmed: boolean) => {
                if (confirmed) {
                  Users.delete(userToDelete.id);
                }
                setUserToDelete(undefined);
              }}
              title="Suppression utilisateur"
            >
              Voulez-vous supprimer cette utilisateur ? Cette operétion ne peut
              être corrigée.
            </ConfirmationModal>
          )}
        </GridColumn>
      </Grid>
    </Page>
  );
}
