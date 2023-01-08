import * as functions from "firebase-functions";
import admin from 'firebase-admin';

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

export const getPublisherName = (publisher: any) => {
    return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`.trim();
};  

enum NotificationType {
    ReportCreated,
}

exports.onCreateReport = functions.firestore
    .document('/Repports/{repport}')
    .onCreate(async (change, context) => {
        const db = admin.firestore();
        const userDoc = await  db.doc(`Users/${change.data().authorId}`).get();
        const publisherDoc = await db.doc(`Publishers/${change.data().publisherId}`).get();
        
        if (!userDoc.exists || !publisherDoc.exists) {
            return;
        }
        
        const notif = {
            publisher: {
                id: change.data().publisherId,
                name: getPublisherName(publisherDoc.data()),
            },
            author: {
                id: change.data().authorId,
                name: userDoc?.data()?.displayName,
            },
            date: new Date(),
            type: NotificationType.ReportCreated,
        };

        db.collection('Notifications').add(notif);
    });
