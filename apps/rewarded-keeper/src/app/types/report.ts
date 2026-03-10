import { Timestamp } from 'firebase/firestore';

export interface Report {
  id: string;
  publisherId: string;
  monthId: string;
  active: boolean; /**Use if the publisher has preached during the month. @since November 1st, 2023 */
  hours?: number;
  courses?: number;
  comment: string;
  date?: Timestamp;
  submitted: boolean;
  isFirstReport: boolean;
  isAPReport: boolean;
  congregationId?: string; // Multi-tenancy: inherited from publisher's congregationId
}
