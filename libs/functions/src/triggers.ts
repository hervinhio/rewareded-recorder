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
    .onDocumentCreated('/Repports/{report}', async (event) => {
      generateNotificationFromChange(event, NotificationType.ReportCreated);
      updatePublisherActiveState(event.data?.data().publisherId);
      updateAuxilaryPionnerForPublisher(event.data?.data().publisherId, event.data?.data());
    });

export const onDeleteReport = functions.firestore
    .onDocumentDeleted('/Repports/{report}', async (event) => {
      generateNotificationFromChange(event, NotificationType.ReportDeleted);
      updatePublisherActiveState(event.data?.data().publisherId);
      updateAuxilaryPionnerForPublisher(event.data?.data().publisherId, event.data?.data());
    });

export const onUpdateReport = functions.firestore
    .onDocumentUpdated('/Repports/{report}', async (event) => {
      generateNotificationFromChange(
          event.data?.after as any,
          NotificationType.ReportUpdated
      );
      updatePublisherActiveState(event.data?.after.data().publisherId);
      updateAuxilaryPionnerForPublisher(event.data?.after.data().publisherId, event.data?.after.data());
    });
