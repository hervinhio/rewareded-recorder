import { Month } from "./month";

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
  isSpecialServant?: boolean;
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


export const isPecialPublisher = (publisher?: Publisher, month?: Month) => {
  return isPublisherAuxilaryPionierForMonth(publisher, month?.getKey() || '') ||
    publisher?.isPermanentAuxilaryPioneer ||
    publisher?.isPermanentAuxilaryPioneer ||
    publisher?.isRegularPioneer ||
    publisher?.isSpecialServant;
}
