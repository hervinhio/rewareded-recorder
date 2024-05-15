import {
  GlobalState,
  Notification,
  Notifications,
  NotificationType,
  Users,
} from '../data';
import { ListGroupItem } from 'react-bootstrap';
import PresenceActiveIcon from '@atlaskit/icon/glyph/presence-active';
import PresenceUnavailableIcon from '@atlaskit/icon/glyph/presence-unavailable';
import './notifications-item.scss';
import { Link } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

interface Props {
  notification: Notification;
}

interface NotificationTextProps {
  notification: Notification;
  intermediateText: string;
}

interface TimeDiff {
  count: number;
  unit:
    | 'seconde'
    | 'minute'
    | 'heure'
    | 'jour'
    | 'mois'
    | 'année'
    | 'maintenant';
}

export function NotificationsItem(props: Props) {
  const [notif, setNotification] = useState(props.notification);
  return (
    <ListGroupItem
      className={`notifications-item${notif.unread ? ' unread' : ''}`}
      onClick={() =>
        Notifications.markAsRead(notif).then((n) => setNotification(n))
      }
    >
      <div className="notification-item-content">
        <div className={`icon${notif.unread ? ' unread' : ''}`}>
          {notif.unread && <PresenceActiveIcon label="" />}
          {!notif.unread && <PresenceUnavailableIcon label="" />}
        </div>
        <div className="details">
          <span>{notificationToText(notif)}</span>
          <span className="time">{getNotificationTimeAsText(notif.date)}</span>
        </div>
      </div>
    </ListGroupItem>
  );
}

function notificationToText(notification: Notification) {
  switch (notification.type) {
    case NotificationType.ReportCreated:
      return (
        <NotificationText
          notification={notification}
          intermediateText="a créé un rapport pour le compte de"
        />
      );
    case NotificationType.ReportDeleted:
      return (
        <NotificationText
          notification={notification}
          intermediateText="a supprimé un rapport appartenant à"
        />
      );
    case NotificationType.ReportUpdated:
      return (
        <NotificationText
          notification={notification}
          intermediateText="à modifié un rapport appartenant à"
        />
      );
    case NotificationType.ReportsSubmitted:
      return <SubmissionNotificationText />;
    default:
      return <span>Une action inconnue est survenue</span>;
  }
}

function NotificationText(props: NotificationTextProps) {
  const { publisher, group } = useSelector((state: GlobalState) => {
    const publisher = state.publishers.publishers.find(
      (p) => p.id === props.notification.publisher.id,
    );
    return {
      publisher,
      group: state.groups.groups.find(
        (g) => publisher?.groupId || 'unafiliated',
      ),
    };
  }, shallowEqual);
  const user = Users.getCurrent();

  return (
    <span>
      {user.admin && (
        <Link to={`/users/${props.notification.author.id}`}>
          {props.notification.author.name}
        </Link>
      )}
      {!user.admin && <span>{props.notification.author.name}</span>}{' '}
      {props.intermediateText}{' '}
      <Link to={`/groups/${group?.id || 'unafiliated'}/${publisher?.id}`}>
        {props.notification.publisher.name}
      </Link>
    </span>
  );
}

function getNotificationTimeAsText(date: Timestamp) {
  const diff = getTimeDiffFromNow(date.toDate());

  if (diff.unit === 'maintenant') {
    return <span>Maintenant</span>;
  }

  return (
    <span>
      Il y a {diff.count} {diff.unit}(s)
    </span>
  );
}

function getTimeDiffFromNow(date: Date): TimeDiff {
  const now = new Date();
  const yearsDiff = now.getFullYear() - date.getFullYear();

  if (yearsDiff) {
    return {
      count: yearsDiff,
      unit: 'année',
    };
  }

  const monthsDiff = now.getMonth() - date.getMonth();
  if (monthsDiff) {
    return {
      count: monthsDiff,
      unit: 'mois',
    };
  }

  const daysDiff = now.getDate() - date.getDate();
  if (daysDiff) {
    return {
      count: daysDiff,
      unit: 'jour',
    };
  }

  const hoursDiff = now.getHours() - date.getHours();
  if (hoursDiff) {
    return {
      count: hoursDiff,
      unit: 'heure',
    };
  }

  const secondsDiff = Math.abs(now.getSeconds() - date.getSeconds());
  if (secondsDiff) {
    return {
      count: secondsDiff,
      unit: 'seconde',
    };
  }

  return {
    count: 0,
    unit: 'maintenant',
  };
}

function SubmissionNotificationText() {
  return <span>L'administrateur a soumis tous les raports au Béthel</span>;
}
