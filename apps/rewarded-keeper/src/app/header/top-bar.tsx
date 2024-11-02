import './top-bar.scss';
import { ProductHome } from '@atlaskit/atlassian-navigation';
import { Logo } from './logo';
import EntitySearch from './search';
import { SkeletonNotificationsBadge } from './notifications-badge';
import { CreateMenu } from './create-menu';
import { ThemeSwitcher } from './theme-swicher';
import { Toolbar, ToolbarGroup } from '@fluentui/react-components';
import { ReactElement } from 'react';

interface Props {
  onMenuChange: (menu: string) => void;
  hamburger: ReactElement;
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
    <div className="top-bar">
      {props.hamburger}
      <AppProductHome />
      <Toolbar>
        <ToolbarGroup>
          <CreateMenu />
        </ToolbarGroup>
      </Toolbar>

      <span className="flex-expand"></span>

      <Toolbar>
        <ToolbarGroup>
          <ThemeSwitcher />
          <EntitySearch />
          <SkeletonNotificationsBadge />
        </ToolbarGroup>
      </Toolbar>
    </div>
  );
}
