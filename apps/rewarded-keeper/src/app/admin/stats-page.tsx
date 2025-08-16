import { useEffect, useState } from 'react';
import { GlobalState, Stats, StatsUtils, db, Publishers } from '../data';
import { doc, getDoc } from 'firebase/firestore';
import { Flags } from '../data/flags';
import { ArrowUndoFilled, EditFilled } from '@fluentui/react-icons';
import { ConfirmationDialog, StatsModificationDialog } from '../comps';
import { FirebaseError } from 'firebase/app';
import { useSelector } from 'react-redux';
import { getLastSixMonths } from '../utils';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Body1Strong,
  Caption1,
  makeStyles,
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
  auxiliaryPioneersIds: [],
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
    backgroundColor: tokens.colorStatusDangerBackground2,
  },
  statsCategory: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '4px',
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
    const allReports = Publishers.getAllReports();
    const reports = allReports
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
    const allReports = Publishers.getAllReports();
    const reports = allReports
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
      (error) => Flags.raiseError(error),
    );
  }, []);

  return (
    <section className={styles.section}>
      <Title3>Statistiques</Title3>
      <Toolbar>
        <ToolbarButton
          icon={<EditFilled />}
          onClick={() => setShowModificationView(true)}>
          Modifier
        </ToolbarButton>
        <ToolbarButton
          className={styles.reinitButton}
          icon={<ArrowUndoFilled />}
          onClick={() => setPendingReset(true)}>
          Réinitialiser
        </ToolbarButton>
      </Toolbar>
      <Accordion>
        <AccordionItem value="0">
          <AccordionHeader>Partis/Entrés</AccordionHeader>
          <AccordionPanel>
            <div>
              <div className={styles.statsCategory}>
                <Caption1>Partis</Caption1>
                <Body1Strong>{stats.gone || 0}</Body1Strong>
              </div>
              <div className={styles.statsCategory}>
                <Caption1>Excommuniés</Caption1>
                <Body1Strong>{stats.disfellowshiped || 0}</Body1Strong>
              </div>
              <div className={styles.statsCategory}>
                <Caption1>Blâmés</Caption1>
                <Body1Strong>{stats.blamed || 0}</Body1Strong>
              </div>
              <div className={styles.statsCategory}>
                <Caption1>Nouveaux arrivés</Caption1>
                <Body1Strong>{stats.newComers || 0}</Body1Strong>
              </div>
              <div className={styles.statsCategory}>
                <Caption1>Nouveaux proclamateurs</Caption1>
                <Body1Strong>{stats.newPublishers || 0}</Body1Strong>
              </div>
              <div className={styles.statsCategory}>
                <Caption1>Sous réstrictions</Caption1>
                <Body1Strong>{stats.underRestrictions || 0}</Body1Strong>
              </div>
              <div className={styles.statsCategory}>
                <Caption1>Baptisés</Caption1>
                <Body1Strong>{stats.baptized || 0}</Body1Strong>
              </div>
              <div className={styles.statsCategory}>
                <Caption1>Familles</Caption1>
                <Body1Strong>{stats.families || 0}</Body1Strong>
              </div>
            </div>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem value="1">
          <AccordionHeader>Serviteurs nommés</AccordionHeader>
          <AccordionPanel>
            <div>
              <div className={styles.statsCategory}>
                <Caption1>Anciens</Caption1>
                <Body1Strong>{appointed.elders.length}</Body1Strong>
              </div>
              <div className={styles.statsCategory}>
                <Caption1>Assitants</Caption1>
                <Body1Strong>{appointed.assistants.length}</Body1Strong>
              </div>
              <div className={styles.statsCategory}>
                <Caption1>Pionniers</Caption1>
                <Body1Strong>{appointed.pionneers.length}</Body1Strong>
              </div>
              <div className={styles.statsCategory}>
                <Caption1>Pionniers auxiliaires (objectifs atteints)</Caption1>
                <Body1Strong>{stats.auxiliaryPioneersIds?.length || 0}</Body1Strong>
              </div>
            </div>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem value="2">
          <AccordionHeader>Prédication</AccordionHeader>
          <AccordionPanel>
            <div>
              <div className={styles.statsCategory}>
                <Caption1>Moyenne générale</Caption1>
                <Body1Strong>{Math.ceil(globalHoursAverage)}</Body1Strong>{' '}
                heures
              </div>
              <div className={styles.statsCategory}>
                <Caption1>Moyenne pionniers</Caption1>
                <Body1Strong>{Math.ceil(pionniersHoursAverage)}</Body1Strong>
                heures
              </div>
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <section>
        {pendingReset && (
          <ConfirmationDialog
            show={pendingReset}
            onClose={(confirmed) => {
              if (!confirmed) {
                setPendingReset(false);
                return;
              }

              StatsUtils.reset()
                .catch((error: FirebaseError) => Flags.raiseError(error))
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
                  Flags.raiseError(error);
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
