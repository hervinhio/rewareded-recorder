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
import { Flags } from './flags';
import { Congregations } from './congregations';


export interface CasesState {
  cases: Case[];
  loading: boolean;
  error: boolean;
}

const InitialState: CasesState = {
  cases: [],
  loading: false,
  error: false,
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
        state.error = false;
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
        state.error = false;
      },
      loadingEnded: (state) => {
        state.loading = false;
      },
      loadingFailed: (state) => {
        state.loading = false;
        state.error = true;
      },
    },
  });

  static async loadForUser(userId: string): Promise<void> {
    store.dispatch(Cases.slice.actions.loadingStarted());
    try {
      const q = query(
        collection(db, Cases.CollectionName),
        where('creatorId', '==', userId),
        orderBy('createdAt', 'desc'),
      );
      const snapshot = await getDocs(q);
      const cases: Case[] = [];
      snapshot.forEach((d) => cases.push({ id: d.id, ...d.data() } as Case));
      store.dispatch(Cases.slice.actions.loaded(cases));
    } catch (error) {
      Flags.raiseError(error);
      store.dispatch(Cases.slice.actions.loadingFailed());
    }
  }

  static async loadAll(): Promise<void> {
    store.dispatch(Cases.slice.actions.loadingStarted());
    try {
      const q = query(
        collection(db, Cases.CollectionName),
        orderBy('createdAt', 'desc'),
      );
      const snapshot = await getDocs(q);
      const cases: Case[] = [];
      snapshot.forEach((d) => cases.push({ id: d.id, ...d.data() } as Case));
      store.dispatch(Cases.slice.actions.loaded(cases));
    } catch (error) {
      Flags.raiseError(error);
      store.dispatch(Cases.slice.actions.loadingFailed());
    }
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
    const congregationId = Congregations.getActiveCongregationId();
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
      ...(congregationId ? { congregationId } : {}),
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
