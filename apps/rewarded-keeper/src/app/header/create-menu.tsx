import { Dialogs, Users } from '../data';
import { useDispatch } from 'react-redux';
import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  ToolbarButton,
} from '@fluentui/react-components';
import {
  AddFilled,
  ArrowDownloadFilled,
  CalculatorArrowClockwiseFilled,
  CalendarEditFilled,
  PeopleCommunityFilled,
  PersonFilled,
} from '@fluentui/react-icons';
import { PermissionGuard } from '../components/permission-guard';
import { Permission, Role } from '../types';

export const CreateMenu = () => {
  const dispatch = useDispatch();

  return (
    <Menu>
      <MenuTrigger>
        <ToolbarButton appearance="primary" icon={<AddFilled />}>
          Créer
        </ToolbarButton>
      </MenuTrigger>
      <MenuPopover>
        <PermissionGuard
          permission={Permission.PUBLISHER_MANAGE}
          user={Users.getCurrent()}>
          <MenuItem
            icon={<PersonFilled />}
            onClick={() => {
              dispatch(Dialogs.slice.actions.toggleCreatePublisherModal());
            }}>
            Proclamateur
          </MenuItem>
        </PermissionGuard>
        <PermissionGuard
          permission={Permission.GROUP_MANAGE}
          user={Users.getCurrent()}>
          <MenuItem
            icon={<PeopleCommunityFilled />}
            onClick={() => {
              dispatch(Dialogs.slice.actions.toggleCreateGroupModal());
            }}>
            Groupe
          </MenuItem>
        </PermissionGuard>
        <PermissionGuard
          permission={Permission.REPORT_MANAGE}
          user={Users.getCurrent()}>
          <MenuItem
            icon={<ArrowDownloadFilled />}
            onClick={() => {
              dispatch(
                Dialogs.slice.actions.toggleDownloadMissingReportsModal(),
              );
            }}>
            Liste rapports manquants
          </MenuItem>
        </PermissionGuard>
        <PermissionGuard
          permission={Permission.ATTENDANCE_MANAGE}
          user={Users.getCurrent()}>
          <MenuItem
            icon={<CalendarEditFilled />}
            onClick={() => {
              dispatch(Dialogs.slice.actions.toggleAttendanceReportModal());
            }}>
            Rapport d'assistance
          </MenuItem>
        </PermissionGuard>
        {(Users.getCurrent().role === Role.ADMIN ||
          Users.getCurrent().role === Role.ROOT) && (
          <MenuItem
            icon={<CalculatorArrowClockwiseFilled />}
            onClick={() => {
              dispatch(Dialogs.slice.actions.toggleRefreshDialog());
            }}>
            Recalcul
          </MenuItem>
        )}
      </MenuPopover>
    </Menu>
  );
};
