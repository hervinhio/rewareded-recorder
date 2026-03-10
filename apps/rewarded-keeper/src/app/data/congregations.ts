import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
} from 'firebase/firestore';
import { Congregation } from '../types';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';

const ACTIVE_CONGREGATION_KEY = 'activeCongregationId';

export interface CongregationsState {
  congregations: Congregation[];
  activeCongregationId: string | null;
  loading: boolean;
}

const InitialState: CongregationsState = {
  congregations: [],
  // Restore previously selected congregationId from localStorage (root context switching)
  activeCongregationId: localStorage.getItem(ACTIVE_CONGREGATION_KEY) ?? null,
  loading: false,
};

export class Congregations {
  static readonly CollectionName = 'Congregations';

  static readonly slice = createSlice({
    name: 'Congregations',
    initialState: InitialState,
    reducers: {
      added: (state, { payload }) => {
        state.congregations = [...state.congregations, payload];
      },
      updated: (state, { payload }) => {
        state.congregations = state.congregations.map((c) =>
          c.id === payload.id ? payload : c,
        );
      },
      deleted: (state, { payload }) => {
        state.congregations = state.congregations.filter(
          (c) => c.id !== payload,
        );
      },
      loaded: (state, { payload }) => {
        state.congregations = payload;
      },
      activeCongregationSet: (state, { payload }) => {
        state.activeCongregationId = payload;
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      },
    },
  });

  static async getAll(): Promise<Congregation[]> {
    const q = query(collection(db, Congregations.CollectionName));
    const congregations: Congregation[] = [];

    (await getDocs(q)).forEach((docSnap) => {
      congregations.push({ ...docSnap.data(), id: docSnap.id } as Congregation);
    });

    store.dispatch(Congregations.slice.actions.loaded(congregations));
    return congregations;
  }

  static async create(congregation: Omit<Congregation, 'id'>): Promise<Congregation> {
    const ref = await addDoc(collection(db, Congregations.CollectionName), congregation);
    const created: Congregation = { ...congregation, id: ref.id };
    store.dispatch(Congregations.slice.actions.added(created));
    return created;
  }

  static async update(congregation: Congregation): Promise<Congregation> {
    await updateDoc(
      doc(db, Congregations.CollectionName, congregation.id),
      { ...congregation },
    );
    store.dispatch(Congregations.slice.actions.updated(congregation));
    return congregation;
  }

  static async delete(congregationId: string): Promise<void> {
    await deleteDoc(doc(db, Congregations.CollectionName, congregationId));
    store.dispatch(Congregations.slice.actions.deleted(congregationId));
  }

  /**
   * Sets the active congregation for data filtering (used by root user).
   * Persists the value to localStorage so it survives page reloads.
   */
  static setActive(congregationId: string | null): void {
    if (congregationId) {
      localStorage.setItem(ACTIVE_CONGREGATION_KEY, congregationId);
    } else {
      localStorage.removeItem(ACTIVE_CONGREGATION_KEY);
    }
    store.dispatch(
      Congregations.slice.actions.activeCongregationSet(congregationId),
    );
  }

  /**
   * Returns the active congregation ID to use for data queries.
   * - For root users: returns the currently selected congregationId (may be null to show all)
   * - For non-root users: returns the user's own congregationId
   */
  static getActiveCongregationId(): string | null {
    return store.getState().congregations.activeCongregationId;
  }
}
