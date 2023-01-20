import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
  Timestamp,
  Transaction,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth } from '../auth';
import { Events, Repport } from '../types';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';
import { Groups } from './groups';
import { getLastSixMonths } from '../utils';
import { uniqueId } from 'lodash';

interface RepportsMap {
  [publisherId: string]: Repport[];
}

export interface ReportsState {
  reports: Repport[];
  current: Repport[];
  unsubmitted: Repport[];
  loading: boolean;
  byPublisher: RepportsMap;
  byMonth: RepportsMap;
}

export class Repports {
  private static InitialState: ReportsState = {
    reports: [],
    current: [],
    byPublisher: {},
    loading: false,
    unsubmitted: [],
    byMonth: {},
  };
  static CollectionName = 'Repports';
  static slice = createSlice({
    name: 'Reports',
    initialState: Repports.InitialState,
    reducers: {
      added: (state, { payload }) => {
        const months = getLastSixMonths();
        const defaultMonth = months[0];

        state.reports = [...state.reports, payload];

        if (!state.byPublisher[payload.publisherId]) {
          state.byPublisher[payload.publisherId] = [];
        }

        console.log('Pushing...');
        console.log(payload);
        state.byPublisher[payload.publisherId].push(payload);

        if (payload.monthId === defaultMonth.getKey()) {
          state.current = [...state.current, payload];
        }
      },
      removed: (state, { payload }) => {
        state.reports = state.reports.filter(report => report.id !== payload.id);
        state.current = state.current.filter(report => report.id !== payload.id);
        state.byMonth[payload.monthId] = state.byMonth[payload.monthId]?.filter(report => report.id !== payload.id) || [];
        state.byPublisher[payload.publisherId] = state.reports.filter(report => report.id !== payload.id);
      },
      removedByPublisher: (state, { payload }) => {
        delete state.byPublisher[payload];
      },
      changed: (state, { payload }) => {
        state.reports = [...state.reports, payload];
        state.byPublisher[payload.publisherId] = [...state.reports, payload];
      },
      currentLoaded: (state, { payload }) => {
        state.current = payload;
        payload.forEach((report: Repport) => {
          if (!state.byPublisher[report.publisherId]) {
            state.byPublisher[report.publisherId] = [];
          }

          if (!state.byPublisher[report.publisherId].some(r => r.id === report.id)) {
            state.byPublisher[report.publisherId].push(report);
          }
        });
      },
      loaded: (state, { payload }) => {
        const months = getLastSixMonths();
        const defaultMonth = months[0];

        state.reports = payload;
        state.unsubmitted = [];
        state.current = [];
        state.byMonth = {};
        state.byPublisher = {};

        payload.forEach((report: Repport) => {
          if (!state.byPublisher[report.publisherId]) {
            state.byPublisher[report.publisherId] = [];
          }

          state.byPublisher[report.publisherId].push(report);

          if (!state.byMonth[report.monthId]) {
            state.byMonth[report.monthId] = [];
          }

          state.byMonth[report.monthId].push(report);


          if (!report.submitted) {
            state.unsubmitted.push(report);
          }

          if (report.monthId === defaultMonth.getKey()) {
            state.current.push(report);
          }
        });
      },
      loadedByMonth: (state, { payload }) => {
        state.byMonth[payload.monthId] = payload.reports;
      },
      loadedByPublisher: (state, { payload }) => {
        state.byPublisher = { ...state.byPublisher, [payload.publisherId]: payload.reports};
      },
      unsubmittedLoaded: (state, { payload }) => {
        state.unsubmitted = payload;
        payload.forEach((report: Repport) => {
          if (!state.byPublisher[report.publisherId]) {
            state.byPublisher[report.publisherId] = [];
          }

          if (!state.byPublisher[report.publisherId].some(r => r.id === report.id)) {
            state.byPublisher[report.publisherId].push(report);
          }
        });
      },
      submitted: (state) => {
        state.unsubmitted = [];
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      }
    }
  });

  static async unsubmitted() {
    const repports: Repport[] = [];
    const q = query(
      collection(db, Repports.CollectionName),
      where('submitted', '==', false)
    );

    (await getDocs(q)).forEach((doc) => {
      repports.push({ ...doc.data(), id: doc.id } as Repport);
    });

    store.dispatch(Repports.slice.actions.unsubmittedLoaded(repports.map(rep => {
        delete rep.date;
        return rep;
    })));
    return repports;
  }

