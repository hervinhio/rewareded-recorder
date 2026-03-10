#!/usr/bin/env node
/**
 * Migration script: Add congregationId to all existing Firestore documents.
 *
 * - Iterates through all collections that require a congregationId field.
 * - Adds congregationId: 41929 to every document that does not already have it.
 * - Uses WriteBatch (chunks of 500) for performance.
 * - Idempotent: skips documents that already have the congregationId field.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json node migrate-congregation-id.js
 *
 * Or with explicit project ID:
 *   node migrate-congregation-id.js --project=your-project-id
 */

const admin = require('firebase-admin');

const DEFAULT_CONGREGATION_ID = 41929;
const BATCH_SIZE = 500;

// Collections to migrate
const COLLECTIONS_TO_MIGRATE = [
  'Publishers',
  'Groups',
  'Users',
  'Repports',
  'Submissions',
  'AttendanceRecords',
  'SpecialMonths',
  'Stats',
  'Cases',
  'Notifications',
];

async function initializeApp() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.firestore();
}

/**
 * Migrates a single collection, adding congregationId to documents that lack it.
 * @param {FirebaseFirestore.Firestore} db
 * @param {string} collectionName
 * @returns {Promise<{skipped: number, updated: number}>}
 */
async function migrateCollection(db, collectionName) {
  console.log(`\nMigrating collection: ${collectionName}`);

  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();

  if (snapshot.empty) {
    console.log(`  Collection ${collectionName} is empty, skipping.`);
    return { skipped: 0, updated: 0 };
  }

  let skipped = 0;
  let updated = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    // Idempotent: skip documents that already have the congregationId field
    if (data.hasOwnProperty('congregationId')) {
      skipped++;
      continue;
    }

    batch.update(docSnap.ref, { congregationId: DEFAULT_CONGREGATION_ID });
    batchCount++;
    updated++;

    // Commit batch every BATCH_SIZE operations
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      console.log(`  Committed batch of ${batchCount} documents.`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit any remaining documents in the last batch
  if (batchCount > 0) {
    await batch.commit();
    console.log(`  Committed final batch of ${batchCount} documents.`);
  }

  console.log(`  ${collectionName}: updated=${updated}, skipped=${skipped}`);
  return { skipped, updated };
}

async function main() {
  console.log('Starting congregation ID migration...');
  console.log(`Default congregationId: ${DEFAULT_CONGREGATION_ID}`);
  console.log(`Collections to migrate: ${COLLECTIONS_TO_MIGRATE.join(', ')}`);

  const db = await initializeApp();

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    try {
      const { updated, skipped } = await migrateCollection(db, collectionName);
      totalUpdated += updated;
      totalSkipped += skipped;
    } catch (error) {
      console.error(`Error migrating collection ${collectionName}:`, error.message);
    }
  }

  console.log('\n=== Migration Summary ===');
  console.log(`Total documents updated: ${totalUpdated}`);
  console.log(`Total documents skipped (already had congregationId): ${totalSkipped}`);
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
