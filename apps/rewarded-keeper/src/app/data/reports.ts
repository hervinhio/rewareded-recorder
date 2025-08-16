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
import { Users } from './users';
import { isPublisherAuxilaryPionierForMonth } from '../types/publisher';
import { StatsUtils } from './stats';

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
  static CollectionName = 'Repports'; // DEPRECATED: This collection is being migrated to user.reports array
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

  /**
   * DEPRECATED: Legacy method for loading reports from the separate Reports collection.
   * Use loadAllCombined() instead which combines legacy and new user-based reports.
   */
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

  /**
   * Combines reports from legacy Reports collection with reports from user.reports array.
   * This method should be used during the migration period to load all reports.
   */
  static async loadAllCombined(): Promise<Report[]> {
    // Load legacy reports (DEPRECATED)
    const legacyReports: Report[] = [];
    const legacyQuery = query(collection(db, Reports.CollectionName));
    
    (await getDocs(legacyQuery)).forEach((doc) => {
      legacyReports.push({ ...doc.data(), id: doc.id } as Report);
    });

    // Load reports from all users' reports arrays (NEW)
    const userReports: Report[] = [];
    try {
      const allUsers = await Users.getAll();
      allUsers.forEach(user => {
        if (user.reports) {
          userReports.push(...user.reports);
        }
      });
    } catch (error) {
      console.warn('Could not load user reports:', error);
    }

    // Combine and deduplicate reports by ID
    const allReports = [...legacyReports, ...userReports];
    const uniqueReports = allReports.filter((report, index, self) => 
      index === self.findIndex(r => r.id === report.id)
    );

    store.dispatch(Reports.slice.actions.loaded(uniqueReports.map(rep => {
        return rep;
    })));
    return uniqueReports;
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
    
    if (isAuxiliaryPioneerForMonth || publisher.isPermanentAuxilaryPioneer || report.isAPReport) {
      // Check if the goal is met for this month
      const goalMet = await hasMetAuxiliaryPioneerGoal(report.hours, report.monthId);
      
      if (!goalMet) {
        // Goal not met - remove month from auxilaryPionierFor array
        const updatedAuxilaryPionierFor = (publisher.auxilaryPionierFor || [])
          .filter(monthId => monthId !== report.monthId);
        
        const updatedPublisher = {
          ...publisher,
          auxilaryPionierFor: updatedAuxilaryPionierFor,
          isPermanentAuxilaryPioneer: false // Reset permanent status if goal not met
        };
        
        // Update the publisher in the database
        await Publishers.save(updatedPublisher, true, false);
        
        // Return report with isAPReport set to false
        return {
          ...report,
          isAPReport: false
        };
      } else {
        // If isAPReport is true but the month is not in auxilaryPionierFor, add it and save publisher
        if (report.isAPReport && !(publisher.auxilaryPionierFor || []).includes(report.monthId)) {
          const updatedAuxilaryPionierFor = [...(publisher.auxilaryPionierFor || []), report.monthId];
          const updatedPublisher = {
            ...publisher,
            auxilaryPionierFor: updatedAuxilaryPionierFor
          };
          await Publishers.save(updatedPublisher, true, false);
        }
        // Goal is met - track this achievement in stats
        try {
          await StatsUtils.addAuxiliaryPioneerAchievement(report.publisherId);
        } catch (error) {
          console.error('Error tracking auxiliary pioneer achievement:', error);
          // Don't fail the report processing if stats tracking fails
        }
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
    
    // DEPRECATED: Legacy save to separate Reports collection - kept for backward compatibility
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
    
    // DEPRECATED: Legacy update in separate Reports collection - kept for backward compatibility
    await updateDoc(doc(db, Reports.CollectionName, updatedReport.id), updatedReport as any);
    store.dispatch(Reports.slice.actions.changed(updatedReport));
    Events.emit('report_updated', updatedReport)
    return updatedReport;
  }

  /**
   * DEPRECATED: Legacy method for loading reports by month and publisher from the separate Reports collection.
   * Use byMonthIdAndPublisherIdCombined() for new functionality that combines legacy and user-based reports.
   */
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

  /**
   * DEPRECATED: Legacy method for loading reports by publisher ID from the separate Reports collection.
   * Use byPublisherIdCombined() instead which combines legacy and new user-based reports.
   */
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

  /**
   * Combines reports from legacy Reports collection with reports from user.reports array for a specific publisher.
   * This method should be used during the migration period to load reports for a publisher.
   */
  static async byPublisherIdCombined(publisherId: string | undefined): Promise<Report[]> {
    if (!publisherId) return [];

    // Load legacy reports (DEPRECATED)
    const legacyReports: Report[] = [];
    const legacyQuery = query(
      collection(db, Reports.CollectionName),
      where('publisherId', '==', publisherId)
    );

    (await getDocs(legacyQuery)).forEach((doc) => {
      legacyReports.push({ ...doc.data(), id: doc.id } as Report);
    });

    // Load reports from user's reports array (NEW)
    const userReports: Report[] = [];
    try {
      const allUsers = await Users.getAll();
      const user = allUsers.find(u => u.publisherId === publisherId);
      if (user && user.reports) {
        userReports.push(...user.reports.filter(r => r.publisherId === publisherId));
      }
    } catch (error) {
      console.warn('Could not load user reports for publisher:', publisherId, error);
    }

    // Combine and deduplicate reports by ID
    const allReports = [...legacyReports, ...userReports];
    const uniqueReports = allReports.filter((report, index, self) => 
      index === self.findIndex(r => r.id === report.id)
    );

    store.dispatch(Reports.slice.actions.loadedByPublisher(uniqueReports.map(rep => {
      delete rep.date;
      return rep;
    })));

    return uniqueReports;
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

    // DEPRECATED: Legacy delete from separate Reports collection - kept for backward compatibility
    try {
      await deleteDoc(doc(db, Reports.CollectionName, report.id));
    } catch (error) {
      console.warn('Could not delete from legacy Reports collection:', error);
    }

    // NEW: Also try to delete from user's reports array
    try {
      const allUsers = await Users.getAll();
      const user = allUsers.find(u => u.publisherId === report.publisherId);
      if (user && user.reports) {
        const updatedReports = user.reports.filter(r => r.id !== report.id);
        const updatedUser = { ...user, reports: updatedReports };
        await Users.update(updatedUser);
      }
    } catch (error) {
      console.warn('Could not delete from user reports array:', error);
    }

    store.dispatch(Reports.slice.actions.removed(report));
    Events.emit('report_deleted', report);
  }

  static async deleteByPublisherId(publisherId: string): Promise<void> {
    // DEPRECATED: Legacy delete from separate Reports collection - kept for backward compatibility
    const q = query(
      collection(db, Reports.CollectionName),
      where('publisherId', '==', publisherId)
    );

    try {
      await runTransaction(db, async (transaction: Transaction) => {
        (await getDocs(q)).forEach((doc) => {
          transaction.delete(doc.ref);
        });
      });
    } catch (error) {
      console.warn('Could not delete from legacy Reports collection:', error);
    }

    // NEW: Also delete from user's reports array  
    try {
      const allUsers = await Users.getAll();
      const user = allUsers.find(u => u.publisherId === publisherId);
      if (user && user.reports) {
        const updatedUser = { ...user, reports: [] };
        await Users.update(updatedUser);
      }
    } catch (error) {
      console.warn('Could not delete from user reports array:', error);
    }

    store.dispatch(Reports.slice.actions.removedByPublisher(publisherId));
  }
}
