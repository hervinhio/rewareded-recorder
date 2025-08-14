import { addDoc, collection, doc, getDocs, orderBy, query, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';
import { Users } from './users';

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
  date: Timestamp | Date;
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
    const currentUser = Users.getCurrent();
    
    if (!currentUser || !currentUser.notifications) {
      store.dispatch(Notifications.slice.actions.loaded([]));
      return [];
    }

    // Sort notifications by date (most recent first)
    const sortedNotifications = [...currentUser.notifications].sort(
      (a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date);
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date);
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

    // Find and update the notification in the user's notifications array
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

  static async addNotificationToUser(userId: string, notification: Notification): Promise<void> {
    // This method can be used to add notifications to specific users
    // For now, it just updates the current user if it matches
    const currentUser = Users.getCurrent();
    if (currentUser && currentUser.id === userId) {
      const updatedNotifications = [...(currentUser.notifications || []), notification];
      const updatedUser = { ...currentUser, notifications: updatedNotifications };
      
      await Users.update(updatedUser);
      Users.setCurrent(updatedUser);
      
      // Update the store
      this.get();
    }
  }

  static async saveSubmission(): Promise<void> {
    // For backward compatibility, still add to the old collection
    // This can be removed once we fully migrate
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
