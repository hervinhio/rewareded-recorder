import { Timestamp } from "firebase/firestore";

export interface AttendanceRecord {
    date: Timestamp;
    zoom?: number;
    inPerson?: number;
    monthId: string;
    isMidweekMeeting: boolean;
    id?: string;
    count?: number;
    congregationId?: number; // Multi-tenancy: congregation this record belongs to (stores congregation.congregationNumber)
}
