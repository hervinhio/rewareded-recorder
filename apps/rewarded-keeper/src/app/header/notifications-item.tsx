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
  makeStyles,
  mergeClasses,
  themeToTokensObject,
} from '@fluentui/react-components';
import { darkTheme, lightTheme, themeMode } from '../theme';
import {
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
  link: {
    textDecoration: 'none',
    color: tokens.colorStatusDangerForeground3,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  icon: {
    height: 'fit-content',
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: '8px',
    marginRight: '8px',
  },
});

export function NotificationsItem(props: Props) {
  const [notif, setNotification] = useState(props.notification);
  const styles = useStyles();
  console.log('The notification', notif);
  return (
    <ListItem
      style={props.style}
      className={mergeClasses(styles.item)}
      onClick={() =>
        Notifications.markAsRead(notif).then((n) => setNotification(n))
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
      return <SubmissionNotificationText />;
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
