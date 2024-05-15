import Page, { Grid, GridColumn } from '@atlaskit/page';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, Groups } from '../data';
import { Group } from '../types';
import { IconButton } from '@atlaskit/atlassian-navigation';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import { useState } from 'react';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import { ConfirmationModal, CreateGroupModal } from '../comps';
import { R300 } from '@atlaskit/theme/colors';
import EmptyState from '@atlaskit/empty-state';
import { token } from '@atlaskit/tokens';

const contactListItemStyle = {
  color: token('color.text'),
  cursor: 'pointer',
  backgroundColor: token('color.background.neutral'),
};

export const GroupsPage = () => {
  const groups = useSelector(
    (state: GlobalState) => state.groups.groups,
    shallowEqual,
  );
  const [currentGroup, setCurrentGroup] = useState<Group | undefined>();
  const [groupToDelete, setGroupToDelete] = useState<Group | undefined>();

  if (groups.length === 0) {
    return <EmptyState header="Aucun group à afficher" />;
  }

  return (
    <Page>
      <Grid layout="fluid" spacing="comfortable">
        <GridColumn medium={12}>
          <h5>Groupes</h5>
          <ListGroup style={{ width: '100%' }}>
            {groups.map((group: Group) => {
              return (
                <ListGroupItem key={group.id} style={contactListItemStyle}>
                  <div className="publisher-name-group">
                    <span>
                      <div>{group.name}</div>
                    </span>
                    <span className="flex-expand"></span>
                    <IconButton
                      icon={<EditFilledIcon label="" />}
                      tooltip="Edit this user"
                      onClick={() => setCurrentGroup(group)}
                    />
                    <IconButton
                      icon={<TrashIcon primaryColor={R300} label="" />}
                      tooltip="Delete this user"
                      onClick={() => setGroupToDelete(group)}
                    />
                  </div>
                </ListGroupItem>
              );
            })}
          </ListGroup>
          {!!currentGroup && (
            <CreateGroupModal
              show={!!currentGroup}
              group={currentGroup}
              onHide={() => setCurrentGroup(undefined)}
            />
          )}
          {!!groupToDelete && (
            <ConfirmationModal
              risky={true}
              onClose={(confirmed: boolean) => {
                if (confirmed) {
                  Groups.delete(groupToDelete);
                }
                setGroupToDelete(undefined);
              }}
              title="Suppression utilisateur"
            >
              Voulez-vous supprimer ce groupe ? Cette operétion ne peut être
              corrigée.
            </ConfirmationModal>
          )}
        </GridColumn>
      </Grid>
    </Page>
  );
};
