import { useEffect, useState } from 'react';
import {
  Hamburger,
  NavDrawer,
  NavDrawerHeader,
} from '@fluentui/react-nav-preview';
import { Sidenav } from './comps';

export const AppDrawer = ({
  isOpen,
  onHide,
}: {
  isOpen: boolean;
  onHide: () => void;
}) => {
  const [open, setOpen] = useState<boolean>(
    window.innerWidth > 768 ? true : isOpen,
  );
  const [type, setType] = useState(
    window.innerWidth > 768 ? 'inline' : 'overlay',
  );

  useEffect(() => {
    const effector = () => {
      const _type = window.innerWidth > 768 ? 'inline' : 'overlay';
      setType(_type);

      if (_type === 'inline') {
        setOpen(true);
      } else {
        setOpen(isOpen);
      }
    };

    window.addEventListener('resize', effector);

    return () => window.removeEventListener('resize', effector);
  }, []);

  useEffect(() => {
    const _type = window.innerWidth > 768 ? 'inline' : 'overlay';
    if (_type === 'overlay') {
      setOpen(isOpen);
    }
  }, [isOpen]);

  return (
    <div className="drawer">
      <NavDrawer
        defaultSelectedValue="2"
        defaultSelectedCategoryValue=""
        open={open}
        type={type as 'inline' | 'overlay'}
        multiple={true}>
        <NavDrawerHeader>
          <Hamburger
            onClick={() => {
              if (type !== 'inline') {
                setOpen(!open);
                onHide();
              }
            }}
          />
        </NavDrawerHeader>

        <Sidenav onClose={() => setOpen(false)} isDrawerMode={true} />
      </NavDrawer>
    </div>
  );
};
