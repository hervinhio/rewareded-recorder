import { Dialogs, Users } from '../data';
import { useDispatch } from 'react-redux';
import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  themeToTokensObject,
  ToolbarButton,
} from '@fluentui/react-components';
import {
  AddFilled,
  ArrowDownloadFilled,
  CalendarEditFilled,
  PeopleCommunityFilled,
  PersonFilled,
} from '@fluentui/react-icons';

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
        <MenuItem
          icon={<PersonFilled />}
          disabled={!Users.getCurrent().admin}
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleCreatePublisherModal());
          }}>
          Proclamateur
        </MenuItem>
        <MenuItem
          icon={<PeopleCommunityFilled />}
          disabled={!Users.getCurrent().admin}
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleCreateGroupModal());
          }}>
          Groupe
        </MenuItem>
        <MenuItem
          icon={<ArrowDownloadFilled />}
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleDownloadMissingReportsModal());
          }}>
          Liste rapports manquants
        </MenuItem>
        <MenuItem
          icon={<CalendarEditFilled />}
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleAttendanceReportModal());
          }}>
          Rapport d'assistance
        </MenuItem>
      </MenuPopover>
    </Menu>
  );
};
