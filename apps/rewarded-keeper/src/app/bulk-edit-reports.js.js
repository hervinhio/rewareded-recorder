// Bulk Edit Script for Firebase Firestore (Modern Web Application with npm/bundlers)
// Project ID: rewarded-keeper

// 1. **REQUIRED IMPORTS FOR MODULAR SDK:**
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore'; // Note: `doc` might not be explicitly needed for this specific script as we use docSnap.ref

// 2. Your Firebase Project Configuration
//    Replace placeholder values with your actual configuration from Firebase Console -> Project settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "q5Og5fPE0fNCBv6EZAnaLbATltY", // <--- IMPORTANT: Replace with your actual API Key
  authDomain: "rewarded-keeper.firebaseapp.com",
  projectId: "rewarded-keeper",
  storageBucket: "rewarded-keeper.appspot.com",
  messagingSenderId: "697083459993", // <--- IMPORTANT: Replace with your actual Sender ID
  appId: "1:697083459993:web:56070001f3a491ca11fb08" // <--- IMPORTANT: Replace with your actual App ID
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Get a reference to Firestore
const db = getFirestore(app);

/**
 * Performs a bulk update on Firestore documents in a specified collection.
 *
 * @param {string} collectionName The name of the collection to update.
 * @param {string} fieldToQuery The field to use for filtering documents.
 * @param {any} queryValue The value to match for the query field.
 * @param {string} fieldToUpdate The field to update in the matching documents.
 * @param {any} newFieldValue The new value for the field to update.
 */
async function bulkEditRecords(collectionName, fieldToQuery, queryValue, fieldToUpdate, newFieldValue) {
  try {
    console.log(`Starting bulk edit in '${collectionName}': updating '${fieldToUpdate}' to '${newFieldValue}' where '${fieldToQuery}' is '${queryValue}'...`);

    // Create a batch to perform multiple writes atomically
    const batch = writeBatch(db);

    // Get a reference to the collection
    const collectionRef = collection(db, collectionName);

    // Query for the documents you want to update
    const q = query(collectionRef, where(fieldToQuery, '==', queryValue));

    // Execute the query
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`No matching documents found in '${collectionName}' where '${fieldToQuery}' is '${queryValue}'.`);
      return;
    }

    let updatedCount = 0;
    querySnapshot.forEach((docSnap) => {
      // Add each update operation to the batch
      batch.update(docSnap.ref, { [fieldToUpdate]: newFieldValue });
      updatedCount++;
    });

    // Commit the batch to apply all updates
    await batch.commit();
    console.log(`Successfully updated ${updatedCount} document(s) in '${collectionName}'.`);

  } catch (error) {
    console.error("Error during bulk edit:", error);
  }
}

// 5. How to run the bulk edit (for npm/bundlers):
//    You would typically call this function from another part of your application
//    (e.g., a button click, a serverless function, or a one-off script).

//    Example usage:
// bulkEditRecords('Publishers', 'groupId', 'groupA', 'status', 'active');
bulkEditRecords('Repports', 'submitted', false, 'submitted', true).finally(() => {
  console.log("Bulk edit operation completed.");
  process.exit(0); // Exit the script after completion (if running as a standalone script)
});

// Remember to replace 'YOUR_API_KEY', 'YOUR_MESSAGING_SENDER_ID', and 'YOUR_APP_ID'
// in the `firebaseConfig` object before running.
