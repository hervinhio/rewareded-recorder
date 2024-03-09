import * as functions from 'firebase-functions';
import {
  updateAuxilaryPionnerForPublisher,
  updatePublisherActiveState,
} from './publishers';
import {generateNotificationFromChange} from './notifications';
import { Publisher } from './publisher';


module.exports.getPublisherName = (publisher: Publisher) => {
  return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`
      .trim();
};

enum NotificationType {
  ReportCreated,
  ReportUpdated,
  ReportDeleted,
}

module.exports.onCreateReport = functions.firestore
    .document('/Repports/{report}')
    .onCreate(async (change) => {
      generateNotificationFromChange(change, NotificationType.ReportCreated);
      updatePublisherActiveState(change.data().publisherId);
      updateAuxilaryPionnerForPublisher(change.data().publisherId, change.data());
    });

module.exports.onDeleteReport = functions.firestore
    .document('/Repports/{report}')
    .onDelete(async (change) => {
      generateNotificationFromChange(change, NotificationType.ReportDeleted);
      updatePublisherActiveState(change.data().publisherId);
      updateAuxilaryPionnerForPublisher(change.data().publisherId, change.data());
    });

module.exports.onUpdateReport = functions.firestore
    .document('/Repports/{report}')
    .onUpdate(async (change) => {
      generateNotificationFromChange(
          change.after,
          NotificationType.ReportUpdated
      );
      updatePublisherActiveState(change.after.data().publisherId);
      updateAuxilaryPionnerForPublisher(change.after.data().publisherId, change.after.data());
    });
