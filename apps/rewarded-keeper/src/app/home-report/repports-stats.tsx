import { useState } from 'react';
import { PublishersListDialog } from '../comps';
import {
  isPublisherAuxilaryPionierForMonth,
  Publisher,
  Repport,
} from '../types';
import { getLastSixMonths } from '../utils';

export enum StatsType {
  RegularPionneer = 'regular-pionneer',
  AuxilaryPionneer = 'auxilary-pionneer',
  Publishers = 'publishers',
  All = 'all',
}

interface Props {
  filterOutSubOne: boolean;
  type: StatsType;
  repports: Repport[];
  publishers: Publisher[];
}

export const RepportsStats = (props: Props) => {
  const [isPublishersListDialogOpen, setIsPublishersListDialogOpen] = useState(false);
  const repports =
    props.type === StatsType.All ? props.repports : getMatchingRepports(props);
  const publishers = getMatchingPublishers(props);

  return (
    <div className="stats-card">
      {isPublishersListDialogOpen && <PublishersListDialog publishers={publishers} onHide={() => setIsPublishersListDialogOpen(false)}/>}
      <div>
        <span>Nombre de fiches d'activité (S-4)</span>
        <h5 style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={() => setIsPublishersListDialogOpen(true)}>{repports.length}</h5>
      </div>
      <div>
        <span>Publications</span>
        <h5>{getNumberPublicationPlacements(repports)}</h5>
      </div>
      <div>
        <span>Vidéos</span>
        <h5>{getNumberOfVideoShowings(repports)}</h5>
      </div>
      <div>
        <span>Heures</span>
        <h5>{getNumberOfHours(repports)}</h5>
      </div>
      <div>
        <span>Visites</span>
        <h5>{getNumberOfReturnVisits(repports)}</h5>
      </div>
      <div>
        <span>Cours</span>
        <h5>{getNumberOfStudies(repports)}</h5>
      </div>
    </div>
  );
};

const getNumberPublicationPlacements = (repports: Repport[]) => {
  return repports.length > 0
    ? repports
        .map((repport: Repport) => repport.publications)
        .reduce((previous, current) => previous + current)
    : 0;
};

const getNumberOfVideoShowings = (repports: Repport[]) => {
  return repports.length > 0
    ? repports
        .map((repport: Repport) => repport.videos)
        .reduce((previous, current) => previous + current)
    : 0;
};

const getNumberOfHours = (repports: Repport[]) => {
  return repports.length > 0
    ? repports
        .map((repport: Repport) => repport.hours)
        .reduce((previous, current) => previous + current)
    : 0;
};

const getNumberOfReturnVisits = (repports: Repport[]) => {
  return repports.length > 0
    ? repports
        .map((repport: Repport) => repport.visits)
        .reduce((previous, current) => previous + current)
    : 0;
};

const getNumberOfStudies = (repports: Repport[]) => {
  return repports.length > 0
    ? repports
        .map((repport: Repport) => repport.courses)
        .reduce((previous, current) => previous + current)
    : 0;
};

const getMatchingRepports = (props: Props): Repport[] => {
  return props.repports
    .filter((repport: Repport) => {
      if (props.filterOutSubOne) {
        return repport.hours >= 1;
      }

      return true;
    })
    .filter((repport: Repport) => {
      const publisher = props.publishers.find(
        (p) => p.id === repport.publisherId
      );

      switch (props.type) {
        case StatsType.RegularPionneer:
          return !!publisher && publisher.isRegularPioneer;
        case StatsType.AuxilaryPionneer:
          return isPublisherAuxilaryPionierForMonth(publisher, repport.monthId);
        case StatsType.Publishers:
          return (
            !!publisher &&
            !isPublisherAuxilaryPionierForMonth(publisher, repport.monthId) &&
            !publisher.isRegularPioneer
          );
        default:
          return !!publisher;
      }
    });
};

const getMatchingPublishers = (props: Props): Publisher[] => {
  const month = getLastSixMonths()[0];
  const publishersWithRepports = props.publishers.filter((publisher: Publisher) => {
    return props.repports.some((repport: Repport) => {
      return repport.monthId === month.getKey() && repport.publisherId === publisher.id;
    });
  });

  return publishersWithRepports
    .filter((publisher: Publisher) => {
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

