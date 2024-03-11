import {
  AtlassianNavigation,
  IconButton,
  ProductHome,
} from '@atlaskit/atlassian-navigation';
import { TopNavigation } from '@atlaskit/page-layout';
import { Logo } from './logo';
import { AppDrawer } from '../drawer';
import EntitySearch from './search';
import { SkeletonNotificationsBadge } from './notifications-badge';
import { CreateMenu } from './create-menu';
import { Link } from 'react-router-dom';
import SettingsIcon from '@atlaskit/icon/glyph/settings';
import { ThemeSwitcher } from './theme-swicher';

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
        renderProductHome={AppProductHome}
        renderSearch={EntitySearch}
        renderAppSwitcher={() => <AppDrawer />}
        renderSettings={() => (
          <Link to={'/settings'}>
            <IconButton
              icon={<SettingsIcon label="" />}
              tooltip="Configuration"
            />
          </Link>
        )}
        renderNotifications={() => <SkeletonNotificationsBadge />}
        primaryItems={[<ThemeSwitcher />, <CreateMenu />]}
      />
    </TopNavigation>
  );
}
