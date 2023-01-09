import EmptyState from '@atlaskit/empty-state';
import { Notification } from '../data';
import { NotificationsItem } from './notifications-item';
import { ListGroup } from 'react-bootstrap';
import './notifications-popup-content.scss';
import { useEffect, useRef } from 'react';

interface Props {
  notifications: Notification[];
  onOutsideClick: () => void;
}

export function NotificationsPopupcontent(props: Props) {
  const ref = useRef<HTMLDivElement>();
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (ref?.current && !ref.current.contains(event.target as Node)) {
        props.onOutsideClick();
      }
    };

    document.addEventListener('click', handleDocumentClick);

    return () => document.removeEventListener('click', handleDocumentClick);
  }, [ref]);

  return (
    <div className="notifications-content" ref={ref as any}>
      <ListGroup style={{ width: '100%' }}>
        {!props.notifications.length && (
          <EmptyState header="Aucune notification pour le moment" />
        )}
        {props.notifications.map((notif, id) => (
          <NotificationsItem notification={notif} key={id} />
        ))}
      </ListGroup>
    </div>
  );
}
