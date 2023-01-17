import EmptyState from '@atlaskit/empty-state';
import { PublisherModificationView } from './publisher-modification-view';
import { Group, Publisher } from '../types';

interface Props {
  publisher?: Publisher;
  group?: Group;
  showRepportModal: boolean;
  showModificationView: boolean;
  publisherIdToDelete: string | undefined;
  show: boolean;
  setShowRepportModal: (show: boolean) => void;
  setShowModificationView: (show: boolean) => void;
  onHide: () => void;
  setPublisherIdToDelete: (publisherId: string | undefined) => void;
}

export function PublisherModificationViewSwitch(props: Props) {
  if (!props.show) return null;

  if (!props.publisher) {
    return <EmptyState header="Cet utilisateur semble ne pas exister pas" />;
  }
  return (
    <PublisherModificationView
      publisher={props.publisher}
      onHide={() => props.setShowModificationView(false)}
    />
  );
}
