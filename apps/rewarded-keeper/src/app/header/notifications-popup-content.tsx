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
  return (
    <div>
      {!props.notifications.length && (
        <EmptyState header="Aucune notification pour le moment" />
      )}
      <FixedSizeList<Notification[]>
        height={400}
        itemCount={props.notifications.length}
        itemSize={64}
        itemData={props.notifications}
        width={400}
        outerElementType={NotificationsList}>
        {({ index, style, data }) => (
          <NotificationsItem
            style={style}
            notification={data[index] as unknown as Notification}
            aria-setsize={props.notifications.length}
            aria-posinset={index + 1}
          />
        )}
      </FixedSizeList>
    </div>
  );
}
