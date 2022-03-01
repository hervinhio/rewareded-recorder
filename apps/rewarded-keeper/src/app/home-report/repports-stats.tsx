import { Publisher, Repport } from '../types';

export enum StatsType {
  RegularPionneer = 'regular-pionneer',
  AuxilaryPionneer = 'auxilary-pionneer',
  Publishers = 'publishers',
  All = 'all',
}

interface Props {
  type: StatsType;
  repports: Repport[];
  publishers: Publisher[];
}

export const RepportsStats = (props: Props) => {
  const repports =
    props.type === StatsType.All ? props.repports : getMatchingRepports(props);

  return (
    <div>
      <h5>Nombre de rapports</h5>
      <span>{repports.length}</span>
      <h5>Publications laissées (Iimprimées et Eléctroniques)</h5>
      <span>{getNumberPublicationPlacements(repports)}</span>
      <h5>Vidéos montrées</h5>
      <span>{getNumberOfVideoShowings(repports)}</span>
      <h5>Heures</h5>
      <span>{getNumberOfHours(repports)}</span>
      <h5>Nouvelles visites</h5>
      <span>{getNumberOfReturnVisits(repports)}</span>
      <h5>Cours bibliques</h5>
      <span>{getNumberOfStudies(repports)}</span>
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
  return props.repports.filter((repport: Repport) => {
    const publisher = props.publishers.find(
      (p) => p.id === repport.publisherId
    );

    switch (props.type) {
      case StatsType.RegularPionneer:
        return !!publisher && publisher.isRegularPioneer;
      case StatsType.AuxilaryPionneer:
        return !!publisher && publisher.isAuxylaryPioneer;
      default:
        return !!publisher;
    }
  });
};
