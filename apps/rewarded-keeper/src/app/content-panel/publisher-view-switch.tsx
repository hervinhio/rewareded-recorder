import './publisher-view.scss';
import { PublisherModificationView } from './publisher-modification-view';
import { PublishersListGroup } from './publishers-list-group';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../data';

interface Props {
  showList: boolean;
  selectedPublishersIds: string[];
  groupId?: string;
  onPublishersSelected?: (ids: string[]) => void;
  onHide?: () => void;
}

export function PublisherViewSwitch(
  props: Props = {
    showList: false,
    selectedPublishersIds: [],
    groupId: 'unafilliated',
  },
) {
  const publishers = useSelector(
    (state: GlobalState) =>
      state.publishers.byGroup[props.groupId || 'unafiliated'],
    shallowEqual,
  );

  return (
    <>
      {props.showList && (
        <PublishersListGroup
          onPublishersSelected={(pubs) => props.onPublishersSelected?.(pubs)}
          selectedPublishersIds={props.selectedPublishersIds}
          groupId={props.groupId}
        />
      )}
      {!props.showList && (
        <PublisherModificationView
          publisher={{} as any}
          publishers={publishers.filter((p) =>
            props.selectedPublishersIds.includes(p.id || ''),
          )}
          onHide={() => {
            props.onHide?.();
            props.onPublishersSelected?.([]);
          }}
        />
      )}
    </>
  );
}
