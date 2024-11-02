import './drawer.scss';
import { useState } from 'react';
import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
} from '@fluentui/react-components';
import {
  AppItem,
  Hamburger,
  NavCategory,
  NavCategoryItem,
  NavDivider,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavDrawerProps,
  NavItem,
  NavSectionHeader,
  NavSubItem,
  NavSubItemGroup,
} from '@fluentui/react-nav-preview';
import { Dismiss24Regular, LayoutRowThreeRegular } from '@fluentui/react-icons';
import { Sidenav } from './comps';

export const AppDrawer = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="drawer">
      <NavDrawer
        defaultSelectedValue="2"
        defaultSelectedCategoryValue=""
        open={open}
        type="overlay"
        multiple={true}>
        <NavDrawerHeader>
          <Hamburger onClick={() => setOpen(!open)} />
        </NavDrawerHeader>

        <Sidenav onClose={() => setOpen(false)} isDrawerMode={true} />
      </NavDrawer>
      <Hamburger onClick={() => setOpen(!open)} />
    </div>
  );
};
