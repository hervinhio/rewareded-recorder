export enum PublisherActivityStatus  {
  Active,
  Irregular,
  Inactive,
}

export interface Publisher {
  id?: string;
  name: string;
  firstName: string;
  lastName: string;
  groupId: string | 'unafiliated';
  address: string;
  telephone: string;
  emergencyPhone: string;
  emailAddress: string;
  isElder?: boolean;
  isMinisterialServant?: boolean;
  isRegularPioneer?: boolean;
  auxilaryPionierFor?: string[];
  isPermanentAuxilaryPioneer?: boolean;
  activityStatus: PublisherActivityStatus;
}

export const isPublisherAuxilaryPionierForMonth = (
  publisher: Publisher | undefined,
  monthId: string
) => {
  return (publisher?.isPermanentAuxilaryPioneer ?? publisher?.auxilaryPionierFor?.includes(monthId)) || false;
};
