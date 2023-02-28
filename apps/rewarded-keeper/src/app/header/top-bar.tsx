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
import { AppDrawer } from '../drawer';
import EntitySearch from './search';
import { SkeletonNotificationsBadge } from './notifications-badge';
import { CreatePopup } from './create-popup';

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
  onMenuChange = props.onMenuChange;

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
        renderSearch={EntitySearch}
        renderAppSwitcher={() => <AppDrawer />}
        renderNotifications={() => <SkeletonNotificationsBadge />}
        renderCreate={() => <CreatePopup />}
      />
    </TopNavigation>
  );
}
