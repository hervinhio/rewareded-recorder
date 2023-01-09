import { collection, doc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { auth } from '../auth';
import { db } from './database';

export enum NotificationType {
  ReportCreated,
  ReportUpdated,
  ReportDeleted,
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

export class Notifications {
  static readonly CollectionName = 'Notifications';

  static async get(): Promise<Notification[]> {
    const q = query(
      collection(db, Notifications.CollectionName),
      where('author.id', '!=', auth.currentUser?.uid),
      orderBy('author.id'),
      orderBy('date', 'desc')
    );
    const notifs: Notification[] = [];

    (await getDocs(q)).forEach((notif) => {
      notifs.push({ ...notif.data() as Notification, id: notif.id });
    });

    return notifs;
  }

  static async markAsRead(notif: Notification): Promise<Notification> {
    await updateDoc(doc(db, Notifications.CollectionName, notif.id || ''), {...notif, unread: false});
    return {...notif, unread: false};
  }
}
