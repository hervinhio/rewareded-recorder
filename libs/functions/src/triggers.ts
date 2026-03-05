import * as functions from 'firebase-functions/v1';
import admin from 'firebase-admin';
import {
  updateAuxilaryPionnerForPublisher,
  updatePublisherActiveState,
} from './publishers';
import {
  generateNotificationFromChange,
  generatePublisherNotification,
  generatePublisherMovedNotification,
  NotificationType,
} from './notifications';
import { Publisher } from './publisher';

// ─── Report triggers ────────────────────────────────────────────────────────

export const onCreateReport = functions.firestore.document('/Repports/{report}').onCreate(async (snapshot) => {
    generateNotificationFromChange(snapshot, NotificationType.ReportCreated);
    updatePublisherActiveState(snapshot.data().publisherId);
    updateAuxilaryPionnerForPublisher(snapshot.data().publisherId, snapshot.data());
  });

export const onDeleteReport = functions.firestore.document('/Repports/{report}').onDelete(async (snapshot) => {
    generateNotificationFromChange(snapshot, NotificationType.ReportDeleted);
    updatePublisherActiveState(snapshot.data().publisherId);
    updateAuxilaryPionnerForPublisher(snapshot.data().publisherId, snapshot.data());
  });

export const onUpdateReport = functions.firestore.document('/Repports/{report}').onUpdate(async (change) => {
    generateNotificationFromChange(
        change.after,
        NotificationType.ReportUpdated
    );
    updatePublisherActiveState(change.after.data().publisherId);
    updateAuxilaryPionnerForPublisher(change.after.data().publisherId, change.after.data());
  });

// ─── Publisher triggers ──────────────────────────────────────────────────────

/**
 * Resolves the display name of the user who made the change.
 * Falls back to an empty string when the user document doesn't exist.
 */
async function getAuthorName(authorId: string): Promise<string> {
  if (!authorId) return '';
  const db = admin.firestore();
  const userDoc = await db.doc(`Users/${authorId}`).get();
  return userDoc.data()?.displayName || '';
}

export const onCreatePublisher = functions.firestore.document('/Publishers/{publisherId}').onCreate(async (snapshot, context) => {
    const publisherData = snapshot.data() as Publisher | undefined;
    if (!publisherData) return;

    const authorId: string = (publisherData as any).authorId || '';
    const authorName = await getAuthorName(authorId);

    await generatePublisherNotification(
        context.params.publisherId,
        publisherData,
        authorId,
        authorName,
        NotificationType.PublisherCreated
    );
  });

export const onDeletePublisher = functions.firestore.document('/Publishers/{publisherId}').onDelete(async (snapshot, context) => {
    const publisherData = snapshot.data() as Publisher | undefined;
    if (!publisherData) return;

    const authorId: string = (publisherData as any).authorId || '';
    const authorName = await getAuthorName(authorId);

    await generatePublisherNotification(
        context.params.publisherId,
        publisherData,
        authorId,
        authorName,
        NotificationType.PublisherDeleted
    );
  });

export const onUpdatePublisher = functions.firestore.document('/Publishers/{publisherId}').onUpdate(async (change, context) => {
    const before = change.before.data() as Publisher | undefined;
    const after = change.after.data() as Publisher | undefined;

    if (!after) return;

    const authorId: string = (after as any).authorId || '';
    const authorName = await getAuthorName(authorId);

    const groupChanged = before && before.groupId !== after.groupId;

    if (groupChanged) {
      // Publisher was moved to a different group
      await generatePublisherMovedNotification(
          context.params.publisherId,
          after,
          before.groupId,
          authorId,
          authorName
      );
    } else {
      // Publisher was updated in-place
      await generatePublisherNotification(
          context.params.publisherId,
          after,
          authorId,
          authorName,
          NotificationType.PublisherUpdated
      );
    }
  });
