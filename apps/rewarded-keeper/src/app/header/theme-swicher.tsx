import { Config } from '../data';
import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  ToolbarButton,
} from '@fluentui/react-components';
import { DarkThemeFilled } from '@fluentui/react-icons';

export function ThemeSwitcher() {
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <ToolbarButton icon={<DarkThemeFilled />} />
      </MenuTrigger>
      <MenuPopover>
        <MenuItem onClick={() => Config.switchThemeToDark()}>Sombre</MenuItem>
        <MenuItem onClick={() => Config.switchThemeToLight()}>Clair</MenuItem>
        <MenuItem onClick={() => Config.switchThemeToAuto()}>
          Automatique
        </MenuItem>
      </MenuPopover>
    </Menu>
  );
}
