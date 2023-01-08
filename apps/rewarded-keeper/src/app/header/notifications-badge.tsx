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

export function SkeletonNotificationsBadge(props: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    Notifications.get().then(
      (notifications) => setNotifications(notifications),
      console.error
    );
  }, []);

  const triggerIcon = notifications.length ? (
    <NotificationIcon label="Notifications" />
  ) : (
    <NotificationDirectIcon label="Notifications" />
  );
  return (
    <Popup
      placement="bottom-start"
      content={() => (
        <NotificationsPopupcontent notifications={notifications} />
      )}
      isOpen={isOpen}
      trigger={(triggerProps) => (
        <IconButton
          {...triggerProps}
          icon={triggerIcon}
          tooltip="Notification"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}
    />
  );
}
