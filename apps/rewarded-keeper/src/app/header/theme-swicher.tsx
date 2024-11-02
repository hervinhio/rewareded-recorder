import Button from '@atlaskit/button';
import DropdownMenu, { DropdownItem } from '@atlaskit/dropdown-menu';
import { useState } from 'react';
import { Config } from '../data';
import { token } from '@atlaskit/tokens';

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const style = { color: token('color.text') };

  return (
    <DropdownMenu
      isOpen={isOpen}
      trigger={({ triggerRef, ...props }) => (
        <Button
          {...props}
          style={{ marginTop: 10 }}
          onClick={() => setIsOpen(!isOpen)}
          ref={triggerRef}
          isSelected={isOpen}>
          Thème
        </Button>
      )}>
      <DropdownItem onClick={() => Config.switchThemeToDark()}>
        <span style={style}>Sombre</span>
      </DropdownItem>
      <DropdownItem onClick={() => Config.switchThemeToLight()}>
        <span style={style}>Clair</span>
      </DropdownItem>
      <DropdownItem onClick={() => Config.switchThemeToAuto()}>
        <span style={style}>Automatique</span>
      </DropdownItem>
    </DropdownMenu>
  );
}
