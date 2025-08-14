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
    const currentUser = Users.getCurrent();
    if (!currentUser) {
      return [];
    }

    // Fetch user with notifications from database
    const userWithNotifications = await Users.getOne(currentUser.id);
    const notifs: Notification[] = userWithNotifications?.notifications || [];

    store.dispatch(Notifications.slice.actions.loaded(notifs));

    return notifs;
  }

  static async markAsRead(notif: Notification): Promise<Notification> {
    const currentUser = Users.getCurrent();
    if (!currentUser) {
      return notif;
    }

    // Get current user data with notifications
    const userWithNotifications = await Users.getOne(currentUser.id);
    if (!userWithNotifications?.notifications) {
      return notif;
    }

    // Update the specific notification in the array
    const updatedNotifications = userWithNotifications.notifications.map(n => 
      n.id === notif.id ? { ...n, unread: false } : n
    );

    // Update the user document with the modified notifications array
    await Users.update({ ...userWithNotifications, notifications: updatedNotifications });

    return {...notif, unread: false};
  }

  static async saveSubmission(): Promise<void> {
    // Use backend API to create notification which will be embedded in user documents
    const notificationData = {
      author: {
        id: 'admin',
        name: 'Admin',
      },
      authorId: 'admin',
      date: new Date(),
      type: NotificationType.ReportsSubmitted,
      unread: true,
    };

    // Call backend API to create notification
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error('Failed to create notification');
    }
  }
}
