import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, Groups } from '../data';
import { Group } from '../types';
import { useState } from 'react';
import { ConfirmationDialog, CreateGroupDialog } from '../comps';
import {
  Body1,
  makeStyles,
  Persona,
  tokens,
  Title3,
  Toolbar,
  ToolbarButton,
  Tooltip,
} from '@fluentui/react-components';
import { List, ListItem } from '@fluentui/react-list-preview';
import {
  DeleteFilled,
  EditFilled,
  PeopleCommunityFilled,
} from '@fluentui/react-icons';
import { getPublisherName } from '../content-panel/util';
import { EmptyState } from '../comps/empty-state';

const useClasses = makeStyles({
  list: {
    marginTop: '16px',
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
  },
});

export const GroupsPage = () => {
  const groups = useSelector(
    (state: GlobalState) => state.groups.groups,
    shallowEqual,
  );
  const [currentGroup, setCurrentGroup] = useState<Group | undefined>();
  const [groupToDelete, setGroupToDelete] = useState<Group | undefined>();
  const styles = useClasses();
  const elders = useSelector(
    (state: GlobalState) =>
      state.publishers.publishers.filter((p) => p.isElder),
    shallowEqual,
  );

  if (groups.length === 0) {
    return <EmptyState header="Aucun groupe à afficher" />;
  }

  return (
    <section>
      <Title3>Groupes</Title3>
      <List className={styles.list}>
        {groups.map((group: Group) => {
          const elder = group.overseerId
            ? elders.find((e) => e.id === group.overseerId)
            : undefined;
          const elderName = elder
            ? getPublisherName(elder)
            : 'Aucun responsable';

          return (
            <ListItem key={group.id} className={styles.listItem}>
              <Persona
                name={group.name}
                avatar={<PeopleCommunityFilled />}
                secondaryText={elderName}
              />
              <span className="flex-expand"></span>
              <Toolbar>
                <Tooltip content="Edit this user" relationship="description">
                  <ToolbarButton
                    icon={<EditFilled />}
                    onClick={() => setCurrentGroup(group)}
                  />
                </Tooltip>
                <Tooltip content="Delete this user" relationship="description">
                  <ToolbarButton
                    icon={
                      <DeleteFilled
                        color={tokens.colorStatusDangerForeground1}
                      />
                    }
                    onClick={() => setGroupToDelete(group)}
                  />
                </Tooltip>
              </Toolbar>
            </ListItem>
          );
        })}
      </List>
      {!!currentGroup && (
        <CreateGroupDialog
          show={!!currentGroup}
          group={currentGroup}
          onHide={() => setCurrentGroup(undefined)}
        />
      )}
      {!!groupToDelete && (
        <ConfirmationDialog
          risky={true}
          show={!!groupToDelete}
          onClose={(confirmed: boolean) => {
            if (confirmed) {
              Groups.delete(groupToDelete);
            }
            setGroupToDelete(undefined);
          }}
          title="Suppression utilisateur">
          <Body1>
            Voulez-vous supprimer ce groupe ? Cette operétion ne peut être
          </Body1>
          corrigée.
        </ConfirmationDialog>
      )}
    </section>
  );
};
