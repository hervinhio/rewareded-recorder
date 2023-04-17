import { useEffect, useState } from 'react';
import './stats-page.scss';
import Page, { Grid, GridColumn } from '@atlaskit/page';
import { Stats, StatsUtils, db } from '../data';
import { doc, getDoc } from 'firebase/firestore';
import { Flags } from '../data/flags';
import { nanoid } from '@reduxjs/toolkit';
import { LoadingButton } from '@atlaskit/button';
import UndoIcon from '@atlaskit/icon/glyph/undo';
import { R300 } from '@atlaskit/theme/colors';
import { ConfirmationModal } from '../comps';
import { FirebaseError } from 'firebase/app';

const initialState = {
  disfellowshiped: 0,
  gone: 0,
  newComers: 0,
  newPublishers: 0,
};

export function StatsPage() {
  const [stats, setStats] = useState<Stats>(initialState);
  const [pendingReset, setPendingReset] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'Stats/unique')).then(
      (stats) => setStats((stats.data() as Stats) || initialState),
      (error) => Flags.raiseError(error, nanoid())
    );
  }, []);

  return (
    <Page>
      <Grid layout="fluid" spacing="comfortable">
        <h5>Statistiques</h5>
        <GridColumn medium={12}>
          <h6>In-Out</h6>
          <section className="in-out">
            <div className="stats-card">
              <div>
                <span>Partis</span>
                <h5>{stats.gone || 0}</h5>
              </div>
              <div>
                <span>Excommuniés</span>
                <h5>{stats.disfellowshiped || 0}</h5>
              </div>
              <div>
                <span>Nouveaux arrivés</span>
                <h5>{stats.newComers || 0}</h5>
              </div>
              <div>
                <span>Nouveaux proclamateurs</span>
                <h5>{stats.newPublishers || 0}</h5>
              </div>
            </div>
          </section>
          <section>
            <LoadingButton
              iconBefore={<UndoIcon primaryColor="#ffffff" label="" />}
              style={{ backgroundColor: R300 }}
              isLoading={pendingReset}
              onClick={() => setPendingReset(true)}
            >
              <span style={{ color: '#ffffff' }}>Réinitialiser</span>
            </LoadingButton>
            {pendingReset && (
              <ConfirmationModal
                onClose={(confirmed) => {
                  if (!confirmed) {
                    setPendingReset(false);
                    return;
                  }

                  StatsUtils.reset()
                    .catch((error: FirebaseError) =>
                      Flags.raiseError(error, nanoid())
                    )
                    .then(() => {
                      setStats(initialState);
                    })
                    .finally(() => {
                      setPendingReset(false);
                    });
                }}
                risky={true}
                title="Réinitialisation des compteurs"
              >
                <p>
                  Etes-vous sur de vouloir réinitialiser ces compteurs ? Ils
                  sont très utiles pour la prochaine semaine spéciale et cette
                  opération ne peut être recouvrée.
                </p>
              </ConfirmationModal>
            )}
          </section>
        </GridColumn>
      </Grid>
    </Page>
  );
}
