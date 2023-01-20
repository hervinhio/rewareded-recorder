import * as functions from 'firebase-functions';
import admin, { firestore } from 'firebase-admin';

export const getPublisherName = (publisher: any) => {
  return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`.trim();
};

enum NotificationType {
  ReportCreated,
  ReportUpdated,
  ReportDeleted,
}

interface UserDocAndPublisherDocResults {
  db: firestore.Firestore;
  userDoc: firestore.DocumentSnapshot<firestore.DocumentData>;
  publisherDoc: firestore.DocumentSnapshot<firestore.DocumentData>;
}

exports.onCreateReport = functions.firestore
  .document('/Repports/{repport}')
  .onCreate(async (change) => {
    generateNotificationFromChange(change, NotificationType.ReportCreated);
  });

/**
 * Generates a notification from a firestore change event.
 * @param {functions.firestore.QueryDocumentSnapshot} change The change event
 * @param {NotificationType} notifType The type of notification to create
 * @return {Promise<void>} An instance of Promise<void>
 */
async function generateNotificationFromChange(
  change: functions.firestore.QueryDocumentSnapshot,
  notifType: NotificationType
): Promise<void> {
  const result = await getUserAndPublisherDocs(change);
  const { userDoc, publisherDoc } = result;

  if (!userDoc.exists || !publisherDoc.exists) {
    return;
  }

  makeAndSaveNotification(change, result, notifType);
}

/**
 * Gets the user who originated with the change.
 * @param {functions.firestore.QueryDocumentSnapshot} change The change event
 * @return {Promise<void>} an instance of Promise<void>
 */
async function getUserAndPublisherDocs(
  change: functions.firestore.QueryDocumentSnapshot
): Promise<UserDocAndPublisherDocResults> {
  const db = admin.firestore();
  const userDoc = await db.doc(`Users/${change.data().authorId}`).get();
  const publisherDoc = await db
    .doc(`Publishers/${change.data().publisherId}`)
    .get();

  return {
    db,
    userDoc,
    publisherDoc,
  };
}

/**
 * Makes a notification and saves it in the database
 * @param {functions.firestore.QueryDocumentSnapshot} change change
 * @param {Promise<DocumentReference<DocumentData>>} results The result
 * @param {NotificationType} type The type of the notification to be created
 */
function makeAndSaveNotification(
  change: functions.firestore.QueryDocumentSnapshot,
  results: UserDocAndPublisherDocResults,
  type: NotificationType
) {
  results.db.collection('Notifications').add({
    publisher: {
      id: change.data().publisherId,
      name: getPublisherName(results.publisherDoc.data()),
    },
    author: {
      id: change.data().authorId,
      name: results.userDoc?.data()?.displayName,
    },
    date: new Date(),
    type,
    unread: true,
  });
}

exports.onDeleteReport = functions.firestore
  .document('/Repports/{repport}')
  .onDelete(async (change) => {
    generateNotificationFromChange(change, NotificationType.ReportDeleted);
  });

exports.onUpdateReport = functions.firestore
  .document('/Repports/{repport}')
  .onUpdate(async (change) => {
    generateNotificationFromChange(
      change.after,
      NotificationType.ReportUpdated
    );
  });
