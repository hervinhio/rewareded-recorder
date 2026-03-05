import { Timestamp } from 'firebase/firestore';

export type CaseSeverity = 'bug' | 'feature_request' | 'question';
export type CaseStatus = 'open' | 'in_progress' | 'closed';

export interface CaseComment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  createdAt: Timestamp;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  severity: CaseSeverity;
  status: CaseStatus;
  creatorId: string;
  creatorName: string;
  creatorPhotoURL: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  comments: CaseComment[];
}
