import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

const timezone = 'Africa/Kinshasa';

export const deleteNotificationsCron = functions.pubsub
    .schedule('0 23 * * *')
    .timeZone(timezone)
    .onRun(() => {
      const db = admin.firestore();
      db.collection('Notifications')
          .where('unread', '==', false)
          .get()
          .then((docs) => {
            docs.docs.forEach((doc) => {
              doc.ref.delete();
            });
          });

      return null;
    });

export const deleteOldReportsCron = functions.pubsub
    .schedule('0 23 25 * *')
    .timeZone(timezone)
    .onRun(() => {
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
