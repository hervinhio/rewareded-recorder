import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { Config, GlobalState, Users, Dialogs } from '../data';
import { useState } from 'react';
import {
  Body1,
  Button,
  makeStyles,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  Subtitle1,
  Switch,
} from '@fluentui/react-components';
import { RoleGuard } from '../components/permission-guard';
import { Role } from '../types';

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
  const dispatch = useDispatch();
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
        <Subtitle1>Afficher les mois au format court</Subtitle1>
        <p>
          <Body1>
            Lorsque cette option est activée, les mois dans la visualisation des
            rapports de services s'afficheront au format court. Ex: Jan. 23 au
            lieu de Janvier 2023.
          </Body1>
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
        <Subtitle1>Thème</Subtitle1>
        <div>
          <Body1>Choisissez:</Body1>
          <ul>
            <li>
              <Body1>
                <code>Sombre</code> pour définir le thème sombre par défaut.
              </Body1>
            </li>
            <li>
              <Body1>
                <code>Claire</code> pour définir le thème claire par défaut.
              </Body1>
            </li>
            <li>
              <Body1>
                <code>Automatique</code> pour laisser le thème être dicté par le
                système.
              </Body1>
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
            <MenuItem onClick={() => saveThemeValue('dark')}>Sombre</MenuItem>
            <MenuItem onClick={() => saveThemeValue('light')}>Clair</MenuItem>
            <MenuItem onClick={() => saveThemeValue('system')}>
              Automatique
            </MenuItem>
          </MenuPopover>
        </Menu>
      </div>
      
      <RoleGuard user={Users.getCurrent()} allowedRoles={[Role.ADMIN, Role.ROOT]}>
        <div role="gridcell" className={styles.mainColumn}>
          <Subtitle1>Mois spéciaux</Subtitle1>
          <p>
            <Body1>
              Gérez les mois spéciaux pour votre organisation.
            </Body1>
          </p>
        </div>
        <div role="gridcell">
          <Button
            appearance="primary"
            onClick={() => dispatch(Dialogs.slice.actions.toggleCreateSpecialMonthModal())}
          >
            Ajouter un mois spécial
          </Button>
        </div>
      </RoleGuard>
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
