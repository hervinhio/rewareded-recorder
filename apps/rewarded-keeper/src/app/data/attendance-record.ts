import { Timestamp } from "firebase/firestore";

export interface AttendanceRecord {
    date: Timestamp;
    zoom: number;
    inPerson: number;
    monthId: string;
    isMidweekMeeting: boolean;
    id?: string;
}
