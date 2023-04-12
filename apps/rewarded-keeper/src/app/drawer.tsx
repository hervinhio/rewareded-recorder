import './drawer.scss';
import { useState } from 'react';
import Drawer from '@atlaskit/drawer';
import MenuIcon from '@atlaskit/icon/glyph/menu';
import { Sidenav } from './comps';

export const AppDrawer = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="drawer">
      <Drawer
        onClose={() => setOpen(false)}
        isOpen={open}
        overrides={{
          Sidebar: {
            component: () => (
              <Sidenav onClose={() => setOpen(false)} isDrawerMode={true} />
            ),
          },
        }}
      ></Drawer>
      <span
        onClick={() => setOpen(true)}
        style={{ marginRight: 8, marginTop: 4 }}
      >
        <MenuIcon label="" size="large" />
      </span>
    </div>
  );
};
