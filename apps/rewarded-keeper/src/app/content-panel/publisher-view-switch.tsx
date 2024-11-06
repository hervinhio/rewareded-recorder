import { PublisherModificationView } from './publisher-modification-view';
import { PublishersListGroup } from './publishers-list-group';
import {
  borderRadius as getBorderRadius,
  gridSize as getGridSize,
} from '@atlaskit/theme/constants';
import { token } from '@atlaskit/tokens';
import { N20, N200 } from '@atlaskit/theme/colors';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../data';
import './publisher-view.scss';

interface Props {
  showList: boolean;
  selectedPublishersIds: string[];
  groupId?: string;
  onPublishersSelected?: (ids: string[]) => void;
  onHide?: () => void;
}

const borderRadius = getBorderRadius();
const gridSize = getGridSize();
const style = {
  display: 'flex',
  marginTop: `${gridSize * 2}px`,
  marginBottom: `${gridSize}px`,
  padding: `${gridSize * 4}px`,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  flexGrow: 1,
  backgroundColor: token('color.background.neutral', N20),
  borderRadius: `${borderRadius}px`,
  color: token('color.text.subtlest', N200),
  borderColor: token('color.border.disabled'),
};

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
