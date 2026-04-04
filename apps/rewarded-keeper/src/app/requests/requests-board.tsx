import { useState } from 'react';
import {
  Body1,
  Button,
  Caption1,
  Card,
  CardHeader,
  makeStyles,
  Persona,
  Subtitle1,
  Title3,
  tokens,
} from '@fluentui/react-components';
import { Case, CaseStatus } from '../types';
import { SeverityBadge } from '../cases/severity-badge';
import { StatusBadge } from '../cases/status-badge';
import { RequestDrawer } from './request-drawer';

interface Props {
  cases: Case[];
}

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    alignItems: 'start',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: tokens.colorNeutralBackground2,
    minHeight: '200px',
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  card: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  badges: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  dates: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginTop: '4px',
  },
  empty: {
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
    padding: '8px 0',
    fontSize: tokens.fontSizeBase200,
  },
});

const COLUMNS: { status: CaseStatus; label: string }[] = [
  { status: 'open', label: 'Ouvert' },
  { status: 'in_progress', label: 'En cours' },
  { status: 'closed', label: 'Résolu' },
];

export function RequestsBoard({ cases }: Props) {
  const styles = useStyles();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  return (
    <div className={styles.page}>
      <Title3>Requêtes</Title3>
      <div className={styles.board}>
        {COLUMNS.map((col) => {
          const colCases = cases.filter((c) => c.status === col.status);
          return (
            <div key={col.status} className={styles.column}>
              <div className={styles.columnHeader}>
                <StatusBadge status={col.status} />
                <Subtitle1>{col.label}</Subtitle1>
                <Caption1>({colCases.length})</Caption1>
              </div>
              {colCases.length === 0 ? (
                <Body1 className={styles.empty}>Aucune requête</Body1>
              ) : (
                colCases.map((c) => (
                  <Card
                    key={c.id}
                    className={styles.card}
                    onClick={() => setSelectedCase(c)}>
                    <CardHeader
                      header={
                        <Body1>
                          <strong>{c.title}</strong>
                        </Body1>
                      }
                      description={
                        <div className={styles.cardMeta}>
                          <div className={styles.badges}>
                            <SeverityBadge severity={c.severity} />
                          </div>
                          <Persona
                            name={c.creatorName}
                            avatar={{ image: { src: c.creatorPhotoURL } }}
                            size="extra-small"
                          />
                          <div className={styles.dates}>
                            <Caption1>
                              Créé le{' '}
                              {c.createdAt
                                ?.toDate()
                                .toLocaleDateString('fr-FR')}
                            </Caption1>
                            <Caption1>
                              Mis à jour le{' '}
                              {c.updatedAt
                                ?.toDate()
                                .toLocaleDateString('fr-FR')}
                            </Caption1>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                ))
              )}
            </div>
          );
        })}
      </div>

      <RequestDrawer
        caseItem={selectedCase}
        onClose={() => setSelectedCase(null)}
      />
    </div>
  );
}
