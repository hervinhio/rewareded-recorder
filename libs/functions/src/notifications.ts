import admin, {firestore} from 'firebase-admin';
import {getPublisherName} from './publishers';
import { Publisher } from './publisher';
import { Change } from './change';

export enum NotificationType {
    ReportCreated,
    ReportUpdated,
    ReportDeleted,
    ReportsSubmitted,
    PublisherCreated,
    PublisherUpdated,
    PublisherDeleted,
    PublisherMoved,
}

interface NotificationPayload {
    id: string;
    publisher: { id: string; name: string };
    author: { id: string; name: string };
    date: Date;
    type: NotificationType;
    unread: boolean;
    meta?: Record<string, unknown>;
}

/**
 * Returns user IDs that should receive a notification for a publisher-related event.
 * Recipients are: all root/admin users + the group overseer of the publisher's group.
 * The author (originator) is excluded.
 * @param {firestore.Firestore} db Firestore instance
 * @param {string} groupId The publisher's group ID
 * @param {string} authorId The ID of the user who originated the action
 * @return {Promise<string[]>} List of recipient user document IDs
 */
async function getPublisherEventRecipientIds(
    db: firestore.Firestore,
    groupId: string,
    authorId: string
): Promise<string[]> {
  const recipientIds = new Set<string>();

  // Collect root and admin users
  const adminSnapshot = await db.collection('Users')
      .where('admin', '==', true)
      .get();
  adminSnapshot.forEach((doc) => recipientIds.add(doc.id));

  const rootSnapshot = await db.collection('Users')
      .where('role', '==', 'root')
      .get();
  rootSnapshot.forEach((doc) => recipientIds.add(doc.id));

  // Collect the group overseer
  if (groupId && groupId !== 'unafiliated') {
    const groupDoc = await db.doc(`Groups/${groupId}`).get();
    const overseerId: string | undefined = groupDoc.data()?.overseerId;
    if (overseerId) {
      recipientIds.add(overseerId);
    }
  }

  // Remove the originator – they must not receive their own notification
  recipientIds.delete(authorId);

  return Array.from(recipientIds);
}

/**
 * Returns user IDs of group overseers for the given group IDs, excluding the author.
 * @param {firestore.Firestore} db Firestore instance
 * @param {string[]} groupIds Group IDs to look up
 * @param {string} authorId The ID of the user who originated the action
 * @return {Promise<string[]>} List of recipient user document IDs
 */
async function getGroupOverseerIds(
    db: firestore.Firestore,
    groupIds: string[],
    authorId: string
): Promise<string[]> {
  const recipientIds = new Set<string>();

  for (const groupId of groupIds) {
    if (!groupId || groupId === 'unafiliated') continue;
    const groupDoc = await db.doc(`Groups/${groupId}`).get();
    const overseerId: string | undefined = groupDoc.data()?.overseerId;
    if (overseerId) {
      recipientIds.add(overseerId);
    }
  }

  recipientIds.delete(authorId);
  return Array.from(recipientIds);
}

/**
 * Saves a notification to the specified user documents.
 * @param {firestore.Firestore} db Firestore instance
 * @param {string[]} recipientIds User document IDs that should receive the notification
 * @param {NotificationPayload} notification The notification object to persist
 * @return {Promise<void>}
 */
async function saveNotificationToUsers(
    db: firestore.Firestore,
    recipientIds: string[],
    notification: NotificationPayload
): Promise<void> {
  if (recipientIds.length === 0) return;

  const batch = db.batch();
  for (const userId of recipientIds) {
    const userRef = db.collection('Users').doc(userId);
    batch.update(userRef, {
      notifications: admin.firestore.FieldValue.arrayUnion(notification),
    });
  }

  await batch.commit();
}

/**
 * Generates a notification from a firestore report change event.
 * Only the group overseer of the publisher's group receives the notification.
 * @param {Change} change The change event
 * @param {NotificationType} notifType The type of notification to create
 * @return {Promise<void>} An instance of Promise<void>
 */
