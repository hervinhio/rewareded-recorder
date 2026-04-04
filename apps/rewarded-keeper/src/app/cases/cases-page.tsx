import { useEffect, useState } from 'react';
import {
  Body1,
  Button,
  makeStyles,
  Spinner,
  Title3,
  tokens,
} from '@fluentui/react-components';
import { List, ListItem } from '@fluentui/react-list-preview';
import { Cases } from '../data';
import { GlobalState, Users } from '../data';
import { Case } from '../types';
import { useSelector } from 'react-redux';
import { CaseDrawer } from './case-drawer';
import { SeverityBadge } from './severity-badge';
import { StatusBadge } from './status-badge';
import { Add24Regular } from '@fluentui/react-icons';
import { Link, useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
    cursor: 'pointer',
    width: '100%',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  badges: {
    display: 'flex',
    gap: '4px',
  },
  title: {
    flex: 1,
  },
  date: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  empty: {
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
    padding: '24px 0',
  },
});

export function CasesPage() {
  const styles = useStyles();
  const { cases, loading, error } = useSelector(
    (state: GlobalState) => state.cases,
  );
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = Users.getCurrent();
    Cases.loadForUser(user.id);
  }, []);

  if (loading) {
    return <Spinner size="large" />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Title3>Mes demandes</Title3>
        <Button
          appearance="primary"
          icon={<Add24Regular />}
          onClick={() => navigate('/help')}>
          Nouvelle demande
        </Button>
      </div>

      {error ? (
        <Body1 className={styles.empty}>
          Oops... Une erreur est survenue lors du chargement de vos demandes.
        </Body1>
      ) : cases.length === 0 ? (
        <Body1 className={styles.empty}>
          Vous n'avez aucune demande pour le moment.{' '}
          <Link to="/help">Créer une demande</Link>
        </Body1>
      ) : (
        <List>
          {cases.map((c) => (
            <ListItem
              key={c.id}
              className={styles.listItem}
              onClick={() => setSelectedCase(c)}>
              <div className={styles.badges}>
                <SeverityBadge severity={c.severity} />
                <StatusBadge status={c.status} />
              </div>
              <Body1 className={styles.title}>{c.title}</Body1>
              <span className={styles.date}>
                {c.createdAt?.toDate().toLocaleDateString('fr-FR')}
              </span>
            </ListItem>
          ))}
        </List>
      )}

      <CaseDrawer
        caseItem={selectedCase}
        onClose={() => setSelectedCase(null)}
      />
    </div>
  );
}
