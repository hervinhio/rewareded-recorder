import { collection, getDocs, query } from 'firebase/firestore';
import { db } from './database';

export enum NotificationType {
  ReportCreated,
  ReportDeleted,
  ReportUpdated,
  UserRegistered,
}

export interface Notification {
  publisher: {
    id: string;
    name: string;
  },
  author: {
      id: string;
      name: string;
  },
  date: Date;
  type: NotificationType;
  unread: boolean;
}

export class Notifications {
  static readonly CollectionName = 'Notifications';

  static async get(): Promise<Notification[]> {
    const q = query(collection(db, Notifications.CollectionName));
    const notifs: Notification[] = [];

    (await getDocs(q)).forEach((notif) => {
      notifs.push(notif.data() as Notification);
    });

    return notifs;
  }
}
