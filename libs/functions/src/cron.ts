import admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';

export const deleteNotificationsCron = onSchedule('every day 23:00', () => {
      const db = admin.firestore();
      db.collection('Users')
          .where('unread', '==', false)
          .get()
          .then((docs) => {
            docs.docs.forEach((doc) => {
               // Delete all notifications for the user, that are older that are not 'unread' and are older than 30 days
              const userRef = db.collection('Users').doc(doc.id);
              userRef.update({
                notifications: admin.firestore.FieldValue.arrayRemove(
                    ...doc.data().notifications.filter((notification: any) => {
                      return !notification.unread &&
                          notification.date.toDate().getTime() < Date.now() - 30 * 24 * 60 * 60 * 1000;
                    }
                )),
              });
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
