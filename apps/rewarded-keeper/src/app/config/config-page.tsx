import Page, { Grid, GridColumn } from '@atlaskit/page';
import { shallowEqual, useSelector } from 'react-redux';
import { Config, GlobalState } from '../data';
import Toggle from '@atlaskit/toggle';
import AtlaskitDropdownMenu, { DropdownItem } from '@atlaskit/dropdown-menu';
import Button from '@atlaskit/button';
import { useState } from 'react';
import SectionMessage from '@atlaskit/section-message';
import { token } from '@atlaskit/tokens';

export function ConfigPage() {
  const config = useSelector(
    (state: GlobalState) => state.config,
    shallowEqual,
  );
  const [isThemeDropdownOpened, setIsThemeDropdownOpened] = useState(false);
  const saveThemeValue = (value: 'dark' | 'light' | 'system') => {
    Config.update({ ...config, theme: value });
    setIsThemeDropdownOpened(false);
  };
  const style = { color: token('color.text') };

  return (
    <Page>
      <Grid layout="fluid" spacing="comfortable">
        <GridColumn medium={9}>
          <h5>Afficher les mois au format court</h5>
          <p>
            Lorsque cette option est activée, les mois dans la visualisation des
            rapports de services s'afficheront au format court. Ex: Jan. 23 au
            lieu de Janvier 2023.
          </p>
        </GridColumn>
        <GridColumn medium={3}>
          <Toggle
            onChange={() => {
              Config.update({
                ...config,
                useShortenedMonths: !config.useShortenedMonths,
              });
            }}
            isChecked={config.useShortenedMonths}
          />
        </GridColumn>
        <GridColumn medium={9}>
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
          <SectionMessage appearance="warning">
            Certains contorles ne supportent pas le mode sombre pour l'instant.
            C'est un travail en cours.
          </SectionMessage>
        </GridColumn>
        <GridColumn medium={3}>
          <AtlaskitDropdownMenu
            trigger={({ triggerRef, ...props }) => (
              <Button
                {...props}
                isSelected={isThemeDropdownOpened}
                ref={triggerRef}
                onClick={() => setIsThemeDropdownOpened(!isThemeDropdownOpened)}
              >
                {themeToDropdownValue(config.theme || 'system')}
              </Button>
            )}
            isOpen={isThemeDropdownOpened}
          >
            <DropdownItem onClick={() => saveThemeValue('dark')}>
              <span style={style}>Sombre</span>
            </DropdownItem>
            <DropdownItem onClick={() => saveThemeValue('light')}>
              <span style={style}>Clair</span>
            </DropdownItem>
            <DropdownItem onClick={() => saveThemeValue('system')}>
              <span style={style}>Automatique</span>
            </DropdownItem>
          </AtlaskitDropdownMenu>
        </GridColumn>
      </Grid>
    </Page>
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
