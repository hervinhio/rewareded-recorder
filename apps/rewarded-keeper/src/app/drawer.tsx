import { useState } from 'react';
import Drawer from '@atlaskit/drawer';
import MenuIcon from '@atlaskit/icon/glyph/menu';
import { Sidenav } from './comps';

export const AppDrawer = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Drawer
        onClose={() => setOpen(false)}
        isOpen={open}
        overrides={{
          Sidebar: {
            component: () => <Sidenav onClose={() => setOpen(false)} />,
          },
        }}
      ></Drawer>
      <span
        onClick={() => setOpen(true)}
        style={{ marginRight: 8, marginTop: 4 }}
      >
        <MenuIcon label="" size="large" />
      </span>
    </>
  );
};
