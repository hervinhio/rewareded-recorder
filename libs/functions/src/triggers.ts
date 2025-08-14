import * as functions from 'firebase-functions';
import {
  updateAuxilaryPionnerForPublisher,
  updatePublisherActiveState,
} from './publishers';
import {generateNotificationFromChange} from './notifications';
import { Publisher } from './publisher';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';


export const getPublisherName = (publisher: Publisher) => {
  return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`
      .trim();
};

enum NotificationType {
  ReportCreated,
  ReportUpdated,
  ReportDeleted,
}

export const onCreateReport = functions.firestore
    .document('/Repports/{report}').onCreate(async (change: QueryDocumentSnapshot) => {
      generateNotificationFromChange(change, NotificationType.ReportCreated);
      updatePublisherActiveState(change.data().publisherId);
      updateAuxilaryPionnerForPublisher(change.data().publisherId, change.data());
    });

export const onDeleteReport = functions.firestore
    .document('/Repports/{report}').onDelete(async (snapshot: QueryDocumentSnapshot) => {
      generateNotificationFromChange(snapshot, NotificationType.ReportDeleted);
      updatePublisherActiveState(snapshot.data()?.publisherId);
      updateAuxilaryPionnerForPublisher(snapshot.data()?.publisherId, snapshot.data());
    });

export const onUpdateReport = functions.firestore
    .document('/Repports/{report}').onUpdate(async (snapshot: functions.Change<QueryDocumentSnapshot>) => {
      generateNotificationFromChange(
          snapshot.after,
          NotificationType.ReportUpdated
      );
      updatePublisherActiveState(snapshot.after.data().publisherId);
      updateAuxilaryPionnerForPublisher(snapshot.after.data().publisherId, snapshot.after.data());
    });
