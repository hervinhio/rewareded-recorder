import { Notification, NotificationType } from '../data';
import { ListGroupItem } from 'react-bootstrap';
import PresenceActiveIcon from '@atlaskit/icon/glyph/presence-active';
import PresenceUnavailableIcon from '@atlaskit/icon/glyph/presence-unavailable';
import './notifications-item.scss';
import { Link } from 'react-router-dom';

interface Props {
  notification: Notification;
}

export function NotificationsItem(props: Props) {
  return (
    <ListGroupItem>
      {props.notification.unread && <PresenceActiveIcon label="" />}
      {!props.notification.unread && <PresenceUnavailableIcon label="" />}
      {notificationToText(props.notification)}
    </ListGroupItem>
  );
}


function notificationToText(notification: Notification) {
  switch(notification.type) {
    case NotificationType.ReportCreated:
      return <span><Link to={`/users/${notification.author.id}`}>{notification.author.name}</Link> a enregistré un rapport au nom de <Link to={`/publishers/${notification.publisher.id}`}>{notification.publisher.name}</Link></span>;
    default:
      return <span>Une action inconnue est survenue</span>;
  }
}
