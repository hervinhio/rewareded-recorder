import { GlobalState, Notifications } from '../data';
import { useEffect, useState } from 'react';
import { NotificationsPopupcontent } from './notifications-popup-content';
import { useSelector } from 'react-redux';
import {
  Popover,
  PopoverSurface,
  PopoverTrigger,
  ToolbarButton,
  Tooltip,
} from '@fluentui/react-components';
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
    <Popover withArrow>
      <PopoverTrigger disableButtonEnhancement>
        <Tooltip relationship="description" content="Notifications">
          <ToolbarButton icon={<AlertFilled />} aria-label="Notification" />
        </Tooltip>
      </PopoverTrigger>
      <PopoverSurface>
        <NotificationsPopupcontent
          notifications={notifications}
          onOutsideClick={() => setIsOpen(false)}
        />
      </PopoverSurface>
    </Popover>
  );
}
