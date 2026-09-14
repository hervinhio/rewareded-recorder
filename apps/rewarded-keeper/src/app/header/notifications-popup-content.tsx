import { Notification } from '../data';
import { NotificationsItem } from './notifications-item';
import { List } from '@fluentui/react-list';
import { FixedSizeList } from 'react-window';
import { forwardRef, useState } from 'react';
import { EmptyState } from '../comps/empty-state';
import { Switch, makeStyles, tokens, Text } from '@fluentui/react-components';

interface Props {
  notifications: Notification[];
  onOutsideClick: () => void;
}

const NotificationsList = forwardRef<HTMLUListElement>(
  (props: React.ComponentProps<typeof List>, ref) => (
    <List aria-label="Notificaitons" tabIndex={0} {...props} ref={ref} />
  ),
);

const useStyles = makeStyles({
  container: {
    width: '400px',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

export function NotificationsPopupcontent(props: Props) {
  const [hideRead, setHideRead] = useState(false);
  const styles = useStyles();

  const visibleNotifications = hideRead
    ? props.notifications.filter((n) => n.unread)
    : props.notifications;

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Text weight="semibold">Notifications</Text>
        <Switch
          label="Non lues seulement"
          checked={hideRead}
          onChange={(_, data) => setHideRead(data.checked)}
        />
      </div>
      {visibleNotifications.length === 0 ? (
        <EmptyState header="Aucune notification pour le moment" />
      ) : (
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {/* @ts-ignore-next-line */}
          <FixedSizeList<any>
            height={Math.min(300, visibleNotifications.length * 64)}
            itemCount={visibleNotifications.length}
            itemSize={64}
            width={400}
            itemData={visibleNotifications}>
            {({ index, style, data }) => (
              <NotificationsItem notification={data[index]} style={style} />
            )}
          </FixedSizeList>
        </div>
      )}
    </div>
  );
}
