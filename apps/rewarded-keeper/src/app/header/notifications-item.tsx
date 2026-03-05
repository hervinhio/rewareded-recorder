import {
  GlobalState,
  Notification,
  Notifications,
  NotificationType,
  Users,
} from '../data';
import { Link } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { CSSProperties, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { ListItem } from '@fluentui/react-list-preview';
import {
  Button,
  makeStyles,
  mergeClasses,
  themeToTokensObject,
  tokens as fluentTokens,
} from '@fluentui/react-components';
import { darkTheme, lightTheme, themeMode } from '../theme';
import {
  DeleteRegular,
  PresenceAvailableRegular,
  PresenceBusyFilled,
} from '@fluentui/react-icons';

interface Props {
  notification: Notification;
  style: CSSProperties;
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

const tokens = themeToTokensObject(
  themeMode === 'light' ? lightTheme : darkTheme,
);

const useStyles = makeStyles({
  item: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    paddingRight: '8px',
    height: '64px',
    maxHeight: '64px',
    cursor: 'pointer',
    borderBottom: `solid 1px ${tokens.colorNeutralStroke3}`,
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
  },
  read: {
    opacity: 0.5,
  },
  link: {
    textDecoration: 'none',
    color: tokens.colorStatusDangerForeground3,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  icon: {
    height: 'fit-content',
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: '8px',
    marginRight: '8px',
  },
  deleteBtn: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 'auto',
    flexShrink: 0,
  },
});

export function NotificationsItem(props: Props) {
  const [notif, setNotification] = useState(props.notification);
  const [deleted, setDeleted] = useState(false);
  const styles = useStyles();

  if (deleted) return null;

  return (
    <ListItem
      style={props.style}
      className={mergeClasses(styles.item, !notif.unread ? styles.read : undefined)}
      onClick={() =>
        notif.unread
          ? Notifications.markAsRead(notif).then((n) => setNotification(n))
          : undefined
      }>
      <div className={styles.icon}>
        {notif.unread && (
          <PresenceBusyFilled color={tokens.colorBrandBackground} />
        )}
        {!notif.unread && (
          <PresenceAvailableRegular color={tokens.colorBrandBackground} />
        )}
      </div>
      <div className={styles.details}>
        <span>{notificationToText(notif)}</span>
        <span className="time">{getNotificationTimeAsText(notif.date)}</span>
      </div>
      {!notif.unread && (
        <Button
          className={styles.deleteBtn}
          appearance="subtle"
          size="small"
          icon={<DeleteRegular />}
          aria-label="Supprimer la notification"
          onClick={(e) => {
            e.stopPropagation();
            Notifications.deleteNotification(notif).then(() => setDeleted(true));
          }}
        />
      )}
    </ListItem>
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
      return <SubmissionNotificationText notification={notification} />;
    case NotificationType.PublisherCreated:
      return (
        <NotificationText
          notification={notification}
          intermediateText="a créé le proclamateur"
        />
      );
    case NotificationType.PublisherUpdated:
      return (
        <NotificationText
          notification={notification}
          intermediateText="a modifié le proclamateur"
        />
      );
    case NotificationType.PublisherDeleted:
      return (
        <NotificationText
          notification={notification}
          intermediateText="a supprimé le proclamateur"
        />
      );
    case NotificationType.PublisherMoved:
      return <PublisherMovedNotificationText notification={notification} />;
    default:
      return <span>Une action inconnue est survenue</span>;
  }
}

function NotificationText(props: NotificationTextProps) {
  const sytles = useStyles();

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
        <Link
          className={sytles.link}
          to={`/users/${props.notification.author.id}`}>
          {props.notification.author.name}
        </Link>
      )}
      {!user.admin && <span>{props.notification.author.name}</span>}{' '}
      {props.intermediateText}{' '}
      <Link
        className={sytles.link}
        to={`/groups/${group?.id || 'unafiliated'}/${publisher?.id}`}>
        {props.notification.publisher.name}
      </Link>
    </span>
  );
}

function getNotificationTimeAsText(date: Timestamp | Date) {
  const actualDate = date instanceof Timestamp ? date.toDate() : date;
  const diff = getTimeDiffFromNow(actualDate);

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

function SubmissionNotificationText({ notification }: { notification: Notification }) {
  return (
    <span>
      {notification.author.name
        ? `${notification.author.name} a soumis tous les rapports au Béthel`
        : "L'administrateur a soumis tous les rapports au Béthel"}
    </span>
  );
}

function PublisherMovedNotificationText({ notification }: { notification: Notification }) {
  const styles = useStyles();
  const { publisher, fromGroup, toGroup } = useSelector((state: GlobalState) => {
    const publisher = state.publishers.publishers.find(
      (p) => p.id === notification.publisher.id,
    );
    const fromGroupId = notification.meta?.fromGroupId as string | undefined;
    const toGroupId = notification.meta?.toGroupId as string | undefined;
    return {
      publisher,
      fromGroup: state.groups.groups.find((g) => g.id === fromGroupId),
      toGroup: state.groups.groups.find((g) => g.id === toGroupId),
    };
  }, shallowEqual);

  return (
    <span>
      <span>{notification.author.name}</span>{' '}
      a déplacé le proclamateur{' '}
      <Link
        className={styles.link}
        to={`/groups/${publisher?.groupId || 'unafiliated'}/${publisher?.id}`}>
        {notification.publisher.name}
      </Link>{' '}
      {fromGroup ? `du groupe ${fromGroup.name}` : ''}{' '}
      {toGroup ? `vers le groupe ${toGroup.name}` : ''}
    </span>
  );
}
