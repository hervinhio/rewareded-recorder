import { Timestamp } from 'firebase/firestore';

export interface Repport {
  id: string;
  publisherId: string;
  monthId: string;
  publications: number;
  videos: number;
  hours: number;
  visits: number;
  courses: number;
  comment: string;
  date?: Timestamp;
  submitted: boolean;
  isFirstReport: boolean;
}
