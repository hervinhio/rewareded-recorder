import admin, {firestore} from 'firebase-admin';
import {getPublisherName} from './publishers';
import { Publisher } from './publisher';
import { Change } from './change';

export enum NotificationType {
    ReportCreated,
    ReportUpdated,
    ReportDeleted,
    ReportsSubmitted,
}

interface UserDocAndPublisherDocResults {
    db: firestore.Firestore;
    userDoc: firestore.DocumentSnapshot<firestore.DocumentData>;
    publisherDoc: firestore.DocumentSnapshot<firestore.DocumentData>;
}

/**
 * Generates a notification from a firestore change event.
 * @param {Change} change The change event
 * @param {NotificationType} notifType The type of notification to create
 * @return {Promise<void>} An instance of Promise<void>
 */
export async function generateNotificationFromChange(
    change: Change,
    notifType: NotificationType
): Promise<void> {
  const result = await getUserAndPublisherDocs(change);
  const {userDoc, publisherDoc} = result;

  if (!userDoc.exists || !publisherDoc.exists) {
    return;
  }

  makeAndSaveNotification(change, result, notifType);
}

/**
   * Gets the user who originated with the change.
   * @param {Change} change The change event
   * @return {Promise<void>} an instance of Promise<void>
   */
async function getUserAndPublisherDocs(
    change: Change
): Promise<UserDocAndPublisherDocResults> {
  const db = admin.firestore();
  const userDoc = await db.doc(`Users/${change.data?.data().authorId}`).get();
  const publisherDoc = await db
      .doc(`Publishers/${change.data?.data().publisherId}`)
      .get();

  return {
    db,
    userDoc,
    publisherDoc,
  };
}

/**
   * Makes a notification and saves it in the user documents
   * @param {Change} change change
   * @param {Promise<DocumentReference<DocumentData>>} results The result
   * @param {NotificationType} type The type of the notification to be created
   */
function makeAndSaveNotification(
    change: Change,
    results: UserDocAndPublisherDocResults,
    type: NotificationType
) {
  const notification = {
    id: Date.now().toString(), // Generate a simple ID
    publisher: {
      id: change.data?.data().publisherId,
      name: getPublisherName(results.publisherDoc.data() as Publisher),
    },
    author: {
      id: change.data?.data().authorId,
      name: results.userDoc?.data()?.displayName,
    },
    date: new Date(),
    type,
    unread: true,
  };

  // Add notification to all users in the same realm, except the author
  results.db.collection('Users')
    .where('id', '!=', change.data?.data().authorId)
    .get()
    .then((querySnapshot) => {
      const batch = results.db.batch();
      
      querySnapshot.forEach((userDoc) => {
        const userRef = results.db.collection('Users').doc(userDoc.id);
        batch.update(userRef, {
          notifications: admin.firestore.FieldValue.arrayUnion(notification)
        });
      });
      
      return batch.commit();
    })
    .catch((error) => {
      console.error('Error adding notification to users:', error);
    });
}
