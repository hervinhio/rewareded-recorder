import admin from 'firebase-admin';
import {getLastSixMonths} from './utils';
import {Month} from './utils/month';
import {Report} from './report';
import {Publisher} from './publisher';


enum PublisherActivityStatus {
    Active,
    Irregular,
    Inactive,
}

/**
 * Updtates the active status of a publisher.
 * @param {string} publisherId The id of te publisher.
 * @return {Promise<void>} a void promise.
 */
export async function updatePublisherActiveState(publisherId: string) {
  const db = admin.firestore();
  const months = getLastSixMonths();
  const monthKeys = months.map((m: Month) => m.getKey());

  // Fetch reports from the legacy Repports collection (intentional spelling: collection name in db)
  const legacyResult = await db.collection('Repports')
      .where('publisherId', '==', publisherId)
      .where('monthId', 'in', monthKeys)
      .get();

  const legacyReports: Report[] = legacyResult.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Report));

  // Fetch reports from the new storage (publisher's reports field)
  const publisherDoc = await db.doc(`Publishers/${publisherId}`).get();
  const publisherData = publisherDoc.data() as Publisher | undefined;
  const embeddedReports: Report[] = (publisherData?.reports ?? [])
      .filter((r: Report) => monthKeys.includes(r.monthId));

  // Combine both sets of reports, deduplicating by id.
  // When the same report id exists in both storages, the embedded (new) version
  // takes precedence as it is the authoritative source after migration.
  const reportsById = new Map<string, Report>();
  for (const report of legacyReports) {
    reportsById.set(report.id, report);
  }
  for (const report of embeddedReports) {
    reportsById.set(report.id, report);
  }
  const allReports = Array.from(reportsById.values());

  const activeReports = allReports.filter((report) => {
    return report.active || report.hours >= 1;
  });

  const hasFirstReport = allReports.some((r) => r.isFirstReport);

  if (activeReports.length === 0) {
    db.doc(`Publishers/${publisherId}`).update({
      activityStatus: PublisherActivityStatus.Inactive,
    });
  } else if (
    activeReports.length < 6 &&
    !hasFirstReport
  ) {
    db.doc(`Publishers/${publisherId}`).update({
      activityStatus: PublisherActivityStatus.Irregular,
    });
  } else {
    db.doc(`Publishers/${publisherId}`).update({
      activityStatus: PublisherActivityStatus.Active,
    });
  }

  return;
}

export const getPublisherName = (publisher?: Publisher) => {
  if (!publisher) return '';

  return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`
      .trim();
};

export const updateAuxilaryPionnerForPublisher = async (
    publisherId: string, report: any
) => {
  const db = admin.firestore();
  const month = getLastSixMonths()[0];
  const publisher = await db.doc(`Publishers/${publisherId}`).get();

  if (report.isAPReport || publisher.data()?.isPermanentAuxilaryPioneer) {
    addMonthToAuxiliaryMonthsArray(month.getKey(), publisherId);
  }
};


const addMonthToAuxiliaryMonthsArray = (monthId: string, publisherId: string) => {
  const db = admin.firestore();
  db.doc(`Publishers/${publisherId}`).update({
    auxilaryPionierFor: admin.firestore
        .FieldValue
        .arrayUnion(monthId),
  });
}
