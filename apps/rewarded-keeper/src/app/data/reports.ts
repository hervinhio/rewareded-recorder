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
import { Events, Report } from '../types';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';
import { getLastSixMonths, hasMetAuxiliaryPioneerGoal } from '../utils';
import { uniqueId } from 'lodash';
import { Notifications } from './notifications';
import { Submission, SubmissionData } from '../types/submission';
import { Submissions } from './submissions';
import { Publishers } from './publishers';
import { isPublisherAuxilaryPionierForMonth } from '../types/publisher';

interface ReportsMap {
  [publisherId: string]: Report[];
}

export interface ReportsState {
  reports: Report[];
  current: Report[];
  unsubmitted: Report[];
  loading: boolean;
  byPublisher: ReportsMap;
  byMonth: ReportsMap;
}

export class Reports {
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
    initialState: Reports.InitialState,
    reducers: {
      added: (state, { payload }) => {
        const months = getLastSixMonths();
        const defaultMonth = months[0];

        state.reports = [...state.reports, payload];

        if (!state.byPublisher[payload.publisherId]) {
          state.byPublisher[payload.publisherId] = [];
        }

        state.byPublisher[payload.publisherId] = [...(state.byPublisher[payload.publisherId] || []), payload];

        if (defaultMonth.getKey() === payload.monthId) {
          state.current.push(payload);
        }

        state.unsubmitted.push(payload);
      },
      removed: (state, { payload }) => {
        state.reports = state.reports.filter(report => report.id !== payload.id);
        state.current = state.current.filter(report => report.id !== payload.id);
        state.byMonth[payload.monthId] = state.byMonth[payload.monthId]?.filter(report => report.id !== payload.id) || [];
        state.byPublisher[payload.publisherId] = state.byPublisher[payload.publisherId]?.filter(report => report.id !== payload.id) || [];
      },
      removedByPublisher: (state, { payload }) => {
        delete state.byPublisher[payload];
      },
      changed: (state, { payload }) => {
        state.reports = state.reports.filter(report => report.id !== payload.id);
        state.reports.push(payload);
        state.byPublisher[payload.publisherId] = state.byPublisher[payload.publisherId]?.filter(report => report.id !== payload.id) || [];
        state.byPublisher[payload.publisherId].push(payload);

        if (state.unsubmitted.some(r => r.id === payload.id)) {
          state.unsubmitted = state.unsubmitted.filter(report => report.id !== payload.id);
          state.unsubmitted.push(payload);
        }
      },
      currentLoaded: (state, { payload }) => {
        state.current = payload;
      },
      loaded: (state, { payload }) => {
        const months = getLastSixMonths();
        const defaultMonth = months[0];

        state.reports = payload;
        state.unsubmitted = [];
        state.current = [];
        state.byMonth = {};
        state.byPublisher = {};

        payload.forEach((report: Report) => {
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
        payload.forEach((report: Report) => {
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
    const reports: Report[] = [];
    const q = query(
      collection(db, Reports.CollectionName),
      where('submitted', '==', false)
    );

    (await getDocs(q)).forEach((doc) => {
      reports.push({ ...doc.data(), id: doc.id } as Report);
    });

    store.dispatch(Reports.slice.actions.unsubmittedLoaded(reports.map(rep => {
        delete rep.date;
        return rep;
    })));
    return reports;
  }

  static async all() {
    const reports: Report[] = [];
    const q = query(
      collection(db, Reports.CollectionName)
    );

    (await getDocs(q)).forEach((doc) => {
      reports.push({ ...doc.data(), id: doc.id } as Report);
    });

    store.dispatch(Reports.slice.actions.loaded(reports.map(rep => {
        return rep;
    })));
    return reports;
  }

  static async submitAll() {
    const q = query(
      collection(db, Reports.CollectionName),
      where('submitted', '==', false)
    );

    const submission = this.createSubmissionHistoryEntry();
    const currentMonthKey = getLastSixMonths()[0].getKey();

    try {
      await runTransaction(db, async (transaction: Transaction) => {
        const docs = await getDocs(q);
        docs.forEach((document) => {
          transaction.update(document.ref, { ...document.data(), submitted: true });
        });

        transaction.set(doc(db, 'Submissions', currentMonthKey), submission);
      });
      await Notifications.saveSubmission();
    } catch(error) {
      Events.emit('reports_submission_failed', { error });
      return;
    }

    Events.emit('reports_submitted', { id: uniqueId() });
    store.dispatch(Reports.slice.actions.submitted());
    Submissions.add(submission);
  }

  private static createSubmissionHistoryEntry() {
    const publishers = store.getState().publishers.publishers;
    const reports = store.getState().reports.unsubmitted;
    const emptySubmissionData = {
      hours: 0,
      sheets: 0,
      studies: 0,
    };
    const submission: Submission = {
      date: Timestamp.fromDate(new Date()),
      all: { ...emptySubmissionData },
      auxilaryPioneers: { ...emptySubmissionData },
      publishers: { ...emptySubmissionData },
      regularPionners: { ...emptySubmissionData },
    }

    publishers.forEach(pub => {
      const pubReports = reports.filter(r => r.publisherId === pub.id);
      if (!pubReports.length) return;

      this.increaseCounters(pubReports, submission.all);

      const auxilaryPionnerReports = pubReports.filter(r => pub.auxilaryPionierFor?.includes(r.monthId));
      if (auxilaryPionnerReports.length) {
        this.increaseCounters(auxilaryPionnerReports, submission.auxilaryPioneers);
      } else if (pub.isRegularPioneer) {
        this.increaseCounters(pubReports, submission.regularPionners);
      } else {
        this.increaseCounters(pubReports, submission.publishers);
      }
    });

    return submission;
  }

  private static increaseCounters(reports: Report[], data: SubmissionData): void {
    data.hours += reports.map(r => r.hours || 0).reduce((p: number, c: number) => p+c);
    data.studies += reports.map(r => r.courses || 0).reduce((p: number, c: number) => p+c);
    data.sheets += 1;
  }

  /**
   * Checks auxiliary pioneer goal compliance and updates publisher and report accordingly.
   * If the goal is not met, removes the month from auxilaryPionierFor array and sets isAPReport to false.
   * 
   * @param report - The report to check
   * @returns Updated report with corrected isAPReport field
   */
  private static async checkAuxiliaryPioneerGoal(report: Report): Promise<Report> {
    const publishers = store.getState().publishers.publishers;
    const publisher = publishers.find(p => p.id === report.publisherId);
    
    if (!publisher) {
      return report;
    }

    // Check if this publisher is an auxiliary pioneer for this month
    const isAuxiliaryPioneerForMonth = isPublisherAuxilaryPionierForMonth(publisher, report.monthId);
    
    if (isAuxiliaryPioneerForMonth || publisher.isPermanentAuxilaryPioneer) {
      // Check if the goal is met for this month
      const goalMet = await hasMetAuxiliaryPioneerGoal(report.hours, report.monthId);
      
      if (!goalMet) {
        // Goal not met - remove month from auxilaryPionierFor array
        const updatedAuxilaryPionierFor = (publisher.auxilaryPionierFor || [])
          .filter(monthId => monthId !== report.monthId);
        
        const updatedPublisher = {
          ...publisher,
          auxilaryPionierFor: updatedAuxilaryPionierFor
        };
        
        // Update the publisher in the database
        await Publishers.save(updatedPublisher, true, false);
        
        // Return report with isAPReport set to false
        return {
          ...report,
          isAPReport: false
        };
      }
    }
    
    // Set isAPReport based on whether publisher is auxiliary pioneer for this month
    return {
      ...report,
      isAPReport: isAuxiliaryPioneerForMonth
    };
  }

  static async create(report: Report): Promise<Report> {
    // Check auxiliary pioneer goal compliance before saving
    const updatedReport = await Reports.checkAuxiliaryPioneerGoal(report);
    
    const ref = await addDoc(collection(db, Reports.CollectionName), {
      ...updatedReport,
      date: Timestamp.now(),
      authorId: auth.currentUser?.uid
    });

    const createdReport = { ...updatedReport, id: ref.id };
    delete createdReport.date;
    Events.emit('report_updated', createdReport);
    store.dispatch(Reports.slice.actions.added(createdReport));
    return createdReport;
  }

  static async update(report: Report): Promise<Report> {
    // Check auxiliary pioneer goal compliance before saving
    const updatedReport = await Reports.checkAuxiliaryPioneerGoal(report);
    
    await updateDoc(doc(db, Reports.CollectionName, updatedReport.id), updatedReport as any);
    store.dispatch(Reports.slice.actions.changed(updatedReport));
    Events.emit('report_updated', updatedReport)
    return updatedReport;
  }

  static async byMonthIdAndPublisherId(
    monthId: string | undefined,
    publisherId: string | undefined
  ): Promise<Report | null> {
    if (!monthId || !publisherId) {
      return null;
    }

    const q = query(
      collection(db, Reports.CollectionName),
      where('publisherId', '==', publisherId),
      where('monthId', '==', monthId)
    );

    const reports: Report[] = [];
    (await getDocs(q)).forEach((doc) => {
      reports.push({ ...doc.data(), id: doc.id } as Report);
    });

    store.dispatch(Reports.slice.actions.currentLoaded(reports.map(rep => {
      delete rep.date;
      return rep;
  })));
    return reports.length > 0 ? reports[0] : null;
  }

  static async byPublisherId(
    publisherId: string | undefined
  ): Promise<Report[]> {
    if (!publisherId) return [];

    const reports: Report[] = [];
    const q = query(
      collection(db, Reports.CollectionName),
      where('publisherId', '==', publisherId)
    );

    (await getDocs(q)).forEach((doc) => {
      reports.push({ ...doc.data(), id: doc.id } as Report);
    });

    store.dispatch(Reports.slice.actions.loadedByPublisher(reports.map(rep => {
      delete rep.date;
      return rep;
  })));

    return reports;
  }

  static async byMonthId(monthId: string | undefined): Promise<Report[]> {
    if (!monthId) return [];

    const reports: Report[] = [];
    const q = query(
      collection(db, Reports.CollectionName),
      where('monthId', '==', monthId)
    );

    (await getDocs(q)).forEach((doc) => {
      reports.push({ ...doc.data(), id: doc.id } as Report);
    });

    store.dispatch(Reports.slice.actions.loadedByMonth(reports.map(rep => {
      delete rep.date;
      return rep;
  })));
    return reports;
  }

  static async delete(report: Report | undefined): Promise<void> {
    if (!report) return;

    await deleteDoc(doc(db, Reports.CollectionName, report.id));

    store.dispatch(Reports.slice.actions.removed(report));
    Events.emit('report_deleted', report);
  }

  static async deleteByPublisherId(publisherId: string): Promise<void> {
    const q = query(
      collection(db, Reports.CollectionName),
      where('publisherId', '==', publisherId)
    );

    await runTransaction(db, async (transaction: Transaction) => {
      (await getDocs(q)).forEach((doc) => {
        transaction.delete(doc.ref);
      });
    });

    store.dispatch(Reports.slice.actions.removedByPublisher(publisherId));
  }
}
