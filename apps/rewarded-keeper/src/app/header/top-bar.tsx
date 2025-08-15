import './top-bar.scss';
import logo from './ic_launcher.png';
import EntitySearch from './search';
import { SkeletonNotificationsBadge } from './notifications-badge';
import { CreateMenu } from './create-menu';
import { ThemeSwitcher } from './theme-swicher';
import {
  Image,
  makeStyles,
  Toolbar,
  ToolbarDivider,
  ToolbarGroup,
} from '@fluentui/react-components';
import { ReactElement } from 'react';
import {
  MultiPermissionGuard,
  PermissionGuard,
} from '../components/permission-guard';
import { Permission } from '../types';
import { Users } from '../data';

interface Props {
  onMenuChange: (menu: string) => void;
  hamburger: ReactElement;
}

let onMenuChange: (menu: string) => void;

const useStyles = makeStyles({
  toolbar: {
    justifyContent: 'space-between',
  },
  logo: {
    width: '32px',
    height: '32px',
  },
  logoGroup: {
    display: 'flex',
    flexDirection: 'row',
  },
});

export function TopBar(props: Props) {
  const styles = useStyles();

  onMenuChange = props.onMenuChange;

  return (
    <Toolbar className={`top-bar ${styles.toolbar}`}>
      <ToolbarGroup className={styles.logoGroup}>
        {props.hamburger}
        <Image
          onClick={() => onMenuChange('home')}
          src={logo}
          alt="Logo"
          className={styles.logo}
        />
        <MultiPermissionGuard
          permissions={[
            Permission.GROUP_MANAGE,
            Permission.PUBLISHER_MANAGE,
            Permission.REPORT_MANAGE,
            Permission.ATTENDANCE_MANAGE,
          ]}
          user={Users.getCurrent()}>
          <ToolbarDivider />
          <CreateMenu />
          <ToolbarDivider />
        </MultiPermissionGuard>
      </ToolbarGroup>

      <ToolbarGroup>
        <ToolbarGroup>
          <ThemeSwitcher />
          <EntitySearch />
          <SkeletonNotificationsBadge />
        </ToolbarGroup>
      </ToolbarGroup>
    </Toolbar>
  );
}
