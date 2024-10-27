import { useState } from 'react';
import { PublishersListDialog } from '../comps';
import {
  isPublisherAuxilaryPionierForMonth,
  Publisher,
  Report,
} from '../types';
import { getLastSixMonths } from '../utils';
import { token } from '@atlaskit/tokens';

export enum StatsType {
  RegularPionneer = 'regular-pionneer',
  AuxilaryPionneer = 'auxilary-pionneer',
  Publishers = 'publishers',
  All = 'all',
}

interface Props {
  filterOutSubOne: boolean;
  type: StatsType;
  reports: Report[];
  publishers: Publisher[];
}

export const ReportsStats = (props: Props) => {
  const [isPublishersListDialogOpen, setIsPublishersListDialogOpen] =
    useState(false);
  const reports =
    props.type === StatsType.All ? props.reports : getMatchingReports(props);
  const publishers = getMatchingPublishers(props);

  return (
    <div
      className="stats-card"
      style={{
        color: token('color.text'),
      }}
    >
      <div>
        <span>Nombre de fiches d'activité (S-4)</span>
        <PublishersListDialog
          publishers={publishers}
          mode="regular"
        >
          <h5 style={{ textDecoration: 'underline', cursor: 'pointer' }}>
            {reports.length}
          </h5>
        </PublishersListDialog>
      </div>
      {props.type !== StatsType.Publishers && (
        <div>
          <span>Heures</span>
          <h5>{getNumberOfHours(reports)}</h5>
        </div>
      )}
      <div>
        <span>Cours</span>
        <h5>{getNumberOfStudies(reports)}</h5>
      </div>
    </div>
  );
};

const getNumberOfHours = (reports: Report[]) => {
  return reports.length > 0
    ? reports
        .map((report: Report) => report.hours || 0)
        .reduce((previous, current) => previous + current)
    : 0;
};

const getNumberOfStudies = (reports: Report[]) => {
  return reports.length > 0
    ? reports
        .map((report: Report) => report.courses || 0)
        .reduce((previous, current) => previous + current)
    : 0;
};

const getMatchingReports = (props: Props): Report[] => {
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

const getMatchingPublishers = (props: Props): Publisher[] => {
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
