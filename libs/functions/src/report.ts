import {Timestamp} from 'firebase/firestore';

export interface Report {
  id: string;
  publisherId: string;
  monthId: string;
  active: boolean;
  hours: number;
  courses: number;
  comment: string;
  date?: Timestamp;
  submitted: boolean;
  isFirstReport?: boolean;
  isAPReport?: boolean;
}
