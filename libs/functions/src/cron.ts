import admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const deleteNotificationsCron = functions.pubsub.schedule('every day 23:00').onRun(async () => {
      const db = admin.firestore();
      const usersSnapshot = await db.collection('Users').get();

      for (const userDoc of usersSnapshot.docs) {
        const notifications: any[] = userDoc.data().notifications || [];
        const toRemove = notifications.filter((notification: any) => {
          if (notification.unread) return false;
          const notifDate = notification.date?.toDate
              ? notification.date.toDate()
              : new Date(notification.date);
          return Date.now() - notifDate.getTime() > ONE_YEAR_MS;
        });

        if (toRemove.length === 0) continue;

        await db.collection('Users').doc(userDoc.id).update({
          notifications: admin.firestore.FieldValue.arrayRemove(...toRemove),
        });
      }
    });

export const deleteOldReportsCron = functions.pubsub.schedule('every day 23:00').onRun(async () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 2);

      const db = admin.firestore();
      const snapshot = await db.collection('Repports')
          .where('date', '<=', date)
          .get();

      await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
    });
