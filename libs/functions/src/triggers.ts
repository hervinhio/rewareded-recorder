import * as functions from 'firebase-functions';
import {
  updateAuxilaryPionnerForPublisher,
  updatePublisherActiveState,
} from './publishers';
import {generateNotificationFromChange} from './notifications';


export const getPublisherName = (publisher: any) => {
  return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`
      .trim();
};

enum NotificationType {
  ReportCreated,
  ReportUpdated,
  ReportDeleted,
}

exports.onCreateReport = functions.firestore
    .document('/Repports/{repport}')
    .onCreate(async (change) => {
      generateNotificationFromChange(change, NotificationType.ReportCreated);
      updatePublisherActiveState(change.data().publisherId);
      updateAuxilaryPionnerForPublisher(change.data().publisherId);
    });

exports.onDeleteReport = functions.firestore
    .document('/Repports/{repport}')
    .onDelete(async (change) => {
      generateNotificationFromChange(change, NotificationType.ReportDeleted);
      updatePublisherActiveState(change.data().publisherId);
      updateAuxilaryPionnerForPublisher(change.data().publisherId);
    });

exports.onUpdateReport = functions.firestore
    .document('/Repports/{repport}')
    .onUpdate(async (change) => {
      generateNotificationFromChange(
          change.after,
          NotificationType.ReportUpdated
      );
      updatePublisherActiveState(change.after.data().publisherId);
      updateAuxilaryPionnerForPublisher(change.after.data().publisherId);
    });
