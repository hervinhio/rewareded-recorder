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
import { CreateMenu } from './create-menu';
import { token } from '@atlaskit/tokens';

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
  const surfaceBg = token('elevation.surface.overlay');

  onMenuChange = props.onMenuChange;
  return (
    <TopNavigation
      isFixed={true}
      id="confluence-navigation"
      skipLinkTitle="Confluence Navigation"
      css={{ background: surfaceBg }}
    >
      <AtlassianNavigation
        label="site"
        moreLabel="Plus"
        renderProductHome={AppProductHome}
        renderSearch={EntitySearch}
        renderAppSwitcher={() => <AppDrawer />}
        renderNotifications={() => <SkeletonNotificationsBadge />}
        renderCreate={() => <CreateMenu />}
        css={{ background: surfaceBg }}
        primaryItems={[]}
      />
    </TopNavigation>
  );
}
