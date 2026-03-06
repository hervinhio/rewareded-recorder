import { useState } from 'react';
import { PublishersListDialog } from '../comps';
import {
  isPublisherAuxilaryPionierForMonth,
  Publisher,
  Report,
} from '../types';
import { getLastSixMonths } from '../utils';
import {
  Body1Stronger,
  Caption1,
  makeStyles,
} from '@fluentui/react-components';

export enum StatsType {
  RegularPionneer = 'regular-pionneer',
  AuxilaryPionneer = 'auxilary-pionneer',
  Publishers = 'publishers',
  All = 'all',
}

export interface Props {
  filterOutSubOne: boolean;
  type: StatsType;
  reports: Report[];
  publishers: Publisher[];
}

const useStyles = makeStyles({
  statCategory: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export const ReportsStats = (props: Props) => {
  const [isPublishersListDialogOpen, setIsPublishersListDialogOpen] =
    useState(false);
  const reports =
    props.type === StatsType.All ? props.reports : getMatchingReports(props);
  const publishers = getMatchingPublishers(props);
  const styles = useStyles();

  return (
    <div>
      <div className={styles.statCategory}>
        <Caption1>Nombre de fiches d'activité (S-4)</Caption1>
        <PublishersListDialog publishers={publishers} mode="regular">
          <Body1Stronger
            style={{ textDecoration: 'underline', cursor: 'pointer' }}>
            {reports.length}
          </Body1Stronger>
        </PublishersListDialog>
      </div>
      {props.type !== StatsType.Publishers && (
        <div className={styles.statCategory}>
          <Caption1>Heures</Caption1>
          <Body1Stronger>{getNumberOfHours(reports)}</Body1Stronger>
        </div>
      )}
      <div className={styles.statCategory}>
        <Caption1>Cours</Caption1>
        <Body1Stronger>{getNumberOfStudies(reports)}</Body1Stronger>
      </div>
    </div>
  );
};

export const getNumberOfHours = (reports: Report[]) => {
  return reports.length > 0
    ? reports
        .map((report: Report) => report.hours || 0)
        .reduce((previous, current) => previous + current)
    : 0;
};

export const getNumberOfStudies = (reports: Report[]) => {
  return reports.length > 0
    ? reports
        .map((report: Report) => report.courses || 0)
        .reduce((previous, current) => previous + current)
    : 0;
};

export const getMatchingReports = (props: Props): Report[] => {
  return props.reports
    .filter((report: Report) => {
      if (props.filterOutSubOne) {
        return report.active || (report.hours || 0) >= 1;
      }

      return true;
    })
    .filter((report: Report) => {
      const publisher = props.publishers.find(
        (p) => p.id === report.publisherId,
      );

      switch (props.type) {
        case StatsType.RegularPionneer:
          return !!publisher && publisher.isRegularPioneer;
        case StatsType.AuxilaryPionneer:
          return isPublisherSelecteableForAPStat(
            publisher as Publisher,
            report,
          );
        case StatsType.Publishers:
          return (
            !!publisher &&
            !isPublisherAuxilaryPionierForMonth(publisher, report.monthId) &&
            !publisher.isRegularPioneer
          );
        default:
          return !!publisher;
      }
    });
};

export const getMatchingPublishers = (props: Props): Publisher[] => {
  const month = getLastSixMonths()[0];
  const publishersWithReports = props.publishers.filter(
    (publisher: Publisher) => {
      return props.reports.some((report: Report) => {
        return (
          report.monthId === month.getKey() &&
          report.publisherId === publisher.id
        );
      });
    },
  );

  return publishersWithReports.filter((publisher: Publisher) => {
    switch (props.type) {
      case StatsType.RegularPionneer:
        return publisher.isRegularPioneer;
      case StatsType.AuxilaryPionneer:
        return isPublisherAuxilaryPionierForMonth(publisher, month.getKey());
      case StatsType.Publishers:
        return (
          !isPublisherAuxilaryPionierForMonth(publisher, month.getKey()) &&
          !publisher.isRegularPioneer
        );
      default:
        return true;
    }
  });
};

function isPublisherSelecteableForAPStat(
  publisher: Publisher,
  report: Report,
): boolean {
  if ((report.hours || 0) < 15) return false;

  return isPublisherAuxilaryPionierForMonth(publisher, report.monthId);
}
