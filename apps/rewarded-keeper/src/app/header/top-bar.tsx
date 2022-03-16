import { auth, isAuthenticated } from '../auth';
import fontawesome from '@fortawesome/fontawesome';
import {
  faHome,
  faPlusCircle,
  faSignOutAlt,
  faUsers,
} from '@fortawesome/fontawesome-free-solid';
import {
  AtlassianNavigation,
  PrimaryButton,
  ProductHome,
} from '@atlaskit/atlassian-navigation';
import { TopNavigation } from '@atlaskit/page-layout';
import { Logo } from './logo';
import { CreatePopup } from './create-popup';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { UserPopup } from './user-popup';
import { currentUserHasPermission } from '../types';
import { Link, BrowserRouter as Router } from 'react-router-dom';

fontawesome.library.add(faPlusCircle, faSignOutAlt, faHome, faUsers);

interface Props {
  onMenuChange: (menu: string) => void;
}

let onMenuChange: (menu: string) => void;

const AppProductHome = () => (
  <ProductHome
    onClick={() => onMenuChange('home')}
    icon={Logo}
    logo={Logo}
    siteTitle="Rapports"
  />
);

export function TopBar(props: Props) {
  const [user, setUser] = useState<User | null>(null);
  const isAdmin = currentUserHasPermission('admin');

  onMenuChange = props.onMenuChange;

  useEffect(() => {
    isAuthenticated().then(
      () => setUser(auth.currentUser),
      (error) => console.log(error)
    );
  });

  return (
    <TopNavigation
      isFixed={true}
      id="confluence-navigation"
      skipLinkTitle="Confluence Navigation"
    >
      <AtlassianNavigation
        label="site"
        moreLabel="More"
        primaryItems={[
          <Link style={{ textDecoration: 'none', color: '#fff' }} to={'/'}>
            <PrimaryButton onClick={() => onMenuChange('home')} isHighlighted>
              Acceuil
            </PrimaryButton>
          </Link>,
          <UserPopup />,
        ]}
        renderProductHome={AppProductHome}
        renderCreate={isAdmin ? CreatePopup : undefined}
      />
    </TopNavigation>
  );
}
