import { Timestamp } from "firebase/firestore";
import { Month } from "./month";
import { Report } from "./report";

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
  birthDate?: Timestamp;
  baptismDate?: Timestamp;
  reports?: Report[]; // New field for migrating reports from separate collection to publisher arrays
  congregationId?: number; // Multi-tenancy: congregation this publisher belongs to (stores congregation.congregationNumber)
}

/**
 * Determines whether a publisher is auxilary pionier for the given month.
 *
 * @param {Publisher|undefined} publisher - The publisher object to check.
 * @param {string} monthId - The ID of the month to check.
 * @returns {boolean} - Boolean value indicating whether the publisher is auxilary pionier for the given month.
 */
export const isPublisherAuxilaryPionierForMonth = (
  publisher: Publisher | undefined,
  monthId: string
) => {
  return publisher?.isPermanentAuxilaryPioneer || publisher?.auxilaryPionierFor?.includes(monthId) || false;
};


/**
 * Checks if a publisher is a special publisher for a given month.
 *
 * @param {Publisher} publisher - The publisher to check.
 * @param {Month} [month] - The month to check for. If not provided, defaults to current month.
 * @returns {boolean} - True if the publisher is a special publisher for the given month, otherwise false.
 */
export const isSpecialPublisher = (publisher?: Publisher, month?: Month) => {
  return isPublisherAuxilaryPionierForMonth(publisher, month?.getKey() || '') ||
    publisher?.isPermanentAuxilaryPioneer ||
    publisher?.isRegularPioneer ||
    publisher?.isSpecialServant || false;
}
