import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  runTransaction,
  Transaction,
  documentId,
  startAt,
  endAt,
  updateDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { Events, Publisher, PublisherActivityStatus, Report } from '../types';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';
import { uniqueId } from 'lodash';
import { refreshPublisher } from './refresh-publisher';
import { auth } from '../auth';

interface PublishersByGroup {
  [groupId: string]: Publisher[];
}

export interface PublishersState {
  publishers: Publisher[];
  loading: boolean;
  byGroup: PublishersByGroup;
}

export enum PublisherDeletionReason {
  Gone,
  Disfellowshiped,
}

export enum NewPublisherReason {
  New,
  Transferred,
}

export class Publishers {
  private static InititalState: PublishersState = {
    publishers: [],
    loading: false,
    byGroup: {
      'pioneers': [],
      'inactives': [],
      'elders': [],
      'ministerial-servants': [],
    },
  };
  static CollectionName = 'Publishers';
  static slice = createSlice({
    name: 'Publishers',
    initialState: Publishers.InititalState,
    reducers: {
      added: (state, { payload }) => {
        state.publishers = [...state.publishers, payload];
        if (!state.byGroup[payload.groupId]) {
          state.byGroup[payload.groupId] = [];
        }
        state.byGroup['inactives'] = [...state.byGroup['inactives'], payload];
      },
      removed: (state, { payload }) => {
        const publisher = state.publishers.find(pub => pub.id === payload) || {groupId: 'unafiliated', id: payload};
        state.publishers = state.publishers.filter(publisher => publisher.id !== payload);
        if (state.byGroup[publisher.groupId]) {
          state.byGroup[publisher.groupId] = state.byGroup[publisher.groupId]
            .filter(publisher => publisher.id !== payload);
        }
        state.byGroup['pioneers'] = (state.byGroup['pioneers'] || [])
          .filter(publisher => publisher.id !== payload);
        state.byGroup['inactives'] = (state.byGroup['inactives'] || [])
          .filter(publisher => publisher.id !== payload);
        state.byGroup['elders'] = (state.byGroup['elders'] || [])
          .filter(publisher => publisher.id !== payload);
        state.byGroup['ministerial-servants'] = (state.byGroup['ministerial-servants'] || [])
          .filter(publisher => publisher.id !== payload);
      },
      loaded: (state, { payload }) => {
        state.publishers = payload;
        state.byGroup = {};
        payload.forEach((publisher: Publisher) => {
          if (!state.byGroup[publisher.groupId]) {
            state.byGroup[publisher.groupId] = [];
          }

          state.byGroup[publisher.groupId].push(publisher);
        });
        state.byGroup['pioneers'] = payload.filter((p: Publisher) => p.isRegularPioneer);
        state.byGroup['inactives'] = payload.filter((p: Publisher) => p.activityStatus === PublisherActivityStatus.Inactive);
        state.byGroup['elders'] = payload.filter((p: Publisher) => p.isElder);
        state.byGroup['ministerial-servants'] = payload.filter((p: Publisher) => p.isMinisterialServant);
      },
      changed: (state, { payload }) => {
        state.publishers = [...state.publishers.filter(p => p.id !== payload.id), payload];

        // Update regular group
        if (!state.byGroup[payload.groupId]) {
          state.byGroup[payload.groupId] = [];
        }
        state.byGroup[payload.groupId] = [...state.byGroup[payload.groupId].filter(p => p.id !== payload.id), payload];
        
        // Update special groups
        if (payload.activityStatus === PublisherActivityStatus.Inactive) {
          state.byGroup['inactives'] = [...(state.byGroup['inactives'] || []).filter(p => p.id !== payload.id), payload];
        } else {
          state.byGroup['inactives'] = (state.byGroup['inactives'] || []).filter(p => p.id !== payload.id);
        }
        
        if (payload.isRegularPioneer) {
          state.byGroup['pioneers'] = [...(state.byGroup['pioneers'] || []).filter(p => p.id !== payload.id), payload];
        } else {
          state.byGroup['pioneers'] = (state.byGroup['pioneers'] || []).filter(p => p.id !== payload.id);
        }
        
        if (payload.isElder) {
          state.byGroup['elders'] = [...(state.byGroup['elders'] || []).filter(p => p.id !== payload.id), payload];
        } else {
          state.byGroup['elders'] = (state.byGroup['elders'] || []).filter(p => p.id !== payload.id);
        }
        
        if (payload.isMinisterialServant) {
          state.byGroup['ministerial-servants'] = [...(state.byGroup['ministerial-servants'] || []).filter(p => p.id !== payload.id), payload];
        } else {
          state.byGroup['ministerial-servants'] = (state.byGroup['ministerial-servants'] || []).filter(p => p.id !== payload.id);
        }
      },
      manyChanged: (state, { payload }) => {
        const filtered = state.publishers.filter(p => !payload.publishers.some((p2: Publisher) => p2.id === p.id));
        state.publishers = [...filtered, ...payload.publishers];
        state.byGroup[payload.fromGroup] = [...(state.byGroup[payload.fromGroup] || []).filter(p1 => payload.publishers.some((p2: Publisher) => p1.id !== p2.id))]
        state.byGroup[payload.toGroup] = [...filtered, ...payload.publishers];
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      },
      groupDeleted: (state, { payload }) => {
        delete state.byGroup[payload]
        const publishers = state.publishers.filter(p => p.groupId === payload);
        publishers.forEach(p => p.groupId = 'unafiliated');

        if (!state.byGroup['unafiliated']) {
          state.byGroup['unafiliated'] = [];
        }
        state.byGroup['unafiliated'] = [...state.byGroup['unafiliated'], ...publishers];
      }
    }
  })

