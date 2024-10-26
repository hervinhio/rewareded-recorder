import * as functions from 'firebase-functions';
import {
  updateAuxilaryPionnerForPublisher,
  updatePublisherActiveState,
} from './publishers';
import {generateNotificationFromChange} from './notifications';
import { Publisher } from './publisher';


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
    .document('/Repports/{report}')
    .onCreate(async (change) => {
      generateNotificationFromChange(change, NotificationType.ReportCreated);
      updatePublisherActiveState(change.data().publisherId);
      updateAuxilaryPionnerForPublisher(change.data().publisherId, change.data());
    });

export const onDeleteReport = functions.firestore
    .document('/Repports/{report}')
    .onDelete(async (change) => {
      generateNotificationFromChange(change, NotificationType.ReportDeleted);
      updatePublisherActiveState(change.data().publisherId);
      updateAuxilaryPionnerForPublisher(change.data().publisherId, change.data());
    });

export const onUpdateReport = functions.firestore
    .document('/Repports/{report}')
    .onUpdate(async (change) => {
      generateNotificationFromChange(
          change.after,
          NotificationType.ReportUpdated
      );
      updatePublisherActiveState(change.after.data().publisherId);
      updateAuxilaryPionnerForPublisher(change.after.data().publisherId, change.after.data());
    });
