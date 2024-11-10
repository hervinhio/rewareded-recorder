import { useEffect, useState } from 'react';
import './stats-page.scss';
import { GlobalState, Stats, StatsUtils, db } from '../data';
import { doc, getDoc } from 'firebase/firestore';
import { Flags } from '../data/flags';
import { nanoid } from '@reduxjs/toolkit';
import { ArrowUndoFilled, EditFilled } from '@fluentui/react-icons';
import { R300 } from '@atlaskit/theme/colors';
import { ConfirmationDialog, StatsModificationDialog } from '../comps';
import { FirebaseError } from 'firebase/app';
import { useSelector } from 'react-redux';
import { getLastSixMonths } from '../utils';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  makeStyles,
  Subtitle1,
  themeToTokensObject,
  Title3,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import { darkTheme, lightTheme, themeMode } from '../theme';

const initialState = {
  disfellowshiped: 0,
  gone: 0,
  newComers: 0,
  newPublishers: 0,
  underRestrictions: 0,
  baptized: 0,
  blamed: 0,
  families: 0,
};

const tokens = themeToTokensObject(
  themeMode === 'light' ? lightTheme : darkTheme,
);

const useStyles = makeStyles({
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
  reinitButton: {
    backgroundColor: tokens.colorStatusDangerBackground1,
    color: tokens.colorNeutralStrokeOnBrand
  },
});

export function StatsPage() {
  const [stats, setStats] = useState<Stats>(initialState);
  const [pendingReset, setPendingReset] = useState(false);
  const [showModificationDialog, setShowModificationView] = useState(false);
  const appointed = useSelector((state: GlobalState) => {
    return {
      elders: state.publishers.publishers.filter((p) => p.isElder),
      assistants: state.publishers.publishers.filter(
        (p) => p.isMinisterialServant,
      ),
      pionneers: state.publishers.publishers.filter((p) => p.isRegularPioneer),
    };
  });
  const globalHoursAverage = useSelector((state: GlobalState) => {
    const months = getLastSixMonths().map((m) => m.getKey());
    const reports = state.reports.reports
      .filter((r) => months.includes(r.monthId))
      .map((r) => r.hours || 0);
    const publisherscount = state.publishers.publishers.length;
    return !reports.length
      ? 0
      : reports.reduce((p, c) => p + c) / 6 / publisherscount;
  });

  const pionniersHoursAverage = useSelector((state: GlobalState) => {
    const months = getLastSixMonths().map((m) => m.getKey());
    const publishers = state.publishers.publishers
      .filter((p) => p.isRegularPioneer)
      .map((p) => p.id);
    const reports = state.reports.reports
      .filter(
        (r) => publishers.includes(r.publisherId) && months.includes(r.monthId),
      )
      .map((r) => r.hours || 0);
    return !reports.length
      ? 0
      : reports.reduce((p, c) => p + c) / 6 / publishers.length;
  });
  const styles = useStyles();

  useEffect(() => {
    getDoc(doc(db, 'Stats/unique')).then(
      (stats) => setStats((stats.data() as Stats) || initialState),
      (error) => Flags.raiseError(error, nanoid()),
    );
  }, []);

  return (
    <section className={styles.section}>
      <Title3>Statistiques</Title3>
      <Accordion>
        <AccordionItem value="0">
          <AccordionHeader>Partis/Entrés</AccordionHeader>
          <AccordionPanel>
            <div>
              <div>
                <span>Partis</span>
                <h5>{stats.gone || 0}</h5>
              </div>
              <div>
                <span>Excommuniés</span>
                <h5>{stats.disfellowshiped || 0}</h5>
              </div>
              <div>
                <span>Blâmés</span>
                <h5>{stats.blamed || 0}</h5>
              </div>
              <div>
                <span>Nouveaux arrivés</span>
                <h5>{stats.newComers || 0}</h5>
              </div>
              <div>
                <span>Nouveaux proclamateurs</span>
                <h5>{stats.newPublishers || 0}</h5>
              </div>
              <div>
                <span>Sous réstrictions</span>
                <h5>{stats.underRestrictions || 0}</h5>
              </div>
              <div>
                <span>Baptisés</span>
                <h5>{stats.baptized || 0}</h5>
              </div>
              <div>
                <span>Familles</span>
                <h5>{stats.families || 0}</h5>
              </div>
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <AccordionItem value="1">
        <AccordionHeader>Serviteurs nommés</AccordionHeader>
        <AccordionPanel>
          <div className="stats-card">
            <div>
              <span>Anciens</span>
              <h5>{appointed.elders.length}</h5>
            </div>
            <div>
              <span>Assitants</span>
              <h5>{appointed.assistants.length}</h5>
            </div>
            <div>
              <span>Pionniers</span>
              <h5>{appointed.pionneers.length}</h5>
            </div>
          </div>
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem value="2">
        <AccordionHeader>Prédication</AccordionHeader>
        <AccordionPanel>
          <div className="stats-card">
            <div>
              <span>Moyenne générale</span>
              <h5>{Math.ceil(globalHoursAverage)}</h5> heures
            </div>
            <div>
              <span>Moyenne pionniers</span>
              <h5>{Math.ceil(pionniersHoursAverage)}</h5>heures
            </div>
          </div>
        </AccordionPanel>
      </AccordionItem>
      <section>
        <Toolbar>
          <ToolbarButton
            icon={<EditFilled />}
            onClick={() => setShowModificationView(true)}>
            Modifier
          </ToolbarButton>
          <ToolbarButton
            className={styles.reinitButton}
            icon={<ArrowUndoFilled />}
            style={{ backgroundColor: R300 }}
            onClick={() => setPendingReset(true)}>
            <span style={{ color: '#ffffff' }}>Réinitialiser</span>
          </ToolbarButton>
        </Toolbar>
        {pendingReset && (
          <ConfirmationDialog
            show={pendingReset}
            onClose={(confirmed) => {
              if (!confirmed) {
                setPendingReset(false);
                return;
              }

              StatsUtils.reset()
                .catch((error: FirebaseError) =>
                  Flags.raiseError(error, nanoid()),
                )
                .then(() => {
                  setStats(initialState);
                })
                .finally(() => {
                  setPendingReset(false);
                });
            }}
            risky={true}
            title="Réinitialisation des compteurs">
            <p>
              Etes-vous sur de vouloir réinitialiser ces compteurs ? Ils sont
              très utiles pour la prochaine semaine spéciale et cette opération
              ne peut être recouvrée.
            </p>
          </ConfirmationDialog>
        )}
        {showModificationDialog && (
          <StatsModificationDialog
            stats={stats}
            show={showModificationDialog}
            onClose={(change?: Stats) => {
              if (change) {
                const previousStats = stats;

                setStats(change);
                StatsUtils.update(change).catch((error) => {
                  Flags.raiseError(error, nanoid());
                  setStats(previousStats);
                });
              }

              setShowModificationView(false);
            }}
          />
        )}
      </section>
    </section>
  );
}
