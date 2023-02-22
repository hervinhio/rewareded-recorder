import { useDispatch, useSelector } from 'react-redux';
import { GlobalState, Publishers, Users } from '../data';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, LinearScale } from 'chart.js';
import { Publisher, PublisherActivityStatus } from '../types';
import { LoadingButton } from '@atlaskit/button';
import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

Chart.register(ArcElement, Tooltip, Legend, LinearScale);

export function PublishersCharts() {
  const dispatch = useDispatch();
  const { active, inactive, irregular } = useSelector((state: GlobalState) => {
    return {
      active: findActivePublishers(state.publishers.publishers),
      inactive: findInactivePublishers(state.publishers.publishers),
      irregular: findIrregularPublishers(state.publishers.publishers),
    };
  });
  const [isRecalculatingState, setIsRecalculatingState] = useState(false);
  const data = {
    labels: ['Réguliers', 'Irréguliers', 'Inactifs'],
    datasets: [
      {
        label: 'Nombre',
        data: [active, irregular, inactive],
        backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  const loadPublishers = () => {
    Publishers.all()
      .then((pubs) => dispatch(Publishers.slice.actions.loaded(pubs)))
      .catch(console.error);
  };

  return (
    <div>
      <Pie data={data} className="publishers-chart" />
      <LoadingButton
        isDisabled={!Users.getCurrent().admin}
        appearance="subtle"
        isLoading={isRecalculatingState}
        style={{ marginTop: 32 }}
        onClick={() => {
          setIsRecalculatingState(true);
          const functions = getFunctions();
          const recalculateState = httpsCallable(
            functions,
            'recalculatePublishersActiveStatus'
          );
          recalculateState()
            .catch(console.error)
            .finally(() => {
              setIsRecalculatingState(false);
              loadPublishers();
            });
        }}
      >
        Recalculer
      </LoadingButton>
    </div>
  );
}

function findActivePublishers(publishers: Publisher[]): number {
  return publishers.filter(
    (p) => p.activityStatus === PublisherActivityStatus.Active
  ).length;
}

function findInactivePublishers(publishers: Publisher[]): number {
  return publishers.filter(
    (p) => p.activityStatus === PublisherActivityStatus.Inactive
  ).length;
}

function findIrregularPublishers(publishers: Publisher[]): number {
  return publishers.filter(
    (p) => p.activityStatus === PublisherActivityStatus.Irregular
  ).length;
}
