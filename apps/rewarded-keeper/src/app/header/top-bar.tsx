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
import { Group, Publisher, Repport } from '../types';
import EntitySearch from './search';
import { SkeletonNotificationsBadge } from './notifications-badge';
import NotificationIcon from '@atlaskit/icon/glyph/notification';

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
        renderAppSwitcher={() => (
          <AppDrawer
            publishers={props.publishers}
            groups={props.groups}
            repports={props.repports}
            currentRepports={props.currentRepports}
          />
        )}
        renderNotifications={() => <SkeletonNotificationsBadge />}
      />
    </TopNavigation>
  );
}
