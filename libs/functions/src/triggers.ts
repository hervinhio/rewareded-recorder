import * as functions from 'firebase-functions';
import {
  NotificationType,
  generateNotificationFromChange,
} from './notifications';

exports.onCreateReport = functions.firestore
    .document('/Repports/{repport}')
    .onCreate(async (change) => {
      generateNotificationFromChange(change, NotificationType.ReportCreated);
    });

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
