import Popup from '@atlaskit/popup';
import { ButtonItem, MenuGroup, Section } from '@atlaskit/menu';
import { Create } from '@atlaskit/atlassian-navigation';
import { useState } from 'react';
import {
  CreateGroupModal,
  CreatePublisherModal,
  RepportModal,
} from '../comps/modals';
import { TriggerProps } from '@atlaskit/tooltip/dist/types/types';
import { Users } from '../data';

let globalSetShowCreatePublisherModal: (show: boolean) => void;
let globalSetShowCreateGroupModal: (show: boolean) => void;
let globalSetShowCreateReportModal: (show: boolean) => void;

const PopupContent = () => (
  <MenuGroup>
    <Section title={'Entité'}>
      <ButtonItem
        isDisabled={!Users.getCurrent().admin}
        onClick={() => globalSetShowCreatePublisherModal(true)}
      >
        Proclamateur
      </ButtonItem>
      <ButtonItem
        isDisabled={!Users.getCurrent().admin}
        onClick={() => globalSetShowCreateGroupModal(true)}
      >
        Groupe
      </ButtonItem>
      <ButtonItem
        isDisabled={!Users.getCurrent().admin}
        onClick={() => globalSetShowCreateReportModal(true)}
      >
        Rapport
      </ButtonItem>
    </Section>
  </MenuGroup>
);

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
  globalSetShowCreateGroupModal = setShowCreateGroupModal;
  globalSetShowCreatePublisherModal = setShowCreatePublisherModal;
  globalSetShowCreateReportModal = setShowCreateReportModal;

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
      <Create
        buttonTooltip="Créer"
        iconButtonTooltip="Créer"
        onClick={() => onClick()}
        text="Créer"
      />
    </div>
  );
}
