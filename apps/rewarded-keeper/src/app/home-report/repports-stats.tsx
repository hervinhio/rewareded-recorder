import { Publisher, Repport } from '../types';

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
  const repports =
    props.type === StatsType.All ? props.repports : getMatchingRepports(props);

  return (
    <div className="stats-card">
      <div>
        <h5>{repports.length}</h5>
        <span>Rapports</span>
      </div>
      <div>
        <h5>{getNumberPublicationPlacements(repports)}</h5>
        <span>Publications</span>
      </div>
      <div>
        <h5>{getNumberOfVideoShowings(repports)}</h5>
        <span>Vidéos</span>
      </div>
      <div>
        <h5>{getNumberOfHours(repports)}</h5>
        <span>Heures</span>
      </div>
      <div>
        <h5>{getNumberOfReturnVisits(repports)}</h5>
        <span>Visites</span>
      </div>
      <div>
        <h5>{getNumberOfStudies(repports)}</h5>
        <span>Cours</span>
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
          return !!publisher && publisher.isAuxylaryPioneer;
        case StatsType.Publishers:
          return (
            !!publisher &&
            !publisher.isAuxylaryPioneer &&
            !publisher.isRegularPioneer
          );
        default:
          return !!publisher;
      }
    });
};
