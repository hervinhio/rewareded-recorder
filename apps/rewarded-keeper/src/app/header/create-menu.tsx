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
} from '@atlaskit/dropdown-menu';
import { useDispatch } from 'react-redux';
import { token } from '@atlaskit/tokens';

export const CreateMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const onClick = () => {
    setIsOpen(!isOpen);
  };

  const style = { backgroundColor: token('elevation.surface.overlay') };
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
      <DropdownItem
        elemBefore={<PersonIcon label="" />}
        isDisabled={!Users.getCurrent().admin}
        onClick={() => {
          dispatch(Dialogs.slice.actions.toggleCreatePublisherModal());
          setIsOpen(false);
        }}
        css={style}
      >
        Proclamateur
      </DropdownItem>
      <DropdownItem
        elemBefore={<PeopleGroupIcon label="" />}
        isDisabled={!Users.getCurrent().admin}
        onClick={() => {
          dispatch(Dialogs.slice.actions.toggleCreateGroupModal());
          setIsOpen(false);
        }}
      >
        Groupe
      </DropdownItem>
      <DropdownItem
        elemBefore={<TableIcon label="" />}
        isDisabled={!Users.getCurrent().admin}
        onClick={() => {
          dispatch(Dialogs.slice.actions.toggleCreateReportModal());
          setIsOpen(false);
        }}
      >
        Rapport
      </DropdownItem>
      <DropdownItem
        elemBefore={<DownloadIcon label="" />}
        onClick={() => {
          dispatch(Dialogs.slice.actions.toggleDownloadMissingReportsModal());
          setIsOpen(false);
        }}
      >
        Liste rapports manquants
      </DropdownItem>
      <DropdownItem
        elemBefore={<CalendarFilledIcon label="" />}
        onClick={() => {
          dispatch(Dialogs.slice.actions.toggleAttendanceReportModal());
          setIsOpen(false);
        }}
      >
        Rapport d'assistance
      </DropdownItem>
    </DropdownMenu>
  );
};