  static async create(publisher: Publisher, reason: NewPublisherReason): Promise<Publisher> {
    const inc = increment(1);
    const field = reason === NewPublisherReason.Transferred ? 'newComers' : 'newPublishers';

    const ref = await addDoc(collection(db, Publishers.CollectionName), { ...publisher, activityStatus: PublisherActivityStatus.Inactive });
    await updateDoc(doc(db, 'Stats/unique'), { [field]: inc });
    store.dispatch(Publishers.slice.actions.added({ ...publisher, id: ref.id, activityStatus: PublisherActivityStatus.Inactive }));
    const createdPublisher =  { ...publisher, id: ref.id };
    Events.emit('publisher_updated', createdPublisher);

    return createdPublisher;
  }

  static async all(): Promise<Publisher[]> {
    const publishers: Publisher[] = [];
    const q = query(collection(db, Publishers.CollectionName), orderBy('name'));

    (await getDocs(q)).forEach((doc) => {
      publishers.push({ ...doc.data(), id: doc.id } as Publisher);
    });

    // Load and combine legacy reports with publisher reports
    await Publishers.loadAndCombineLegacyReports(publishers);

    store.dispatch(Publishers.slice.actions.loaded(publishers));
    return publishers;
  }

  /**
   * Loads legacy reports and combines them with publisher data
   * @param publishers - Array of publishers to combine with legacy reports
   */
  private static async loadAndCombineLegacyReports(publishers: Publisher[]): Promise<void> {
    const LEGACY_REPORTS_COLLECTION = 'Repports';
    
    try {
      // Load all legacy reports
      const legacyReports: Report[] = [];
      const reportsQuery = query(collection(db, LEGACY_REPORTS_COLLECTION));
      
      (await getDocs(reportsQuery)).forEach((doc) => {
        legacyReports.push({ ...doc.data(), id: doc.id } as Report);
      });

      // Group legacy reports by publisherId
      const legacyReportsByPublisher: { [publisherId: string]: Report[] } = {};
      legacyReports.forEach(report => {
        if (!legacyReportsByPublisher[report.publisherId]) {
          legacyReportsByPublisher[report.publisherId] = [];
        }
        legacyReportsByPublisher[report.publisherId].push(report);
      });

      // Combine legacy reports with publisher reports
      publishers.forEach(publisher => {
        if (publisher.id) {
          const existingReports = publisher.reports || [];
          const legacyReports = legacyReportsByPublisher[publisher.id] || [];
          
          // Merge reports, avoiding duplicates
          const allReports = [...existingReports];
          legacyReports.forEach(legacyReport => {
            if (!allReports.some(r => r.id === legacyReport.id)) {
              allReports.push(legacyReport);
            }
          });
          
          publisher.reports = allReports;
        }
      });
    } catch (error) {
      console.warn('Error loading legacy reports:', error);
      // Continue without legacy reports if there's an error
    }
  }

