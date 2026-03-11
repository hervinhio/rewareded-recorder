import { Timestamp } from "firebase/firestore";

export interface SubmissionData {
    sheets: number;
    hours: number;
    studies: number;
}

export interface Submission {
    date: Timestamp;
    all: SubmissionData;
    publishers: SubmissionData;
    auxilaryPioneers: SubmissionData;
    regularPionners: SubmissionData;
    congregationId?: number; // Multi-tenancy: congregation this submission belongs to (stores congregation.congregationNumber)
}
