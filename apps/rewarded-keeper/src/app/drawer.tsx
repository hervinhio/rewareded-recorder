import { useState } from 'react';
import Drawer from '@atlaskit/drawer';
import MenuIcon from '@atlaskit/icon/glyph/menu';
import { Sidenav } from './comps';
import { Group, Publisher, Repport } from './types';

interface Props {
  publishers: Publisher[];
  groups: Group[];
  repports: Repport[];
  currentRepports: Repport[];
}

export const AppDrawer = (props: Props) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Drawer
        onClose={() => setOpen(false)}
        isOpen={open}
        overrides={{
          Sidebar: {
            component: () => (
              <Sidenav
                onClose={() => setOpen(false)}
                publishers={props.publishers}
                groups={props.groups}
                repports={props.repports}
                currentRepports={props.currentRepports}
              />
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
    </>
  );
};