  static async all() {
    const repports: Repport[] = [];
    const q = query(
      collection(db, Repports.CollectionName)
    );

    (await getDocs(q)).forEach((doc) => {
      repports.push({ ...doc.data(), id: doc.id } as Repport);
    });

    store.dispatch(Repports.slice.actions.loaded(repports.map(rep => {
        delete rep.date;
        return rep;
    })));
    return repports;
  }

  static async submitAll() {
    const q = query(
      collection(db, Repports.CollectionName),
      where('submitted', '==', false)
    );

    try {
      await runTransaction(db, async (transaction: Transaction) => {
        const docs = await getDocs(q);
        docs.forEach((doc) => {
          transaction.update(doc.ref, { ...doc.data(), submitted: true });
        });
      });
    } catch(error) {
      Events.emit('reports_submission_failed', { id: uniqueId(), error });
      return;
    }

    Events.emit('reports_submitted', { id: uniqueId() });
    store.dispatch(Repports.slice.actions.submitted());
  }

  static async create(report: Repport): Promise<Repport> {
    const ref = await addDoc(collection(db, Repports.CollectionName), {
      ...report,
      date: Timestamp.now(),
      authorId: auth.currentUser?.uid
    });

    const createdReport = { ...report, id: ref.id };
    delete createdReport.date;
    Events.emit('repport_updated', createdReport);
    store.dispatch(Repports.slice.actions.added(createdReport));
    return createdReport;
  }

  static async update(repport: Repport): Promise<Repport> {
    await updateDoc(doc(db, Repports.CollectionName, repport.id), repport as any);
    store.dispatch(Repports.slice.actions.changed(repport));
    Events.emit('repport_updated', repport)
    return repport;
  }

  static async byMonthIdAndPublisherId(
    monthId: string | undefined,
    publisherId: string | undefined
  ): Promise<Repport | null> {
    if (!monthId || !publisherId) {
      return null;
    }

    const q = query(
      collection(db, Repports.CollectionName),
      where('publisherId', '==', publisherId),
      where('monthId', '==', monthId)
    );

    const repports: Repport[] = [];
    (await getDocs(q)).forEach((doc) => {
      repports.push({ ...doc.data(), id: doc.id } as Repport);
    });

    store.dispatch(Repports.slice.actions.currentLoaded(repports.map(rep => {
      delete rep.date;
      return rep;
  })));
    return repports.length > 0 ? repports[0] : null;
  }

  static async byPublisherId(
    publisherId: string | undefined
  ): Promise<Repport[]> {
    if (!publisherId) return [];

    const repports: Repport[] = [];
    const q = query(
      collection(db, Repports.CollectionName),
      where('publisherId', '==', publisherId)
    );

    (await getDocs(q)).forEach((doc) => {
      repports.push({ ...doc.data(), id: doc.id } as Repport);
    });

    store.dispatch(Repports.slice.actions.loadedByPublisher(repports.map(rep => {
      delete rep.date;
      return rep;
  })));

    return repports;
  }

  static async byMonthId(monthId: string | undefined): Promise<Repport[]> {
    if (!monthId) return [];

    const repports: Repport[] = [];
    const q = query(
      collection(db, Repports.CollectionName),
      where('monthId', '==', monthId)
    );

    (await getDocs(q)).forEach((doc) => {
      repports.push({ ...doc.data(), id: doc.id } as Repport);
    });

    store.dispatch(Repports.slice.actions.loadedByMonth(repports.map(rep => {
      delete rep.date;
      return rep;
  })));
    return repports;
  }

  static async delete(report: Repport | undefined): Promise<void> {
    if (!report) return;

    await deleteDoc(doc(db, Repports.CollectionName, report.id));

    store.dispatch(Repports.slice.actions.removed(report));
    Events.emit('repport_deleted', report);
  }

  static async deleteByPublisherId(publisherId: string): Promise<void> {
    const q = query(
      collection(db, Repports.CollectionName),
      where('publisherId', '==', publisherId)
    );

    await runTransaction(db, async (transaction: Transaction) => {
      (await getDocs(q)).forEach((doc) => {
        transaction.delete(doc.ref);
      });
    });

    store.dispatch(Repports.slice.actions.removedByPublisher(publisherId));
  }
}
