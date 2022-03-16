import Popup from '@atlaskit/popup';
import { ButtonItem, MenuGroup, Section } from '@atlaskit/menu';
import { Create } from '@atlaskit/atlassian-navigation';
import { useState } from 'react';
import { CreateGroupModal, CreatePublisherModal } from '../modals';

let globalSetShowCreatePublisherModal: (show: boolean) => void;
let globalSetShowCreateGroupModal: (show: boolean) => void;

const PopupContent = () => (
  <MenuGroup>
    <Section title={'Entité'}>
      <ButtonItem onClick={() => globalSetShowCreatePublisherModal(true)}>
        Proclamateur
      </ButtonItem>
      <ButtonItem onClick={() => globalSetShowCreateGroupModal(true)}>
        Groupe
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
      placement="bottom-start"
      content={PopupContent}
      isOpen={isOpen}
      onClose={onClose}
      trigger={() => {
        const [showCreatePublisherModal, setShowCreatePublisherModal] =
          useState(false);
        const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
        globalSetShowCreateGroupModal = setShowCreateGroupModal;
        globalSetShowCreatePublisherModal = setShowCreatePublisherModal;

        return (
          <>
            {showCreatePublisherModal && (
              <CreatePublisherModal
                show={showCreatePublisherModal}
                groupId="unafiliated"
                onHide={() => setShowCreatePublisherModal(false)}
              />
            )}
            {showCreateGroupModal && (
              <CreateGroupModal
                show={showCreateGroupModal}
                onHide={() => setShowCreateGroupModal(false)}
              />
            )}
            <Create
              buttonTooltip="Créer"
              iconButtonTooltip="Créer"
              onClick={() => onClick()}
              text="Créer"
            />
          </>
        );
      }}
    />
  );
};
