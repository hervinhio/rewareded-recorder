import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
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

export const onCreateReport = onDocumentCreated('/Repports/{report}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;
    generateNotificationFromChange(snapshot, NotificationType.ReportCreated);
    updatePublisherActiveState(snapshot.data().publisherId);
    updateAuxilaryPionnerForPublisher(snapshot.data().publisherId, snapshot.data());
  });

export const onDeleteReport = onDocumentDeleted('/Repports/{report}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;
    generateNotificationFromChange(snapshot, NotificationType.ReportDeleted);
    updatePublisherActiveState(snapshot.data().publisherId);
    updateAuxilaryPionnerForPublisher(snapshot.data().publisherId, snapshot.data());
  });

export const onUpdateReport = onDocumentUpdated('/Repports/{report}', async (event) => {
    const change = event.data;
    if (!change) return;
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

export const onCreatePublisher = onDocumentCreated('/Publishers/{publisherId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;
    const publisherData = snapshot.data() as Publisher | undefined;
    if (!publisherData) return;

    const authorId: string = (publisherData as any).authorId || '';
    const authorName = await getAuthorName(authorId);

    await generatePublisherNotification(
        event.params.publisherId,
        publisherData,
        authorId,
        authorName,
        NotificationType.PublisherCreated
    );
  });

export const onDeletePublisher = onDocumentDeleted('/Publishers/{publisherId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;
    const publisherData = snapshot.data() as Publisher | undefined;
    if (!publisherData) return;

    const authorId: string = (publisherData as any).authorId || '';
    const authorName = await getAuthorName(authorId);

    await generatePublisherNotification(
        event.params.publisherId,
        publisherData,
        authorId,
        authorName,
        NotificationType.PublisherDeleted
    );
  });

export const onUpdatePublisher = onDocumentUpdated('/Publishers/{publisherId}', async (event) => {
    const change = event.data;
    if (!change) return;
    const before = change.before.data() as Publisher | undefined;
    const after = change.after.data() as Publisher | undefined;

    if (!after) return;

    const authorId: string = (after as any).authorId || '';
    const authorName = await getAuthorName(authorId);

    const groupChanged = before && before.groupId !== after.groupId;

    if (groupChanged) {
      // Publisher was moved to a different group
      await generatePublisherMovedNotification(
          event.params.publisherId,
          after,
          before.groupId,
          authorId,
          authorName
      );
    } else {
      // Publisher was updated in-place
      await generatePublisherNotification(
          event.params.publisherId,
          after,
          authorId,
          authorName,
          NotificationType.PublisherUpdated
      );
    }
  });
