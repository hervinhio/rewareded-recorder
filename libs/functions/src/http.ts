import * as functions from 'firebase-functions/v1';
import {Publisher} from './publisher';
import admin from 'firebase-admin';
import {updatePublisherActiveState} from './publishers';

/**
 *
 * @returns
 */
export const recalculatePublishersActiveStatus = functions.https
    .onCall(async () => {
      const publishers = await getPublishers();
      publishers.forEach((publisher: Publisher) => {
        if (publisher.id) {
          updatePublisherActiveState(publisher.id);
        }
      });
    });


async function getPublishers() {
  const db = admin.firestore();
  const publishersDocs = await db.collection('Publishers').get();
  const publishers: Publisher[] = [];

  publishersDocs.forEach((doc) => {
    publishers.push({
      ...doc.data() as Publisher,
      id: doc.id,
    });
  });

  return publishers;
}
