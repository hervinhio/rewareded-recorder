import Page, { Grid, GridColumn } from '@atlaskit/page';
import { shallowEqual, useSelector } from 'react-redux';
import { Config, GlobalState } from '../data';
import Toggle from '@atlaskit/toggle';

export function ConfigPage() {
  const config = useSelector(
    (state: GlobalState) => state.config,
    shallowEqual
  );

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
      </Grid>
    </Page>
  );
}
