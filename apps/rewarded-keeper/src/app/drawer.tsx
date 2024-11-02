import './drawer.scss';
import { useState } from 'react';
import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
} from '@fluentui/react-components';
import { Dismiss24Regular, LayoutRowThreeRegular } from '@fluentui/react-icons';
import { Sidenav } from './comps';

export const AppDrawer = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="drawer">
      <OverlayDrawer
        as="aside"
        open={open}
        onOpenChange={(s, { open }) => setOpen(open)}>
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                icon={<Dismiss24Regular />}
                aria-label="Fermer"
                onClick={() => setOpen(false)}
              />
            }>
            Menu
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          <Sidenav onClose={() => setOpen(false)} isDrawerMode={true} />
        </DrawerBody>
      </OverlayDrawer>
      <Button icon={<LayoutRowThreeRegular />} onClick={() => setOpen(!open)}/>
    </div>
  );
};
