import EmptyState from '@atlaskit/empty-state';
import { Notification } from '../data';
import { NotificationsItem } from './notifications-item';
import { ListGroup } from 'react-bootstrap';
import './notifications-popup-content.scss';

interface Props {
  notifications: Notification[];
}

export function NotificationsPopupcontent(props: Props) {
  return (
    <div className="notifications-content">
      <ListGroup style={{ width: '100%' }}>
        {!props.notifications.length && (
          <EmptyState header="Aucune notification pour le moment" />
        )}
        {props.notifications.map((notif) => (
          <NotificationsItem notification={notif} />
        ))}
      </ListGroup>
    </div>
  );
}
