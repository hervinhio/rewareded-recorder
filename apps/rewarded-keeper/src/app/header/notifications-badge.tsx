import { GlobalState, Notification, Notifications } from '../data';
import NotificationIcon from '@atlaskit/icon/glyph/notification';
import Popup from '@atlaskit/popup';
import { useEffect, useState } from 'react';
import { NotificationsPopupcontent } from './notifications-popup-content';
import { IconButton } from '@atlaskit/atlassian-navigation';
import NotificationDirectIcon from '@atlaskit/icon/glyph/notification-direct';
import { useSelector } from 'react-redux';
import { token } from '@atlaskit/tokens';

interface Props {
  label?: string;
}

interface TriggerIconProps {
  notifications: Notification[];
}

export function SkeletonNotificationsBadge(props: Props) {
  const notifications = useSelector(
    (state: GlobalState) => state.notifications.notifications
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(Notifications.get, 2000);

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
        props.notifications.some((n) => n.unread) ? token('color.icon.danger') : token('color.icon')
      }
    />
  ) : (
    <NotificationDirectIcon label="Notifications" />
  );
}