  static async save(publisher: Publisher, skipRefresh = false, shouldShowFlags = true): Promise<Publisher> {
    const updatedPublisher = skipRefresh ? publisher : await refreshPublisher(publisher, false);
    await setDoc(
      doc(db, Publishers.CollectionName, publisher.id || ''),
      updatedPublisher
    );

    store.dispatch(Publishers.slice.actions.changed(updatedPublisher));
    if (shouldShowFlags) {
      Events.emit('publisher_updated', updatedPublisher);
    }
    return updatedPublisher;
  }

  static async delete(publisherId: string | undefined, reason: PublisherDeletionReason): Promise<void> {
    if (!publisherId) return;
    const inc = increment(1);
    const field = reason === PublisherDeletionReason.Disfellowshiped ? 'disfellowshiped' : 'gone';

    // Delete legacy reports from the Reports collection (for backward compatibility)
    await Publishers.deleteReportsFromLegacyCollection(publisherId);
    
    await deleteDoc(doc(db, Publishers.CollectionName, publisherId));
    await updateDoc(doc(db, 'Stats/unique'), { [field]: inc, });
    Events.emit('publisher_deleted', { id: publisherId });

    store.dispatch(Publishers.slice.actions.removed(publisherId));
  }

  /**
   * Deletes reports from the legacy Reports collection for a given publisher
   * @param publisherId - The ID of the publisher whose reports should be deleted
   */
  private static async deleteReportsFromLegacyCollection(publisherId: string): Promise<void> {
    const LEGACY_REPORTS_COLLECTION = 'Repports';
    const q = query(
      collection(db, LEGACY_REPORTS_COLLECTION),
      where('publisherId', '==', publisherId)
    );

    await runTransaction(db, async (transaction: Transaction) => {
      (await getDocs(q)).forEach((doc) => {
        transaction.delete(doc.ref);
      });
    });
  }

  static async transferToGroup(publishers: Publisher[], groupId: string, groupDeleted: boolean, fromGroup: string) {
    const publishersIdsByTens = [] as string[][];
    
    publishers.forEach((p: Publisher, index: number) => {
      const byTensIdx = Math.floor((index + 1) / 10);
      if (!publishersIdsByTens[byTensIdx]) {
        publishersIdsByTens[byTensIdx] = [] as string[];

        if (p.id) {
          publishersIdsByTens[byTensIdx].push(p.id);
        }
      }
    });

    for (const ids of publishersIdsByTens) {
      const q = query(
        collection(db, Publishers.CollectionName),
        where(
          documentId(),
          'in',
          ids,
        )
      );
  
      await runTransaction(db, async (transaction: Transaction) => {
        const docs = await getDocs(q);
        docs.forEach((doc) => {
          transaction.update(doc.ref, { ...doc.data(), groupId });
        });
      });
    }
    
    if (groupDeleted) {
      store.dispatch(Publishers.slice.actions.groupDeleted(fromGroup));
    } else {
      const changedPublishers = publishers.map(p => ({ ...p, groupId }));
      store.dispatch(Publishers.slice.actions.manyChanged({
        fromGroup: fromGroup,
        toGroup: groupId,
        publishers: changedPublishers
      }));
      Events.emit('publishers_transfered', { id: uniqueId(), publishers: changedPublishers, fromGroup, toGroup: groupId});
    }
  }

