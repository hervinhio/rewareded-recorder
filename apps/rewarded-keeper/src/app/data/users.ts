import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc } from 'firebase/firestore';
import { db, store } from '.';
import { User, Role } from '../types';
import { Report } from '../types/report';
import { createSlice } from '@reduxjs/toolkit';

interface UserMap {
  [id: string]: User,
}

export interface UsersState {
  current?: User;
  users: UserMap;
  loading: boolean;
}

export class Users {
  private static InitialState: UsersState = {
    loading: false,
    users: {},
  };
  private static readonly CollectionName = 'Users';
  private static current: User;
  static slice = createSlice({
    name: 'Users',
    initialState: Users.InitialState,
    reducers: {
      currentUserSet: (state, { payload }) => {
        state.current = payload;
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      },
      loaded: (state, { payload }) => {
        payload?.forEach((user: User) => {
          state.users[user.id] = user;
        })
      },
      updated: (state, { payload }) => {
        state.users[payload.id] = { ...payload };
      },
      deleted: (state, { payload }) => {
        delete state.users[payload.id];
      }
    }
  })

  static async getOne(id: string): Promise<User | null> {
    const userDoc = await getDoc(doc(collection(db, Users.CollectionName), id));

    if (userDoc.exists()) {
      return userDoc.data() as User;
    }

    return null;
  }

  static async create(user: User): Promise<User> {
    user.admin = false;
    user.validated = false;
    // Set default role to basic if not specified
    if (!user.role) {
      user.role = Role.BASIC;
    }

    await setDoc(doc(collection(db, Users.CollectionName), user.id), user);
    return user;
  }

  static setCurrent(user: User) {
    Users.current = user;
  }

  static getCurrent(): User {
    return Users.current;
  }

  static async delete(userId: string): Promise<void> {
    await deleteDoc(doc(db, `${Users.CollectionName}/${userId}`));
    store.dispatch(Users.slice.actions.deleted(userId));
  }

  static async update(user: User): Promise<void> {
    await updateDoc(doc(db, `${Users.CollectionName}/${user.id}`), { ...user });
    store.dispatch(Users.slice.actions.updated(user));
  }

  static async all(): Promise<void> {
    const users: User[] = [];

    const q = query(
      collection(db, this.CollectionName)
    );

    (await getDocs(q)).forEach((doc) => {
      users.push({ ...doc.data() as User, id: doc.id, });
    });

    store.dispatch(Users.slice.actions.loaded(users));
  }

  static async getAll(): Promise<User[]> {
    const users: User[] = [];

    const q = query(
      collection(db, this.CollectionName)
    );

    (await getDocs(q)).forEach((doc) => {
      users.push({ ...doc.data() as User, id: doc.id, });
    });

    return users;
  }

  // Helper methods for managing user reports

  /**
   * Get all reports from all users
   */
  static getAllReports(): Report[] {
    const allReports: Report[] = [];
    const users = Object.values(store.getState().users.users);
    
    users.forEach(user => {
      if (user.reports) {
        allReports.push(...user.reports);
      }
    });

    return allReports;
  }

  /**
   * Get reports for a specific publisher ID
   */
  static getReportsByPublisherId(publisherId: string): Report[] {
    const user = Object.values(store.getState().users.users).find(u => u.publisherId === publisherId);
    return user?.reports || [];
  }

  /**
   * Get reports for a specific month ID
   */
  static getReportsByMonthId(monthId: string): Report[] {
    const allReports = this.getAllReports();
    return allReports.filter(report => report.monthId === monthId);
  }

  /**
   * Get unsubmitted reports
   */
  static getUnsubmittedReports(): Report[] {
    const allReports = this.getAllReports();
    return allReports.filter(report => !report.submitted);
  }

  /**
   * Add a report to a user's reports array
   */
  static async addReportToUser(publisherId: string, report: Report): Promise<void> {
    const user = Object.values(store.getState().users.users).find(u => u.publisherId === publisherId);
    if (!user) {
      console.warn(`User with publisherId ${publisherId} not found`);
      return;
    }

    const updatedReports = [...(user.reports || []), report];
    const updatedUser = { ...user, reports: updatedReports };
    
    await this.update(updatedUser);
  }

  /**
   * Update a report in a user's reports array
   */
  static async updateReportInUser(publisherId: string, updatedReport: Report): Promise<void> {
    const user = Object.values(store.getState().users.users).find(u => u.publisherId === publisherId);
    if (!user) {
      console.warn(`User with publisherId ${publisherId} not found`);
      return;
    }

    const updatedReports = (user.reports || []).map(report => 
      report.id === updatedReport.id ? updatedReport : report
    );
    const updatedUser = { ...user, reports: updatedReports };
    
    await this.update(updatedUser);
  }

  /**
   * Remove a report from a user's reports array
   */
  static async removeReportFromUser(publisherId: string, reportId: string): Promise<void> {
    const user = Object.values(store.getState().users.users).find(u => u.publisherId === publisherId);
    if (!user) {
      console.warn(`User with publisherId ${publisherId} not found`);
      return;
    }

    const updatedReports = (user.reports || []).filter(report => report.id !== reportId);
    const updatedUser = { ...user, reports: updatedReports };
    
    await this.update(updatedUser);
  }

  /**
   * Append reports from legacy collection to users' reports arrays
   */
  static async appendLegacyReportsToUsers(legacyReports: Report[]): Promise<void> {
    const users = Object.values(store.getState().users.users);
    const usersToUpdate: User[] = [];

    // Group legacy reports by publisher ID
    const reportsByPublisher: { [publisherId: string]: Report[] } = {};
    legacyReports.forEach(report => {
      if (!reportsByPublisher[report.publisherId]) {
        reportsByPublisher[report.publisherId] = [];
      }
      reportsByPublisher[report.publisherId].push(report);
    });

    // Find users and merge reports
    users.forEach(user => {
      const legacyReportsForUser = reportsByPublisher[user.publisherId] || [];
      if (legacyReportsForUser.length > 0) {
        const existingReports = user.reports || [];
        const existingIds = new Set(existingReports.map(r => r.id));
        
        // Only add reports that don't already exist
        const newReports = legacyReportsForUser.filter(report => !existingIds.has(report.id));
        
        if (newReports.length > 0) {
          const updatedUser = {
            ...user,
            reports: [...existingReports, ...newReports]
          };
          usersToUpdate.push(updatedUser);
        }
      }
    });

    // Update users with merged reports
    for (const user of usersToUpdate) {
      store.dispatch(Users.slice.actions.updated(user));
    }
  }
}
