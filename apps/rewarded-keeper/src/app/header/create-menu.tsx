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
import { darkTheme, lightTheme, themeMode } from '../theme';

const tokens = themeToTokensObject(
  themeMode === 'light' ? lightTheme : darkTheme,
);

export const CreateMenu = () => {
  const dispatch = useDispatch();
  const style = { color: tokens.colorNeutralStroke1 };

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
          <span style={style}>Proclamateur</span>
        </MenuItem>
        <MenuItem
          icon={<PeopleCommunityFilled />}
          disabled={!Users.getCurrent().admin}
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleCreateGroupModal());
          }}>
          <span style={style}>Groupe</span>
        </MenuItem>
        <MenuItem
          icon={<ArrowDownloadFilled />}
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleDownloadMissingReportsModal());
          }}>
          <span style={style}>Liste rapports manquants</span>
        </MenuItem>
        <MenuItem
          icon={<CalendarEditFilled />}
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleAttendanceReportModal());
          }}>
          <span style={style}>Rapport d'assistance</span>
        </MenuItem>
      </MenuPopover>
    </Menu>
  );
};
