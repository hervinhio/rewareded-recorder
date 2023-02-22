import Popup from '@atlaskit/popup';
import { ButtonItem, MenuGroup, Section } from '@atlaskit/menu';
import { useEffect, useState } from 'react';
import { PrimaryButton } from '@atlaskit/atlassian-navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from 'firebase/auth';
import { auth, isAuthenticated, logout } from '../auth';
import { Flags } from '../data/flags';

const PopupContent = () => (
  <MenuGroup>
    <Section title={'Options utilisateur'}>
      <ButtonItem onClick={() => logout().then(() => window.location.reload())}>
        Se déconnecter
      </ButtonItem>
    </Section>
  </MenuGroup>
);

export const UserPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    isAuthenticated().then(
      () => setUser(auth.currentUser),
      Flags.raiseError
    );
  });

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
        return (
          <PrimaryButton onClick={onClick}>
            <FontAwesomeIcon icon="user" />
            &nbsp;{user?.displayName?.split(' ')[0]}
          </PrimaryButton>
        );
      }}
    />
  );
};
