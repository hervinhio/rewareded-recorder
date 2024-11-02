import { GlobalState, Notifications } from '../data';
import Popup from '@atlaskit/popup';
import { useEffect, useState } from 'react';
import { NotificationsPopupcontent } from './notifications-popup-content';
import { useSelector } from 'react-redux';
import { ToolbarButton } from '@fluentui/react-components';
import { AlertFilled } from '@fluentui/react-icons';

interface Props {
  label?: string;
}

export function SkeletonNotificationsBadge(props: Props) {
  const notifications = useSelector(
    (state: GlobalState) => state.notifications.notifications,
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
        <ToolbarButton
          {...triggerProps}
          icon={<AlertFilled />}
          title="Notification"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}
    />
  );
}
