import { GlobalState, Users } from '../data';
import { useSelector } from 'react-redux';
import { Publisher, Role } from '../types';
import { EmptyState } from '../comps/empty-state';
import { makeStyles, Title3, Card, CardHeader } from '@fluentui/react-components';
import { getPublisherName } from './util';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
  container: {
    width: '100%',
    padding: '16px',
  },
  groupContainer: {
    marginBottom: '24px',
  },
  basicList: {
    marginTop: '16px',
  },
  basicListItems: {
    listStyleType: 'none',
    paddingLeft: 0,
    margin: 0,
  },
  basicListItem: {
    marginBottom: '8px',
    fontSize: '14px',
    height: '36px',
    lineHeight: '36px',
    padding: '0 8px',
    borderBottom: '1px solid #e1e1e1',
    '&:hover': {
      backgroundColor: '#f3f2f1',
      cursor: 'pointer',
    },
  },
  card: {
    marginBottom: '16px',
  },
});

interface PublisherGroup {
  title: string;
  icon: string;
  publishers: Publisher[];
  description: string;
}

export const AppointedMembers = () => {
  const styles = useStyles();
  const user = Users.getCurrent();
  
  const { publishers } = useSelector((state: GlobalState) => ({
    publishers: state.publishers.publishers,
  }));

  // Filter publishers by roles
  const anciens = publishers.filter(p => p.isElder && !p.isInactive);
  const assistants = publishers.filter(p => p.isMinisterialServant && !p.isInactive);
  const pionniers = publishers.filter(p => p.isRegularPioneer && !p.isInactive);

  const groups: PublisherGroup[] = [
    {
      title: 'Anciens',
      icon: '👔',
      publishers: anciens,
      description: 'Proclamateurs ayant la responsabilité d\'ancien',
    },
    {
      title: 'Assistants ministériels',
      icon: '🤝',
      publishers: assistants,
      description: 'Proclamateurs ayant la responsabilité d\'assistant ministériel',
    },
    {
      title: 'Pionniers',
      icon: '📢',
      publishers: pionniers,
      description: 'Proclamateurs pionniers permanents',
    },
  ];

  const renderPublishersList = (publishers: Publisher[]) => {
    if (publishers.length === 0) {
      return (
        <p style={{ fontStyle: 'italic', color: '#666' }}>
          Aucun proclamateur dans cette catégorie
        </p>
      );
    }

    if (![Role.ROOT, Role.ADMIN, Role.GROUP_ADMIN, Role.REPORTER].includes(
      user.role || Role.BASIC,
    )) {
      return (
        <ul className={styles.basicListItems}>
          {publishers.map((publisher) => (
            <li key={publisher.id} className={styles.basicListItem}>
              {getPublisherName(publisher)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <ul className={styles.basicListItems}>
        {publishers.map((publisher) => (
          <li key={publisher.id} className={styles.basicListItem}>
            <Link 
              to={`/groups/${publisher.groupId || 'unafiliated'}/${publisher.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {getPublisherName(publisher)}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  const totalMembers = anciens.length + assistants.length + pionniers.length;

  if (totalMembers === 0) {
    return (
      <div className={styles.container}>
        <Title3>Membres nommés</Title3>
        <EmptyState
          header="Aucun membre nommé"
          description="Il n'y a actuellement aucun membre avec des responsabilités spéciales dans la congrégation."
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Title3>Membres nommés</Title3>
      <p>Vue d'ensemble des membres de la congrégation ayant des responsabilités spéciales.</p>
      
      {groups.map((group) => (
        <div key={group.title} className={styles.groupContainer}>
          <Card className={styles.card}>
            <CardHeader
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{group.icon}</span>
                  <span>{group.title}</span>
                  <span style={{ 
                    color: '#666', 
                    fontSize: '14px', 
                    fontWeight: 'normal' 
                  }}>
                    ({group.publishers.length})
                  </span>
                </div>
              }
              description={group.description}
            />
            <div style={{ padding: '16px' }}>
              {renderPublishersList(group.publishers)}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};