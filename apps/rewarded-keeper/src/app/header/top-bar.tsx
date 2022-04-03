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
  ProductHome,
} from '@atlaskit/atlassian-navigation';
import { TopNavigation } from '@atlaskit/page-layout';
import { Logo } from './logo';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Users } from '../data';
import { AppDrawer } from '../drawer';
import { Group, Publisher, Repport } from '../types';

fontawesome.library.add(faPlusCircle, faSignOutAlt, faHome, faUsers);

interface Props {
  publishers: Publisher[];
  groups: Group[];
  repports: Repport[];
  currentRepports: Repport[];
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
  const isAdmin = Users.getCurrent().admin;

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
        moreLabel="Plus"
        primaryItems={[]}
        renderProductHome={AppProductHome}
        renderAppSwitcher={() => (
          <AppDrawer
            publishers={props.publishers}
            groups={props.groups}
            repports={props.repports}
            currentRepports={props.currentRepports}
          />
        )}
      />
    </TopNavigation>
  );
}
