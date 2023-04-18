import Popup from '@atlaskit/popup';
import { ButtonItem, MenuGroup, Section } from '@atlaskit/menu';
import { useState } from 'react';
import {
  AttendanceReportModal,
  CreateGroupModal,
  CreatePublisherModal,
  DownloadMissingReportsModal,
  RepportModal,
} from '../comps/modals';
import { TriggerProps } from '@atlaskit/tooltip/dist/types/types';
import { Users } from '../data';
import Button from '@atlaskit/button';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import TableIcon from '@atlaskit/icon/glyph/table';
import PeopleGroupIcon from '@atlaskit/icon/glyph/people-group';
import PersonIcon from '@atlaskit/icon/glyph/person';
import CalendarFilledIcon from '@atlaskit/icon/glyph/calendar-filled';

let globalSetShowCreatePublisherModal: (show: boolean) => void;
let globalSetShowCreateGroupModal: (show: boolean) => void;
let globalSetShowCreateReportModal: (show: boolean) => void;
let globalSetShowDownloadMissingReportsModal: (show: boolean) => void;
let globalSetShowAttendanceReportmodal: (show: boolean) => void;

const PopupContent = () => {
  return (
    <MenuGroup>
      <Section title={'Entité'}>
        <ButtonItem
          iconBefore={<PersonIcon label="" />}
          isDisabled={!Users.getCurrent().admin}
          onClick={() => globalSetShowCreatePublisherModal(true)}
        >
          Proclamateur
        </ButtonItem>
        <ButtonItem
          iconBefore={<PeopleGroupIcon label="" />}
          isDisabled={!Users.getCurrent().admin}
          onClick={() => globalSetShowCreateGroupModal(true)}
        >
          Groupe
        </ButtonItem>
        <ButtonItem
          iconBefore={<TableIcon label="" />}
          isDisabled={!Users.getCurrent().admin}
          onClick={() => globalSetShowCreateReportModal(true)}
        >
          Rapport
        </ButtonItem>
        <ButtonItem
          iconBefore={<DownloadIcon label="" />}
          onClick={() => globalSetShowDownloadMissingReportsModal(true)}
        >
          Liste rapports manquants
        </ButtonItem>
        <ButtonItem
          iconBefore={<CalendarFilledIcon label="" />}
          onClick={() => globalSetShowAttendanceReportmodal(true)}
        >
          Rapport d'assistance
        </ButtonItem>
      </Section>
    </MenuGroup>
  );
};

export const CreatePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onClick = () => {
    setIsOpen(!isOpen);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Popup
      placement="bottom-end"
      content={PopupContent}
      isOpen={isOpen}
      onClose={onClose}
      trigger={(triggerProps) => (
        <Trigger triggerProps={triggerProps as any} onClick={onClick} />
      )}
    />
  );
};

function Trigger({
  onClick,
  triggerProps,
}: {
  onClick: () => void;
  triggerProps: TriggerProps;
}) {
  const [showCreatePublisherModal, setShowCreatePublisherModal] =
    useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [showDownloadMissingReportsModal, setShowDownloadMissingReportsModal] =
    useState(false);
  const [showAttendanceReportmodal, setShowAttendanceReportmodal] =
    useState(false);

  globalSetShowCreateGroupModal = setShowCreateGroupModal;
  globalSetShowCreatePublisherModal = setShowCreatePublisherModal;
  globalSetShowCreateReportModal = setShowCreateReportModal;
  globalSetShowDownloadMissingReportsModal = setShowDownloadMissingReportsModal;
  globalSetShowAttendanceReportmodal = setShowAttendanceReportmodal;

  return (
    <div
      {...triggerProps}
      style={{ marginTop: 'auto', marginBottom: 'auto', height: 'fit-content' }}
    >
      {showCreatePublisherModal && (
        <CreatePublisherModal
          show={showCreatePublisherModal}
          onHide={() => setShowCreatePublisherModal(false)}
        />
      )}
      {showCreateGroupModal && (
        <CreateGroupModal
          show={showCreateGroupModal}
          onHide={() => setShowCreateGroupModal(false)}
        />
      )}
      {showCreateReportModal && (
        <RepportModal
          show={showCreateReportModal}
          onHide={() => setShowCreateReportModal(false)}
          publisherId={undefined}
        />
      )}
      {showDownloadMissingReportsModal && (
        <DownloadMissingReportsModal
          show={showDownloadMissingReportsModal}
          onHide={() => setShowDownloadMissingReportsModal(false)}
        />
      )}
      {showAttendanceReportmodal && (
        <AttendanceReportModal
          show={showAttendanceReportmodal}
          mode="create"
          onHide={() => setShowAttendanceReportmodal(false)}
        />
      )}
      <Button
        appearance="primary"
        onClick={() => onClick()}
        iconAfter={<ChevronDownIcon label="" />}
      >
        Créer
      </Button>
    </div>
  );
}
