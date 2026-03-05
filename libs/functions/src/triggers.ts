import {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
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
    generateNotificationFromChange(event, NotificationType.ReportCreated);
    updatePublisherActiveState(event.data?.data().publisherId);
    updateAuxilaryPionnerForPublisher(event.data?.data().publisherId, event.data?.data());
  });

export const onDeleteReport = onDocumentDeleted('/Repports/{report}', async (event) => {
    generateNotificationFromChange(event, NotificationType.ReportDeleted);
    updatePublisherActiveState(event.data?.data().publisherId);
    updateAuxilaryPionnerForPublisher(event.data?.data().publisherId, event.data?.data());
  });

export const onUpdateReport = onDocumentUpdated('/Repports/{report}', async (event) => {
    generateNotificationFromChange(
        event.data?.after as any,
        NotificationType.ReportUpdated
    );
    updatePublisherActiveState(event.data?.after.data().publisherId);
    updateAuxilaryPionnerForPublisher(event.data?.after.data().publisherId, event.data?.after.data());
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
    const publisherData = event.data?.data() as Publisher | undefined;
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
    const publisherData = event.data?.data() as Publisher | undefined;
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
    const before = event.data?.before.data() as Publisher | undefined;
    const after = event.data?.after.data() as Publisher | undefined;

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
