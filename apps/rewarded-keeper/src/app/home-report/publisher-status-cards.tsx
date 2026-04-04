import { useSelector } from 'react-redux';
import { GlobalState } from '../data';
import { Publisher, PublisherActivityStatus } from '../types';
import { PublishersListDialog } from '../comps/modals';
import {
  Card,
  CardPreview,
  CardHeader,
  Body1,
  Caption1,
  Button,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import {
  PersonFilled,
  ErrorCircle24Filled,
  Warning24Filled,
  CheckmarkCircle24Filled,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 24px',
    textAlign: 'center',
    minHeight: '200px',
    justifyContent: 'space-between',
  },
  statNumber: {
    fontSize: '64px',
    fontWeight: '800',
    lineHeight: '1',
    marginBottom: '8px',
  },
  statLabel: {
    marginBottom: '16px',
    fontWeight: '600',
  },
  iconContainer: {
    fontSize: '32px',
    marginBottom: '16px',
  },
  activeCard: {
    backgroundColor: tokens.colorBrandBackground2,
    '&:hover': {
      backgroundColor: tokens.colorBrandBackgroundHover,
    },
  },
  irregularCard: {
    backgroundColor: tokens.colorStatusWarningBackground1,
    '&:hover': {
      backgroundColor: tokens.colorStatusWarningBackground2,
    },
  },
  inactiveCard: {
    backgroundColor: tokens.colorStatusDangerBackground1,
    '&:hover': {
      backgroundColor: tokens.colorStatusDangerBackground2,
    },
  },
});

interface PublisherStatusCardProps {
  title: string;
  count: number;
  publishers: Publisher[];
  icon: JSX.Element;
  cardStyle: string;
  statColor: string;
}

function PublisherStatusCard({
  title,
  count,
  publishers,
  icon,
  cardStyle,
  statColor,
}: PublisherStatusCardProps) {
  const styles = useStyles();

  return (
    <Card className={cardStyle}>
      <CardHeader
        header={<Body1>{title}</Body1>}
        description={
          <Caption1>
            {count === 0
              ? 'Aucun'
              : count === 1
                ? '1 proclamateur'
                : `${count} proclamateurs`}
          </Caption1>
        }
      />
      <CardPreview>
        <div className={styles.cardContent}>
          <div>
            <div className={styles.statNumber} style={{ color: statColor }}>
              {count}
            </div>
            <div className={styles.iconContainer}>{icon}</div>
          </div>
          <div>
            <div className={styles.statLabel}>
              <Body1>{title}</Body1>
            </div>
            {count > 0 && (
              <PublishersListDialog
                publishers={publishers}
                mode={title === 'Inactifs' ? 'inactive' : 'regular'}>
                <Button appearance="subtle">Voir la liste</Button>
              </PublishersListDialog>
            )}
          </div>
        </div>
      </CardPreview>
    </Card>
  );
}

export function PublisherStatusCards() {
  const styles = useStyles();
  const { activePublishers, irregularPublishers, inactivePublishers } =
    useSelector((state: GlobalState) => {
      const publishers = state.publishers.publishers;
      return {
        activePublishers: publishers.filter(
          (p) => p.activityStatus === PublisherActivityStatus.Active,
        ),
        irregularPublishers: publishers.filter(
          (p) => p.activityStatus === PublisherActivityStatus.Irregular,
        ),
        inactivePublishers: publishers.filter(
          (p) => p.activityStatus === PublisherActivityStatus.Inactive,
        ),
      };
    });

  return (
    <div className={styles.cardsContainer}>
      <PublisherStatusCard
        title="Actifs"
        count={activePublishers.length}
        publishers={activePublishers}
        icon={
          <CheckmarkCircle24Filled
            color={tokens.colorStatusSuccessForeground1}
          />
        }
        cardStyle={styles.activeCard}
        statColor={tokens.colorStatusSuccessForeground1}
      />
      <PublisherStatusCard
        title="Irréguliers"
        count={irregularPublishers.length}
        publishers={irregularPublishers}
        icon={<Warning24Filled color={tokens.colorStatusWarningForeground1} />}
        cardStyle={styles.irregularCard}
        statColor={tokens.colorStatusWarningForeground1}
      />
      <PublisherStatusCard
        title="Inactifs"
        count={inactivePublishers.length}
        publishers={inactivePublishers}
        icon={
          <ErrorCircle24Filled color={tokens.colorStatusDangerForeground1} />
        }
        cardStyle={styles.inactiveCard}
        statColor={tokens.colorStatusDangerForeground1}
      />
    </div>
  );
}
