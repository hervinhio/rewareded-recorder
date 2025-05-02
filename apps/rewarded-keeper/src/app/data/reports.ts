import { Events, Report } from '../types';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';
import { getLastSixMonths } from '../utils';
import { uniqueId } from 'lodash';
import { Submission, SubmissionData } from '../types';
import { Submissions } from './submissions';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Flags } from './flags';
import { Users } from './users';

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
    try {
      const reports = await axios.get<Report[]>('/reports/unsubmitted', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
      }).then(res => res.data);
      store.dispatch(Reports.slice.actions.unsubmittedLoaded(reports));
    } catch (error) {
      Flags.raiseError({ title: 'Unable to load unsubmitted reports', message: (error as AxiosError).message });
    }
  }

  static async all() {
    try {
      const reports = await axios.get<Report[]>('/reports', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
      }).then(res => res.data);
      store.dispatch(Reports.slice.actions.loaded(reports));
    } catch (error) {
      Flags.raiseError({ title: 'Unable to load reports', message: (error as AxiosError).message });
    }
  }

  static async submitAll() {
    const submission = this.createSubmissionHistoryEntry();
    const currentMonthKey = getLastSixMonths()[0].getKey();

    try {
      await axios.post('/reports/submit', { month: currentMonthKey }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
      })
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
      date: new Date(),
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

  static async create(report: Report): Promise<Report> {
    try {
      const createdReport = await axios.post<Report, AxiosResponse<Report>>(
        '/reports',
        {
          ...report,
          date: new Date(),
          authorId: Users.getCurrent().id,
        },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
        }
      ).then(res => res.data);
      delete (createdReport as any).date;
      store.dispatch(Reports.slice.actions.added(createdReport));
      Events.emit('report_updated', createdReport);
      return createdReport;
    } catch {
      Flags.raiseError({ title: 'Unable to create report', message: 'Unable to create report' });
      return report;
    }
  }

  static async update(report: Report): Promise<Report> {
    try {
      const updatedReport = await axios.patch<Report, AxiosResponse<Report>>(
        '/reports/' + report.id,
        report,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
        }
      ).then(res => res.data);
      store.dispatch(Reports.slice.actions.changed(report));
      Events.emit('report_updated', report);
      return updatedReport;
    } catch (error) {
      return report;
    }
  }

  static async delete(report: Report | undefined): Promise<void> {
    if (!report) return;

    try {
      await axios.delete('/reports/' + report.id);
      store.dispatch(Reports.slice.actions.removed(report));
      Events.emit('report_deleted', report);
    } catch (error) {
      Flags.raiseError({ title: 'Unable to delete report', message: (error as AxiosError).message });
    }
  }

  static async deleteByPublisherId(publisherId: string): Promise<void> {
    try {
      await axios.delete('/publishers/' + publisherId + '/reports');
      store.dispatch(Reports.slice.actions.removedByPublisher(publisherId));
    } catch (error) {
      Flags.raiseError({ title: 'Unable to delete publishers reports', message: (error as AxiosError).message });
    }
  }
}
