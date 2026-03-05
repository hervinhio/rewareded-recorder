import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Case, CaseComment, CaseSeverity } from '../types';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';


export interface CasesState {
  cases: Case[];
  loading: boolean;
}

const InitialState: CasesState = {
  cases: [],
  loading: false,
};

export class Cases {
  static readonly CollectionName = 'Cases';

  static slice = createSlice({
    name: 'Cases',
    initialState: InitialState,
    reducers: {
      loaded: (state, { payload }) => {
        state.cases = payload;
        state.loading = false;
      },
      added: (state, { payload }) => {
        state.cases = [payload, ...state.cases];
      },
      updated: (state, { payload }) => {
        const index = state.cases.findIndex((c) => c.id === payload.id);
        if (index !== -1) {
          state.cases[index] = payload;
        }
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      },
    },
  });

  static async loadForUser(userId: string): Promise<void> {
    store.dispatch(Cases.slice.actions.loadingStarted());
    const q = query(
      collection(db, Cases.CollectionName),
      where('creatorId', '==', userId),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    const cases: Case[] = [];
    snapshot.forEach((d) => cases.push({ id: d.id, ...d.data() } as Case));
    store.dispatch(Cases.slice.actions.loaded(cases));
  }

  static async loadAll(): Promise<void> {
    store.dispatch(Cases.slice.actions.loadingStarted());
    const q = query(
      collection(db, Cases.CollectionName),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(q);
    const cases: Case[] = [];
    snapshot.forEach((d) => cases.push({ id: d.id, ...d.data() } as Case));
    store.dispatch(Cases.slice.actions.loaded(cases));
  }

  static async create(
    title: string,
    description: string,
    severity: CaseSeverity,
    creatorId: string,
    creatorName: string,
    creatorPhotoURL: string,
  ): Promise<Case> {
    const now = Timestamp.now();
    const newCase: Omit<Case, 'id'> = {
      title,
      description,
      severity,
      status: 'open',
      creatorId,
      creatorName,
      creatorPhotoURL,
      createdAt: now,
      updatedAt: now,
      comments: [],
    };
    const docRef = await addDoc(collection(db, Cases.CollectionName), newCase);
    const created: Case = { id: docRef.id, ...newCase };
    store.dispatch(Cases.slice.actions.added(created));
    return created;
  }

  static async addComment(
    caseItem: Case,
    text: string,
    authorId: string,
    authorName: string,
    authorPhotoURL: string,
  ): Promise<void> {
    const comment: CaseComment = {
      id: crypto.randomUUID(),
      text,
      authorId,
      authorName,
      authorPhotoURL,
      createdAt: Timestamp.now(),
    };
    const ref = doc(collection(db, Cases.CollectionName), caseItem.id);
    await updateDoc(ref, {
      comments: arrayUnion(comment),
      updatedAt: Timestamp.now(),
    });
    const updated: Case = {
      ...caseItem,
      comments: [...caseItem.comments, comment],
      updatedAt: Timestamp.now(),
    };
    store.dispatch(Cases.slice.actions.updated(updated));
  }

  static async updateStatus(
    caseItem: Case,
    status: Case['status'],
  ): Promise<void> {
    const ref = doc(collection(db, Cases.CollectionName), caseItem.id);
    await updateDoc(ref, { status, updatedAt: Timestamp.now() });
    store.dispatch(
      Cases.slice.actions.updated({
        ...caseItem,
        status,
        updatedAt: Timestamp.now(),
      }),
    );
  }
}
