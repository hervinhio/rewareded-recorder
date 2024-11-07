import { Dialogs, Users } from '../data';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import PeopleGroupIcon from '@atlaskit/icon/glyph/people-group';
import PersonIcon from '@atlaskit/icon/glyph/person';
import CalendarFilledIcon from '@atlaskit/icon/glyph/calendar-filled';
import { useDispatch } from 'react-redux';
import { token } from '@atlaskit/tokens';
import {
  Button,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
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
  const style = { color: token('color.text') };

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
