import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublisherViewSwitch } from './publisher-view-switch';
import { PublishersListHeader } from './publishers-list-header';

export const PublishersList = () => {
  const [selectedPublishersIds, setSelectedPublishersIds] = useState<string[]>(
    []
  );
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const { groupId } = useParams();

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
