import {Timestamp} from 'firebase/firestore';

export interface Report {
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
}
