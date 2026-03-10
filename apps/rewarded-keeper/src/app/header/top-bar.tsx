import './top-bar.scss';
import logo from './ic_launcher.png';
import EntitySearch from './search';
import { SkeletonNotificationsBadge } from './notifications-badge';
import { CreateMenu } from './create-menu';
import { ThemeSwitcher } from './theme-swicher';
import {
  Image,
  makeStyles,
  Select,
  Toolbar,
  ToolbarDivider,
  ToolbarGroup,
} from '@fluentui/react-components';
import { ReactElement } from 'react';
import {
  MultiPermissionGuard,
} from '../components/permission-guard';
import { Permission, Role } from '../types';
import { Users, Congregations, GlobalState } from '../data';
import { useSelector, shallowEqual } from 'react-redux';

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

  const currentUser = Users.getCurrent();
  const isRoot = currentUser?.role === Role.ROOT;

  const { congregations, activeCongregationId } = useSelector(
    (state: GlobalState) => ({
      congregations: state.congregations.congregations,
      activeCongregationId: state.congregations.activeCongregationId,
    }),
    shallowEqual,
  );

  const handleCongregationChange = (congregationId: string) => {
    Congregations.setActive(congregationId || null);
    // Reload all data for the selected congregation
    window.location.reload();
  };

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

        {isRoot && congregations.length > 0 && (
          <>
            <ToolbarDivider />
            <Select
              value={activeCongregationId ?? ''}
              onChange={(_, data) => handleCongregationChange(data.value)}>
              <option value="">Toutes les congrégations</option>
              {congregations.map((cong) => (
                <option key={cong.id} value={cong.id}>
                  {cong.name} ({cong.number})
                </option>
              ))}
            </Select>
          </>
        )}
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