export async function generateNotificationFromChange(
    change: Change,
    notifType: NotificationType
): Promise<void> {
  const db = admin.firestore();
  const reportData = change.data();

  if (!reportData) return;

  const authorId: string = reportData.authorId || '';
  const publisherId: string = reportData.publisherId || '';

  const [authorDoc, publisherDoc] = await Promise.all([
    db.doc(`Users/${authorId}`).get(),
    db.doc(`Publishers/${publisherId}`).get(),
  ]);

  if (!publisherDoc.exists) return;

  const publisherData = publisherDoc.data() as Publisher;
  const groupId: string = publisherData.groupId || 'unafiliated';

  const notification: NotificationPayload = {
    id: Date.now().toString(),
    publisher: {
      id: publisherId,
      name: getPublisherName(publisherData),
    },
    author: {
      id: authorId,
      name: authorDoc.data()?.displayName || '',
    },
    date: new Date(),
    type: notifType,
    unread: true,
  };

  const recipientIds = await getGroupOverseerIds(db, [groupId], authorId);
  await saveNotificationToUsers(db, recipientIds, notification);
}

/**
 * Generates a notification for a publisher CRUD event.
 * Root users, admin users, and the group overseer of the publisher's group receive the notification.
 * @param {string} publisherId Publisher document ID
 * @param {Publisher} publisherData Publisher data
 * @param {string} authorId The ID of the user who triggered the event
 * @param {string} authorName Display name of the author
 * @param {NotificationType} notifType The type of notification
 * @return {Promise<void>}
 */
export async function generatePublisherNotification(
    publisherId: string,
    publisherData: Publisher,
    authorId: string,
    authorName: string,
    notifType: NotificationType
): Promise<void> {
  const db = admin.firestore();
  const groupId: string = publisherData.groupId || 'unafiliated';

  const notification: NotificationPayload = {
    id: Date.now().toString(),
    publisher: {
      id: publisherId,
      name: getPublisherName(publisherData),
    },
    author: {
      id: authorId,
      name: authorName,
    },
    date: new Date(),
    type: notifType,
    unread: true,
  };

  const recipientIds = await getPublisherEventRecipientIds(db, groupId, authorId);
  await saveNotificationToUsers(db, recipientIds, notification);
}

/**
 * Generates a notification when a publisher is moved from one group to another.
 * The source group overseer and destination group overseer receive the notification.
 * @param {string} publisherId Publisher document ID
 * @param {Publisher} publisherData The updated publisher data (with new groupId)
 * @param {string} fromGroupId The previous group ID
 * @param {string} authorId The ID of the user who triggered the event
 * @param {string} authorName Display name of the author
 * @return {Promise<void>}
 */
export async function generatePublisherMovedNotification(
    publisherId: string,
    publisherData: Publisher,
    fromGroupId: string,
    authorId: string,
    authorName: string
): Promise<void> {
  const db = admin.firestore();
  const toGroupId: string = publisherData.groupId || 'unafiliated';

  const notification: NotificationPayload = {
    id: Date.now().toString(),
    publisher: {
      id: publisherId,
      name: getPublisherName(publisherData),
    },
    author: {
      id: authorId,
      name: authorName,
    },
    date: new Date(),
    type: NotificationType.PublisherMoved,
    unread: true,
    meta: { fromGroupId, toGroupId },
  };

  const recipientIds = await getGroupOverseerIds(
      db,
      [fromGroupId, toGroupId],
      authorId
  );
  await saveNotificationToUsers(db, recipientIds, notification);
}

/**
 * Generates a notification when all reports have been submitted.
 * Every user except the author receives the notification.
 * @param {string} authorId The ID of the user who submitted the reports
 * @param {string} authorName Display name of the author
 * @return {Promise<void>}
 */
export async function generateReportsSubmittedNotification(
    authorId: string,
    authorName: string
): Promise<void> {
  const db = admin.firestore();

  const notification: NotificationPayload = {
    id: Date.now().toString(),
    publisher: { id: '', name: '' },
    author: { id: authorId, name: authorName },
    date: new Date(),
    type: NotificationType.ReportsSubmitted,
    unread: true,
  };

  const usersSnapshot = await db.collection('Users').get();
  const recipientIds: string[] = [];
  usersSnapshot.forEach((doc) => {
    if (doc.id !== authorId) {
      recipientIds.push(doc.id);
    }
  });

  await saveNotificationToUsers(db, recipientIds, notification);
}