  static async findByName(namePart: string): Promise<Publisher[]> {
    const normalizedNamePart = `${namePart
      .charAt(0)
      .toUpperCase()}${namePart.slice(1)}`;
    const publishers: Publisher[] = [];
    const q = query(
      collection(db, Publishers.CollectionName),
      orderBy('name'),
      startAt(normalizedNamePart),
      endAt(`${normalizedNamePart}\uf8ff`),
    );

    (await getDocs(q)).forEach((doc) => {
      publishers.push({ ...doc.data(), id: doc.id } as Publisher);
    });

    return publishers;
  }

  // ==== REPORT MANAGEMENT METHODS ====
  // These methods manage reports as arrays within publisher documents
  
  /**
   * Creates a new report and adds it to the publisher's reports array
   * @param publisherId - The ID of the publisher
   * @param report - The report to create
   * @returns The created report with ID
   */
  static async createReport(publisherId: string, report: Report): Promise<Report> {
    const reportWithId = { ...report, id: uniqueId(), publisherId };
    
    const publisherRef = doc(db, Publishers.CollectionName, publisherId);
    
    // Use transaction to safely update the publisher's reports array
    await runTransaction(db, async (transaction) => {
      const publisherDoc = await transaction.get(publisherRef);
      if (!publisherDoc.exists()) {
        throw new Error(`Publisher with id ${publisherId} not found`);
      }
      
      const publisherData = publisherDoc.data() as Publisher;
      const existingReports = publisherData.reports || [];
      const updatedReports = [...existingReports, reportWithId];
      
      transaction.update(publisherRef, { reports: updatedReports });
    });

    // Update the local store
    const publishers = store.getState().publishers.publishers;
    const publisherIndex = publishers.findIndex(p => p.id === publisherId);
    if (publisherIndex !== -1) {
      const updatedPublisher = {
        ...publishers[publisherIndex],
        reports: [...(publishers[publisherIndex].reports || []), reportWithId]
      };
      store.dispatch(Publishers.slice.actions.changed(updatedPublisher));
    }

    Events.emit('report_updated', reportWithId);
    return reportWithId;
  }

  /**
   * Updates an existing report in the publisher's reports array
   * @param publisherId - The ID of the publisher
   * @param report - The updated report
   * @returns The updated report
   */
  static async updateReport(publisherId: string, report: Report): Promise<Report> {
    const publisherRef = doc(db, Publishers.CollectionName, publisherId);
    
    await runTransaction(db, async (transaction) => {
      const publisherDoc = await transaction.get(publisherRef);
      if (!publisherDoc.exists()) {
        throw new Error(`Publisher with id ${publisherId} not found`);
      }
      
      const publisherData = publisherDoc.data() as Publisher;
      const existingReports = publisherData.reports || [];
      const reportIndex = existingReports.findIndex(r => r.id === report.id);
      
      if (reportIndex === -1) {
        throw new Error(`Report with id ${report.id} not found for publisher ${publisherId}`);
      }
      
      const updatedReports = [...existingReports];
      updatedReports[reportIndex] = report;
      
      transaction.update(publisherRef, { reports: updatedReports });
    });

    // Update the local store
    const publishers = store.getState().publishers.publishers;
    const publisherIndex = publishers.findIndex(p => p.id === publisherId);
    if (publisherIndex !== -1) {
      const existingReports = publishers[publisherIndex].reports || [];
      const updatedReports = existingReports.map(r => r.id === report.id ? report : r);
      const updatedPublisher = {
        ...publishers[publisherIndex],
        reports: updatedReports
      };
      store.dispatch(Publishers.slice.actions.changed(updatedPublisher));
    }

    Events.emit('report_updated', report);
    return report;
  }

