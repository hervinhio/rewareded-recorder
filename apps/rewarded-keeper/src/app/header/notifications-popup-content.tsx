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
      <EmptyState header="Aucune notification pour le moment" />
    </div>
  );
}
