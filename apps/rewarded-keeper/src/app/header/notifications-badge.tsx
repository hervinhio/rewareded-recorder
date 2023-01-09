import { Notification, Notifications } from '../data';
import NotificationIcon from '@atlaskit/icon/glyph/notification';
import Popup from '@atlaskit/popup';
import { useEffect, useState } from 'react';
import { NotificationsPopupcontent } from './notifications-popup-content';
import { IconButton } from '@atlaskit/atlassian-navigation';
import NotificationDirectIcon from '@atlaskit/icon/glyph/notification-direct';

interface Props {
  label?: string;
}

interface TriggerIconProps {
  notifications: Notification[];
}

export function SkeletonNotificationsBadge(props: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      Notifications.get().then(
        (notifications) => setNotifications(notifications),
        console.error
      );
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isOpen]);

  return (
    <Popup
      placement="bottom-start"
      content={() => (
        <NotificationsPopupcontent
          notifications={notifications}
          onOutsideClick={() => setIsOpen(false)}
        />
      )}
      isOpen={isOpen}
      trigger={(triggerProps) => (
        <IconButton
          {...triggerProps}
          icon={<TriggerIcon notifications={notifications} />}
          tooltip="Notification"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}
    />
  );
}

function TriggerIcon(props: TriggerIconProps) {
  return props.notifications.length ? (
    <NotificationIcon
      label="Notifications"
      primaryColor={
        props.notifications.some((n) => n.unread) ? '#FF5630' : '#172B4D'
      }
    />
  ) : (
    <NotificationDirectIcon label="Notifications" />
  );
}
