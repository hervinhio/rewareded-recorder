import { Publisher, Report } from '../types';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../data';
import { getNLastMonthsFromX } from '../utils';
import { Caption2, ProgressBar } from '@fluentui/react-components';

interface Props {
  publisher?: Publisher;
}

interface Progress {
  raw: number;
  value: number;
  appearance: 'brand' | 'success' | 'warning' | 'error';
}

export function PionnierGoalProgress({ publisher }: Props) {
  const reports = useSelector(
    (state: GlobalState) =>
      state.reports.byPublisher[publisher?.id || ''] || [],
    shallowEqual,
  );

  if (!publisher || !publisher.isRegularPioneer) return null;

  const progress = calculateProgress(reports);
  const lastProgress = calculateLastYearProgress(reports);

  return (
    <div style={{ marginBottom: 16 }}>
      <Caption2>
        Objectif: {progress.raw}/600 heures, soit{' '}
        {(progress.value * 100).toFixed(1)}%
      </Caption2>
      <ProgressBar
        aria-label="Progrès du pionnier sur l'année de service"
        value={progress.value}
        color={progress.appearance}
      />
      <Caption2>
        An passé: {lastProgress.raw}/600 heures, soit{' '}
        {(lastProgress.value * 100).toFixed(1)}%
      </Caption2>
    </div>
  );
}

function calculateLastYearProgress(reports: Report[]): Progress {
  const date = new Date();

  if (date.getMonth() < 8) {
    date.setFullYear(date.getFullYear() - 1);
  }

  date.setMonth(7);

  const monthsKeys = getNLastMonthsFromX(12, date).map((m) => m.getKey());
  return getProgressWithinMonthsRange(monthsKeys, reports);
}

function calculateProgress(reports: Report[]): Progress {
  const date = new Date();
  const currentMonth = date.getMonth();
  const monthsKeys: string[] = [];
  const yearsToTake = {
    current: 0,
    last: 0,
  };

  if (currentMonth < 8) {
    yearsToTake.current = date.getFullYear();
    yearsToTake.last = date.getFullYear() - 1;
  } else {
    yearsToTake.current = date.getFullYear() + 1;
    yearsToTake.last = date.getFullYear();
  }

  for (let i = 7; i >= 0; i--) {
    monthsKeys.push(`${yearsToTake.current}#${i}`);
  }

  for (let i = 11; i >= 8; i--) {
    monthsKeys.push(`${yearsToTake.last}#${i}`);
  }

  return getProgressWithinMonthsRange(monthsKeys, reports);
}

function getProgressWithinMonthsRange(
  monthsKeys: string[],
  reports: Report[],
): Progress {
  const matchingReports = reports
    .filter((r) => monthsKeys.includes(r.monthId))
    .map((r) => r.hours || 0);

  if (matchingReports.length === 0) {
    return {
      value: 0,
      raw: 0,
      appearance: 'brand',
    };
  }
  const value = matchingReports.reduce((p, c) => p + c);

  return {
    value: (value * 100) / 600 / 100,
    appearance: value >= 600 ? 'success' : 'brand',
    raw: value,
  };
}