  /**
   * Deletes a report from the publisher's reports array
   * Also checks and deletes from legacy Reports collection for backward compatibility
   * @param publisherId - The ID of the publisher
   * @param reportId - The ID of the report to delete
   */
  static async deleteReport(publisherId: string, reportId: string): Promise<void> {
    const publisherRef = doc(db, Publishers.CollectionName, publisherId);
    
    await runTransaction(db, async (transaction) => {
      const publisherDoc = await transaction.get(publisherRef);
      if (!publisherDoc.exists()) {
        throw new Error(`Publisher with id ${publisherId} not found`);
      }
      
      const publisherData = publisherDoc.data() as Publisher;
      const existingReports = publisherData.reports || [];
      const updatedReports = existingReports.filter(r => r.id !== reportId);
      
      transaction.update(publisherRef, { reports: updatedReports });
    });

    // Also delete from legacy Reports collection if it exists there
    try {
      const LEGACY_REPORTS_COLLECTION = 'Repports';
      const legacyReportRef = doc(db, LEGACY_REPORTS_COLLECTION, reportId);
      await deleteDoc(legacyReportRef);
    } catch (error) {
      // Ignore error if document doesn't exist in legacy collection
      console.log('Report not found in legacy collection (this is expected for new reports):', error);
    }

    // Update the local store
    const publishers = store.getState().publishers.publishers;
    const publisherIndex = publishers.findIndex(p => p.id === publisherId);
    if (publisherIndex !== -1) {
      const updatedReports = (publishers[publisherIndex].reports || []).filter(r => r.id !== reportId);
      const updatedPublisher = {
        ...publishers[publisherIndex],
        reports: updatedReports
      };
      store.dispatch(Publishers.slice.actions.changed(updatedPublisher));
    }

    Events.emit('report_deleted', { id: reportId, publisherId });
  }

  /**
   * Gets all reports for a specific publisher
   * @param publisherId - The ID of the publisher
   * @returns Array of reports for the publisher
   */
  static getReportsByPublisher(publisherId: string): Report[] {
    const publishers = store.getState().publishers.publishers;
    const publisher = publishers.find(p => p.id === publisherId);
    return publisher?.reports || [];
  }

  /**
   * Gets all reports for a specific month across all publishers
   * @param monthId - The month ID
   * @returns Array of reports for the month
   */
  static getReportsByMonth(monthId: string): Report[] {
    const publishers = store.getState().publishers.publishers;
    const allReports: Report[] = [];
    
    publishers.forEach(publisher => {
      if (publisher.reports) {
        const monthReports = publisher.reports.filter(r => r.monthId === monthId);
        allReports.push(...monthReports);
      }
    });
    
    return allReports;
  }

  /**
   * Migrates legacy reports from the Reports collection to publisher documents
   * This method should be called during the migration period to move old reports
   */
  static async migrateLegacyReports(): Promise<void> {
    try {
      // Define the legacy Reports collection name
      const LEGACY_REPORTS_COLLECTION = 'Repports'; // Note: keeping the original typo from the legacy system
      
      // Load all legacy reports from the Reports collection
      const legacyReports: Report[] = [];
      const reportsQuery = query(collection(db, LEGACY_REPORTS_COLLECTION));
      
      (await getDocs(reportsQuery)).forEach((doc) => {
        legacyReports.push({ ...doc.data(), id: doc.id } as Report);
      });

      // Group reports by publisherId
      const reportsByPublisher: { [publisherId: string]: Report[] } = {};
      legacyReports.forEach(report => {
        if (!reportsByPublisher[report.publisherId]) {
          reportsByPublisher[report.publisherId] = [];
        }
        reportsByPublisher[report.publisherId].push(report);
      });

      // Update each publisher with their reports
      for (const [publisherId, reports] of Object.entries(reportsByPublisher)) {
        const publisherRef = doc(db, Publishers.CollectionName, publisherId);
        
        await runTransaction(db, async (transaction) => {
          const publisherDoc = await transaction.get(publisherRef);
          if (publisherDoc.exists()) {
            const publisherData = publisherDoc.data() as Publisher;
            const existingReports = publisherData.reports || [];
            
            // Merge legacy reports with existing reports, avoiding duplicates
            const allReports = [...existingReports];
            reports.forEach(legacyReport => {
              if (!allReports.some(r => r.id === legacyReport.id)) {
                allReports.push(legacyReport);
              }
            });
            
            transaction.update(publisherRef, { reports: allReports });
          }
        });
      }

      console.log(`Migrated ${legacyReports.length} legacy reports to publisher documents`);
    } catch (error) {
      console.error('Error migrating legacy reports:', error);
      throw error;
    }
  }
}
