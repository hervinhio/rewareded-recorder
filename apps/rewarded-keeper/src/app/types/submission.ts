export interface SubmissionData {
    sheets: number;
    hours: number;
    studies: number;
}

export interface Submission {
    date: Date;
    all: SubmissionData;
    publishers: SubmissionData;
    auxilaryPioneers: SubmissionData;
    regularPionners: SubmissionData;
}
