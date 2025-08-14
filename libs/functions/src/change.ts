import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { ParamsOf } from 'firebase-functions/core';
import { FirestoreEvent } from 'firebase-functions/firestore';

type Document = string;
export type Change = FirestoreEvent<QueryDocumentSnapshot | undefined, ParamsOf<Document>>;
