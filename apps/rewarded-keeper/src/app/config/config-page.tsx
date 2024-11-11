import { shallowEqual, useSelector } from 'react-redux';
import { Config, GlobalState } from '../data';
import { useState } from 'react';
import {
  Button,
  makeStyles,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  Switch,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: '70% 1fr',
    gridAutoColumns: 'auto',
  },
  mainColumn: {
    textWrap: 'wrap',
  },
});

export function ConfigPage() {
  const config = useSelector(
    (state: GlobalState) => state.config,
    shallowEqual,
  );
  const [isThemeDropdownOpened, setIsThemeDropdownOpened] = useState(false);
  const saveThemeValue = (value: 'dark' | 'light' | 'system') => {
    Config.update({ ...config, theme: value });
    setIsThemeDropdownOpened(false);
    localStorage.setItem('themeMode', value);
  };
  const styles = useStyles();

  return (
    <section role="grid" className={styles.grid}>
      <div role="gridcell" className={styles.mainColumn}>
        <h5>Afficher les mois au format court</h5>
        <p>
          Lorsque cette option est activée, les mois dans la visualisation des
          rapports de services s'afficheront au format court. Ex: Jan. 23 au
          lieu de Janvier 2023.
        </p>
      </div>
      <div role="gridcell">
        <Switch
          onChange={() => {
            Config.update({
              ...config,
              useShortenedMonths: !config.useShortenedMonths,
            });
          }}
          checked={config.useShortenedMonths}
        />
      </div>
      <div role="gridcell" className={styles.mainColumn}>
        <h5>Thème</h5>
        <div>
          Choisissez:
          <ul>
            <li>
              <code>Sombre</code> pour définir le thème sombre par défaut.
            </li>
            <li>
              <code>Claire</code> pour définir le thème claire par défaut.
            </li>
            <li>
              <code>Automatique</code> pour laisser le thème être dicté par le
              système.
            </li>
          </ul>
        </div>
        <MessageBar intent="warning">
          Certains contorles ne supportent pas le mode sombre pour l'instant.
          C'est un travail en cours.
        </MessageBar>
      </div>
      <div role="gridcell">
        <Menu open={isThemeDropdownOpened}>
          <MenuTrigger>
            <Button
              onClick={() => setIsThemeDropdownOpened(!isThemeDropdownOpened)}>
              {themeToDropdownValue(
                (localStorage.getItem('themeMode') as
                  | 'dark'
                  | 'light'
                  | 'system') || 'system',
              )}
            </Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuItem onClick={() => saveThemeValue('dark')}>
              <span>Sombre</span>
            </MenuItem>
            <MenuItem onClick={() => saveThemeValue('light')}>
              <span>Clair</span>
            </MenuItem>
            <MenuItem onClick={() => saveThemeValue('system')}>
              <span>Automatique</span>
            </MenuItem>
          </MenuPopover>
        </Menu>
      </div>
    </section>
  );
}

function themeToDropdownValue(theme: 'dark' | 'light' | 'system'): string {
  if (theme === 'dark') {
    return 'Sombre';
  } else if (theme === 'light') {
    return 'Claire';
  }

  return 'Automatique';
}
