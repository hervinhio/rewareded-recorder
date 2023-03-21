import EmptyState from '@atlaskit/empty-state';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users } from '../data';
import { PublisherViewSwitch } from './publisher-view-switch';
import { PublishersListHeader } from './publishers-list-header';

export const PublishersList = () => {
  const [selectedPublishersIds, setSelectedPublishersIds] = useState<string[]>(
    []
  );
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const { groupId } = useParams();
  const user = Users.getCurrent();

  if (!user.admin && user.groupId !== groupId && groupId !== 'unafiliated') {
    return (
      <EmptyState
        header="Vous n'êtes pas autorisés à voir le contenu de ce groupe"
        description="Seul l'administrateur a accès à tous les groupes de prédicaation. Si vous voulez qu'une opération particulière soit éffectuée sur un proclamateur d'un autre groupe, veuillez contacter l'administrateur."
        imageUrl={'/assets/299105_lock_icon.png'}
      />
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <PublishersListHeader
        onBulkDeletePublishers={() => setIsBulkDeleteOpen(true)}
        onBulkEditPublishers={() => setIsBulkEditOpen(true)}
        groupId={groupId || 'unafiliated'}
        selectedPublishersIds={selectedPublishersIds}
      />
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
