import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';
import { Users } from './users';
import { Congregations } from './congregations';

export enum NotificationType {
  ReportCreated,
  ReportUpdated,
  ReportDeleted,
  ReportsSubmitted,
  PublisherCreated,
  PublisherUpdated,
  PublisherDeleted,
  PublisherMoved,
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
  date: Timestamp | Date;
  type: NotificationType;
  unread: boolean;
  meta?: Record<string, unknown>;
}

export interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
}

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

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
    const currentUser = Users.getCurrent();
    
    if (!currentUser || !currentUser.notifications) {
      store.dispatch(Notifications.slice.actions.loaded([]));
      return [];
    }

    // Auto-remove read notifications that are older than 1 year
    const now = Date.now();
    const activeNotifications = currentUser.notifications.filter((n) => {
      if (n.unread) return true;
      const d = n.date instanceof Timestamp ? n.date.toDate() : new Date(n.date as any);
      return now - d.getTime() <= ONE_YEAR_MS;
    });

    // Persist removals if any notifications were pruned
    if (activeNotifications.length < currentUser.notifications.length) {
      const updatedUser = { ...currentUser, notifications: activeNotifications };
      await Users.update(updatedUser);
      Users.setCurrent(updatedUser);
    }

    // Sort notifications by date (most recent first)
    const sortedNotifications = [...activeNotifications].sort(
      (a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date as any);
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date as any);
        return dateB.getTime() - dateA.getTime();
      }
    );

    store.dispatch(Notifications.slice.actions.loaded(sortedNotifications));
    return sortedNotifications;
  }

  static async markAsRead(notif: Notification): Promise<Notification> {
    const currentUser = Users.getCurrent();
    if (!currentUser || !currentUser.notifications) {
      return notif;
    }

    const updatedNotifications = currentUser.notifications.map(n => 
      n.id === notif.id ? { ...n, unread: false } : n
    );

    const updatedUser = { ...currentUser, notifications: updatedNotifications };
    
    await Users.update(updatedUser);
    Users.setCurrent(updatedUser);

    // Update the store
    this.get();

    return { ...notif, unread: false };
  }

  static async deleteNotification(notif: Notification): Promise<void> {
    const currentUser = Users.getCurrent();
    if (!currentUser || !currentUser.notifications) return;

    // Only allow deleting read notifications
    if (notif.unread) return;

    const updatedNotifications = currentUser.notifications.filter(
      (n) => n.id !== notif.id
    );

    const updatedUser = { ...currentUser, notifications: updatedNotifications };
    await Users.update(updatedUser);
    Users.setCurrent(updatedUser);

    this.get();
  }

  static async addNotificationToUser(userId: string, notification: Notification): Promise<void> {
    const currentUser = Users.getCurrent();
    if (currentUser && currentUser.id === userId) {
      const updatedNotifications = [...(currentUser.notifications || []), notification];
      const updatedUser = { ...currentUser, notifications: updatedNotifications };
      
      await Users.update(updatedUser);
      Users.setCurrent(updatedUser);
      
      this.get();
    }
  }

  static async saveSubmission(): Promise<void> {
    const congregationId = Congregations.getActiveCongregationId();
    await addDoc(collection(db, Notifications.CollectionName), {
      author: {
        id: 'admin',
        name: 'Admin',
      },
      date: new Date(),
      type: NotificationType.ReportsSubmitted,
      unread: true,
      ...(congregationId ? { congregationId } : {}),
    });
  }
}
