import * as functions from 'firebase-functions';
import {Publisher} from './publisher';
import admin from 'firebase-admin';
import {updatePublisherActiveState} from './publishers';

/**
 *
 * @returns
 */
exports.recalculatePublishersActiveStatus = functions.https
    .onCall(async (data: any, context: functions.https.CallableContext) => {
      const publishers = await getPublishers();
      publishers.forEach((publisher: Publisher) => {
        if (publisher.id) {
          updatePublisherActiveState(publisher.id);
        }
      });
    });

/**
   *
   */
async function getPublishers() {
  const db = admin.firestore();
  const publishersDocs = await db.collection('Publishers').get();
  const publishers: any[] = [];

  publishersDocs.forEach((doc) => {
    publishers.push({
      ...doc.data(),
      id: doc.id,
    });
  });

  return publishers;
}
