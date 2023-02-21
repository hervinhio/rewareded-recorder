import { addDoc, collection, doc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { auth } from '../auth';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';

export enum NotificationType {
  ReportCreated,
  ReportUpdated,
  ReportDeleted,
  ReportsSubmitted,
  UserRegistered,
}

export interface Notification {
  id: string,
  publisher: {
    id: string;
    name: string;
  },
  author: {
      id: string;
      name: string;
  },
  date: Timestamp;
  type: NotificationType;
  unread: boolean;
}

export interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
}

export class Notifications {
  private static readonly InititalState: NotificationsState = {
    notifications: [],
    loading: false, 
  };
  static readonly CollectionName = 'Notifications';
  static readonly slice = createSlice({
    name: 'Notifications',
    initialState: Notifications.InititalState,
    reducers: {
      loaded: (state, { payload }) => {
        state.notifications = payload;
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      }
    }
  })

  static async get(): Promise<Notification[]> {
    const q = query(
      collection(db, Notifications.CollectionName),
      // where('author.id', '!=', auth.currentUser?.uid),
      orderBy('author.id'),
      orderBy('date', 'desc')
    );
    const notifs: Notification[] = [];

    (await getDocs(q)).forEach((notif) => {
      notifs.push({ ...notif.data() as Notification, id: notif.id });
    });

    store.dispatch(Notifications.slice.actions.loaded(notifs));

    return notifs;
  }

  static async markAsRead(notif: Notification): Promise<Notification> {
    await updateDoc(doc(db, Notifications.CollectionName, notif.id || ''), {...notif, unread: false});
    return {...notif, unread: false};
  }

  static async saveSubmission(): Promise<void> {
    await addDoc(collection(db, Notifications.CollectionName), {
      author: {
        id: 'admin',
        name: 'Admin',
      },
      date: new Date(),
      type: NotificationType.ReportsSubmitted,
      unread: true,
    });
  }
}
