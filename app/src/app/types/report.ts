import { Timestamp } from 'firebase/firestore';

export interface Report {
  id: string;
  publisherId: string;
  monthId: string;
  publications?: number;
  active: boolean; /**Use if the publisher has preached during the month. @since November 1st, 2023 */
  videos?: number;
  hours?: number;
  visits?: number;
  courses?: number;
  comment: string;
  date?: Timestamp;
  submitted: boolean;
  isFirstReport: boolean;
  isAPReport: boolean;
}
