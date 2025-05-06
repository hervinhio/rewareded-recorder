import { useDispatch, useSelector } from 'react-redux';
import { Dialogs, GlobalState, Publishers, Users } from '../data';
import { PieChart } from '@mui/x-charts/PieChart';
import { Publisher, PublisherActivityStatus } from '../types';
import { useMemo, useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Flags } from '../data/flags';
import {
  Button,
  Card,
  CardPreview,
  CardFooter,
  CardHeader,
  Body1,
  Caption1,
} from '@fluentui/react-components';

export function PublishersCharts() {
  const shouldRefreshFromServer = useMemo(() => false, []);
  const dispatch = useDispatch();
  const { active, inactive, irregular } = useSelector((state: GlobalState) => {
    return {
      active: findActivePublishers(state.publishers.publishers),
      inactive: findInactivePublishers(state.publishers.publishers),
      irregular: findIrregularPublishers(state.publishers.publishers),
    };
  });
  const [isRecalculatingState, setIsRecalculatingState] = useState(false);
  const data = [
    {
      data: [
        { id: 0, value: active, label: `Actifs ${active}` },
        { id: 0, value: irregular, label: `Irréguliers ${irregular}` },
        { id: 0, value: inactive, label: `Inactifs ${inactive}` },
      ],
    },
  ];
  const loadPublishers = () => {
    Publishers.all()
      .then((pubs) => dispatch(Publishers.slice.actions.loaded(pubs)))
      .catch(Flags.raiseError);
  };
  const refreshFromServer = () => {
    setIsRecalculatingState(true);
    const functions = getFunctions();
    const recalculateState = httpsCallable(
      functions,
      'recalculatePublishersActiveStatus',
    );
    recalculateState()
      .catch(Flags.raiseError)
      .finally(() => {
        setIsRecalculatingState(false);
        loadPublishers();
      });
  };
  const refreshFromClient = () =>
    dispatch(Dialogs.slice.actions.toggleRefreshDialog());

  const getChartSize = () => {
    if (window.innerWidth <= 768) {
      return 500;
    }

    return 400;
  };

  return (
    <Card>
      <CardHeader
        header={<Body1>Statistiques</Body1>}
        description={<Caption1>Utiles en semaine spéciale</Caption1>}
      />
      <CardPreview style={{ display: 'flex', flexDirection: 'column' }}>
        <PieChart
          series={data}
          className="publishers-chart"
          height={getChartSize()}
          width={getChartSize()}
        />
      </CardPreview>
      <CardFooter
        action={
          <Button
            disabled={isRecalculatingState || !Users.getCurrent().admin}
            style={{ marginTop: 32 }}
            onClick={() => {
              shouldRefreshFromServer
                ? refreshFromServer()
                : refreshFromClient();
            }}>
            Recalculer
          </Button>
        }
      />
    </Card>
  );
}

function findActivePublishers(publishers: Publisher[]): number {
  return publishers.filter(
    (p) => p.activityStatus === PublisherActivityStatus.Active,
  ).length;
}

function findInactivePublishers(publishers: Publisher[]): number {
  return publishers.filter(
    (p) => p.activityStatus === PublisherActivityStatus.Inactive,
  ).length;
}

function findIrregularPublishers(publishers: Publisher[]): number {
  return publishers.filter(
    (p) => p.activityStatus === PublisherActivityStatus.Irregular,
  ).length;
}
