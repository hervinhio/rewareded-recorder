import admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const deleteNotificationsCron = onSchedule('every day 23:00', () => {
      const db = admin.firestore();
      db.collection('Notifications')
          .where('unread', '==', false)
          .get()
          .then((docs) => {
            docs.docs.forEach((doc) => {
              doc.ref.delete();
            });
          });

      return;
    });

export const deleteOldReportsCron = onSchedule('every day 23:00', () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 2);

      const db = admin.firestore();
      db.collection('Repports')
          .where('date', '>=', date)
          .get()
          .then((docs) => {
            docs.forEach((doc) => doc.ref.delete());
          });
    });
