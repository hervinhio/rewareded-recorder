import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { SpecialMonth } from '../types';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';
import { Congregations } from './congregations';

export interface SpecialMonthsState {
  specialMonths: SpecialMonth[];
  loading: boolean;
}

const InitialState: SpecialMonthsState = {
  specialMonths: [],
  loading: false,
};

export class SpecialMonths {
  static readonly CollectionName = 'SpecialMonths';
  static readonly slice = createSlice({
    name: 'SpecialMonths',
    initialState: InitialState,
    reducers: {
      loaded: (state, { payload }) => {
        state.specialMonths = payload;
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      },
      added: (state, { payload }) => {
        state.specialMonths.push(payload);
      },
      removed: (state, { payload }) => {
        state.specialMonths = state.specialMonths.filter(
          sm => !(sm.year === payload.year && sm.month === payload.month)
        );
      },
      updated: (state, { payload }) => {
        const index = state.specialMonths.findIndex(sm => sm.id === payload.id);
        if (index !== -1) {
          state.specialMonths[index] = payload;
        }
      },
    }
  });

  /**
   * Gets all special months that are greater than or equal to the current month
   * @returns Promise<SpecialMonth[]>
   */
  static async getCurrentAndFutureSpecialMonths(): Promise<SpecialMonth[]> {
    store.dispatch(SpecialMonths.slice.actions.loadingStarted());
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const activeCongregationId = Congregations.getActiveCongregationId();
    const congregationConstraints = activeCongregationId
      ? [where('congregationId', '==', activeCongregationId)]
      : [];

    try {
      // Query for special months >= current month in current year
      const currentYearQuery = query(
        collection(db, SpecialMonths.CollectionName),
        ...congregationConstraints,
        where('year', '==', currentYear),
        orderBy('month')
      );

      const currentYearSnapshot = await getDocs(currentYearQuery);

      const specialMonths: SpecialMonth[] = [];
      currentYearSnapshot?.forEach((doc) => {
        specialMonths.push({ id: doc.ref.id, ...doc.data() } as SpecialMonth);
      });

      store.dispatch(SpecialMonths.slice.actions.loaded(specialMonths));
      return specialMonths;
    } catch (error) {
      console.error('Error fetching special months:', error);
      return [];
    } finally {
      store.dispatch(SpecialMonths.slice.actions.loadingEnded());
    }
  }

  /**
   * Gets all special months
   * @returns Promise<SpecialMonth[]>
   */
  static async getAll(): Promise<SpecialMonth[]> {
    store.dispatch(SpecialMonths.slice.actions.loadingStarted());
    const activeCongregationId = Congregations.getActiveCongregationId();
    const congregationConstraints = activeCongregationId
      ? [where('congregationId', '==', activeCongregationId)]
      : [];
    
    try {
      const q = query(
        collection(db, SpecialMonths.CollectionName),
        ...congregationConstraints,
        orderBy('year'),
        orderBy('month')
      );
      
      const specialMonths: SpecialMonth[] = [];

      (await getDocs(q)).forEach((doc) => {
        specialMonths.push({ id: doc.ref.id, ...doc.data() } as SpecialMonth);
      });

      store.dispatch(SpecialMonths.slice.actions.loaded(specialMonths));
      return specialMonths;
    } catch (error) {
      console.error('Error fetching all special months:', error);
      return [];
    } finally {
      store.dispatch(SpecialMonths.slice.actions.loadingEnded());
    }
  }

  /**
   * Checks if a given year and month combination is a special month
   * @param year - The year to check
   * @param month - The month to check (0-indexed)
   * @returns boolean
   */
  static isSpecialMonthByYearAndMonth(year: number, month: number): boolean {
    const specialMonths = store.getState().specialMonths.specialMonths;
    return specialMonths.some(sm => sm.year === year && sm.month === month);
  }

  /**
   * Creates a new special month
   * @param year - The year (e.g. 2024)
   * @param month - The month (0-indexed, 0 = January)
   * @param reason - The reason for this special month
   * @returns Promise<SpecialMonth>
   */
  static async create(year: number, month: number, reason: string): Promise<SpecialMonth> {
    // Check if special month already exists
    const existingSpecialMonths = store.getState().specialMonths.specialMonths;
    const exists = existingSpecialMonths.some(sm => sm.year === year && sm.month === month);
    
    if (exists) {
      throw new Error(`Un mois spécial existe déjà pour ${year}/${month + 1}`);
    }

    const specialMonth: SpecialMonth = {
      year,
      month,
      reason,
    };

    const congregationId = Congregations.getActiveCongregationId();
    if (congregationId) {
      specialMonth.congregationId = congregationId;
    }

    try {
      const docRef = await addDoc(collection(db, SpecialMonths.CollectionName), specialMonth);
      const specialMonthWithId = { ...specialMonth, id: docRef.id };
      store.dispatch(SpecialMonths.slice.actions.added(specialMonthWithId));
      return specialMonthWithId;
    } catch (error) {
      console.error('Error creating special month:', error);
      throw error;
    }
  }

  /**
   * Updates a special month
   * @param id - The document ID
   * @param year - The year (e.g. 2024)
   * @param month - The month (0-indexed, 0 = January)
   * @param reason - The reason for this special month
   * @returns Promise<SpecialMonth>
   */
  static async update(id: string, year: number, month: number, reason: string): Promise<SpecialMonth> {
    // Check if special month already exists for a different document
    const existingSpecialMonths = store.getState().specialMonths.specialMonths;
    const exists = existingSpecialMonths.some(sm => sm.year === year && sm.month === month && sm.id !== id);
    
    if (exists) {
      throw new Error(`Un mois spécial existe déjà pour ${year}/${month + 1}`);
    }

    const updatedSpecialMonth: SpecialMonth = {
      id,
      year,
      month,
      reason,
    };

    try {
      const docRef = doc(db, SpecialMonths.CollectionName, id);
      await updateDoc(docRef, { year, month, reason });
      store.dispatch(SpecialMonths.slice.actions.updated(updatedSpecialMonth));
      return updatedSpecialMonth;
    } catch (error) {
      console.error('Error updating special month:', error);
      throw error;
    }
  }

  /**
   * Deletes a special month by ID
   * @param id - The document ID
   * @returns Promise<void>
   */
  static async deleteById(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, SpecialMonths.CollectionName, id));
      
      // Find the special month in local state to remove it
      const specialMonths = store.getState().specialMonths.specialMonths;
      const specialMonth = specialMonths.find(sm => sm.id === id);
      
      if (specialMonth) {
        store.dispatch(SpecialMonths.slice.actions.removed({ year: specialMonth.year, month: specialMonth.month }));
      }
    } catch (error) {
      console.error('Error deleting special month:', error);
      throw error;
    }
  }

  /**
   * Deletes a special month
   * @param year - The year (e.g. 2024)
   * @param month - The month (0-indexed, 0 = January)
   * @returns Promise<void>
   */
  static async delete(year: number, month: number): Promise<void> {
    try {
      // Find the document with the matching year and month
      const q = query(
        collection(db, SpecialMonths.CollectionName),
        where('year', '==', year),
        where('month', '==', month)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Aucun mois spécial trouvé pour ${year}/${month + 1}`);
      }

      // Delete the document(s) - there should only be one due to our validation
      const deletePromises = querySnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, SpecialMonths.CollectionName, docSnapshot.id))
      );
      
      await Promise.all(deletePromises);
      
      // Update local state
      store.dispatch(SpecialMonths.slice.actions.removed({ year, month }));
    } catch (error) {
      console.error('Error deleting special month:', error);
      throw error;
    }
  }
}
