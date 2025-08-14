import { Notification } from '../data';
import { NotificationsItem } from './notifications-item';
import { List } from '@fluentui/react-list-preview';
import { FixedSizeList } from 'react-window';
import { forwardRef } from 'react';
import { EmptyState } from '../comps/empty-state';

interface Props {
  notifications: Notification[];
  onOutsideClick: () => void;
}

const NotificationsList = forwardRef<HTMLUListElement>(
  (props: React.ComponentProps<typeof List>, ref) => (
    <List aria-label="Notificaitons" tabIndex={0} {...props} ref={ref} />
  ),
);

export function NotificationsPopupcontent(props: Props) {
  if (props.notifications.length === 0) {
    return (
      <div>
        <EmptyState header="Aucune notification pour le moment" />
      </div>
    );
  }

  return (
    <div style={{ width: '400px', maxHeight: '300px', overflow: 'auto' }}>
      <FixedSizeList
        height={Math.min(300, props.notifications.length * 64)}
        itemCount={props.notifications.length}
        itemSize={64}
        itemData={props.notifications}
      >
        {({ index, style, data }) => (
          <NotificationsItem
            notification={data[index]}
            style={style}
          />
        )}
      </FixedSizeList>
    </div>
  );
}
