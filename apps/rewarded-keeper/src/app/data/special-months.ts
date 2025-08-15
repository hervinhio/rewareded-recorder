import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
} from 'firebase/firestore';
import { SpecialMonth } from '../types';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';

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

    try {
      // Query for special months >= current month in current year
      const currentYearQuery = query(
        collection(db, SpecialMonths.CollectionName),
        where('year', '==', currentYear),
        orderBy('month')
      );

      const currentYearSnapshot = await getDocs(currentYearQuery);

      const specialMonths: SpecialMonth[] = [];
      currentYearSnapshot?.forEach((doc) => {
        specialMonths.push(doc.data() as SpecialMonth);
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
    
    try {
      const q = query(
        collection(db, SpecialMonths.CollectionName),
        orderBy('year'),
        orderBy('month')
      );
      
      const specialMonths: SpecialMonth[] = [];

      (await getDocs(q)).forEach((doc) => {
        specialMonths.push(doc.data() as SpecialMonth);
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

    try {
      const docRef = await addDoc(collection(db, SpecialMonths.CollectionName), specialMonth);
      store.dispatch(SpecialMonths.slice.actions.added(specialMonth));
      return specialMonth;
    } catch (error) {
      console.error('Error creating special month:', error);
      throw error;
    }
  }
}
