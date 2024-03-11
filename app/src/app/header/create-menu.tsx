import { useState } from 'react';
import { Dialogs, Users } from '../data';
import Button from '@atlaskit/button';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import TableIcon from '@atlaskit/icon/glyph/table';
import PeopleGroupIcon from '@atlaskit/icon/glyph/people-group';
import PersonIcon from '@atlaskit/icon/glyph/person';
import CalendarFilledIcon from '@atlaskit/icon/glyph/calendar-filled';
import DropdownMenu, {
  CustomTriggerProps,
  DropdownItem,
  DropdownItemGroup,
} from '@atlaskit/dropdown-menu';
import { useDispatch } from 'react-redux';
import { token } from '@atlaskit/tokens';

export const CreateMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const onClick = () => {
    setIsOpen(!isOpen);
  };

  const style = { color: token('color.text') };
  return (
    <DropdownMenu
      isOpen={isOpen}
      trigger={({ triggerRef, ...props }: CustomTriggerProps) => (
        <Button
          style={{ marginTop: 10 }}
          appearance="primary"
          ref={triggerRef}
          {...props}
          onClick={onClick}
          isSelected={isOpen}
          iconAfter={<ChevronDownIcon label="" />}
        >
          Créer
        </Button>
      )}
    >
      <DropdownItemGroup>
        <DropdownItem
          elemBefore={
            <PersonIcon primaryColor={token('color.text')} label="" />
          }
          isDisabled={!Users.getCurrent().admin}
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleCreatePublisherModal());
            setIsOpen(false);
          }}
        >
          <span style={style}>Proclamateur</span>
        </DropdownItem>
        <DropdownItem
          elemBefore={
            <PeopleGroupIcon primaryColor={token('color.text')} label="" />
          }
          isDisabled={!Users.getCurrent().admin}
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleCreateGroupModal());
            setIsOpen(false);
          }}
        >
          <span style={style}>Groupe</span>
        </DropdownItem>
        <DropdownItem
          elemBefore={<TableIcon primaryColor={token('color.text')} label="" />}
          isDisabled={!Users.getCurrent().admin}
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleCreateReportModal());
            setIsOpen(false);
          }}
        >
          <span style={style}>Rapport</span>
        </DropdownItem>
        <DropdownItem
          elemBefore={
            <DownloadIcon primaryColor={token('color.text')} label="" />
          }
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleDownloadMissingReportsModal());
            setIsOpen(false);
          }}
        >
          <span style={style}>Liste rapports manquants</span>
        </DropdownItem>
        <DropdownItem
          elemBefore={
            <CalendarFilledIcon primaryColor={token('color.text')} label="" />
          }
          onClick={() => {
            dispatch(Dialogs.slice.actions.toggleAttendanceReportModal());
            setIsOpen(false);
          }}
        >
          <span style={style}>Rapport d'assistance</span>
        </DropdownItem>
      </DropdownItemGroup>
    </DropdownMenu>
  );
};
