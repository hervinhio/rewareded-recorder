import { Timestamp } from "firebase/firestore";

export interface SubmissionData {
    sheets: number;
    publications: number;
    videos: number;
    hours: number;
    visits: number;
    studies: number;
}

export interface Submission {
    date: Timestamp;
    all: SubmissionData;
    publishers: SubmissionData;
    auxilaryPioneers: SubmissionData;
    regularPionners: SubmissionData;
}
