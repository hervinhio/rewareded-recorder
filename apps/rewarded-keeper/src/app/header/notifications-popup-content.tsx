import EmptyState from '@atlaskit/empty-state';
import { Notification } from '../data';
import { NotificationsItem } from './notifications-item';
import { useEffect, useRef } from 'react';
import { makeStyles } from '@fluentui/react-components';
import { List } from '@fluentui/react-list-preview';

interface Props {
  notifications: Notification[];
  onOutsideClick: () => void;
}


export function NotificationsPopupcontent(props: Props) {
  return (
    <div>
      {!props.notifications.length && (
        <EmptyState header="Aucune notification pour le moment" />
      )}
      <List>
        {props.notifications.map((notif) => (
          <NotificationsItem notification={notif} key={notif.id} />
        ))}
      </List>
    </div>
  );
}
