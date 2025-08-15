import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { GlobalState, Users } from '../data';
import { PublisherViewSwitch } from './publisher-view-switch';
import { PublishersListHeader } from './publishers-list-header';
import { useSelector } from 'react-redux';
import { getGroupName, Publisher, Role } from '../types';
import { EmptyState } from '../comps/empty-state';
import { makeStyles } from '@fluentui/react-components';
import { getPublisherName } from './util';

const useStyles = makeStyles({
  basicList: {
    marginTop: '16px',
  },
  basicListItems: {
    listStyleType: 'none',
    paddingLeft: 0,
  },
  basicListItem: {
    marginBottom: '8px',
    fontSize: '14px',
    height: '36px',
    lineHeight: '36px',
    padding: '0 8px',
    borderBottom: '1px solid #e1e1e1',
    '&:hover': {
      backgroundColor: '#f3f2f1',
      cursor: 'pointer',
    },
  },
})

export const PublishersList = () => {
  const styles = useStyles();
  const [selectedPublishersIds, setSelectedPublishersIds] = useState<string[]>(
    [],
  );
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const { groupId } = useParams();
  const user = Users.getCurrent();
  const groups = useSelector((state: GlobalState) => state.groups.groups);
  const { publishers } = useSelector(
    (state: GlobalState) => ({
      publishers: state.publishers.publishers.filter(p => p.groupId === groupId),
    }),
  );

  const groupName = getGroupName(groupId || 'unafiliated', groups);

  if (
    (!user.admin &&
      user.groupId !== groupId &&
      groupId !== 'unafiliated' &&
      groupId !== 'pioneers') ||
    groupId === 'unauthorized'
  ) {
    return (
      <EmptyState
        header="Vous n'êtes pas autorisés à voir le contenu de ce groupe"
        description="Seul l'administrateur a accès à tous les groupes de prédicaation. Si vous voulez qu'une opération particulière soit éffectuée sur un proclamateur d'un autre groupe, veuillez contacter l'administrateur."
        imageUrl={'/assets/299105_lock_icon.png'}
      />
    );
  }

  if (![Role.ROOT, Role.ADMIN, Role.GROUP_ADMIN, Role.REPORTER].includes(Users.getCurrent().role || Role.BASIC)) {
    if (publishers.length === 0) {
      return (
        <EmptyState
          header="Rien à voir par ici"
          description="Il n'y a aucun proclamateur dans ce groupe pour le moment"
        />
      );
    }
    return (
      <div className={styles.basicList}>
        <h2>Liste des proclamateurs</h2>
        <p>Voici la liste des proclamateurs de ce groupe :</p>
        <ul className={styles.basicListItems}>
          {publishers.map((publisher) => (
            <li key={publisher.id} className={styles.basicListItem}>
              { getPublisherName(publisher)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <PublishersListHeader
        onBulkEditPublishers={() => setIsBulkEditOpen(true)}
        groupId={groupId || 'unafiliated'}
        selectedPublishersIds={selectedPublishersIds}
      />
      <h5 style={{ marginTop: 16 }}>{groupName}</h5>
      <PublisherViewSwitch
        selectedPublishersIds={selectedPublishersIds}
        showList={!isBulkEditOpen}
        onHide={() => setIsBulkEditOpen(false)}
        groupId={groupId}
        onPublishersSelected={(pubs) => setSelectedPublishersIds(pubs)}
      />
    </div>
  );
};
