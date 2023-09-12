import admin from 'firebase-admin';
import {getLastSixMonths} from './utils';
import {Month} from './utils/month';

enum PublisherActivityStatus {
    Active,
    Irregular,
    Inactive,
}

/**
 * Updtates the active status of a publisher.
 * @param {string} publisherId The id of te publisher.
 * @return {Promise<void>} a void promise.
 */
export async function updatePublisherActiveState(publisherId: string) {
  const db = admin.firestore();
  const months = getLastSixMonths();
  const result = await db.collection('Repports')
      .where('publisherId', '==', publisherId)
      .where('monthId', 'in', months.map((m: Month) => m.getKey()))
      .where('hours', '>=', 1)
      .get();

  if (result.size === 0) {
    db.doc(`Publishers/${publisherId}`).update({
      activityStatus: PublisherActivityStatus.Inactive,
    });
  } else if (
    result.size < 6 &&
    !result.docs.some((r) => r.data().isFirstReport)
  ) {
    db.doc(`Publishers/${publisherId}`).update({
      activityStatus: PublisherActivityStatus.Irregular,
    });
  } else {
    db.doc(`Publishers/${publisherId}`).update({
      activityStatus: PublisherActivityStatus.Active,
    });
  }

  return;
}

export const getPublisherName = (publisher: any) => {
  return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`
      .trim();
};

export const updateAuxilaryPionnerForPublisher = async (
    publisherId: string
) => {
  const db = admin.firestore();
  const month = getLastSixMonths()[0];
  const publisher = await db.doc(`Publishers/${publisherId}`).get();

  if (!publisher.data()?.isPermanentAuxilaryPioneer) {
    db.doc(`Publishers/${publisherId}`).update({
      auxilaryPionierFor: admin.firestore
          .FieldValue
          .arrayRemove(month.getKey()),
    });
  } else if (publisher.data()?.isPermanentAuxilaryPioneer) {
    db.doc(`Publishers/${publisherId}`).update({
      auxilaryPionierFor: admin.firestore
          .FieldValue
          .arrayUnion(month.getKey()),
    });
  }
};
