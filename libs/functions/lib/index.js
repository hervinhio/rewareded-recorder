"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublisherName = void 0;
const tslib_1 = require("tslib");
const functions = tslib_1.__importStar(require("firebase-functions"));
const firebase_admin_1 = tslib_1.__importDefault(require("firebase-admin"));
// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
firebase_admin_1.default.initializeApp();
const getPublisherName = (publisher) => {
    return `${publisher.name} ${publisher.lastName} ${publisher.firstName}`.trim();
};
exports.getPublisherName = getPublisherName;
var NotificationType;
(function (NotificationType) {
    NotificationType[NotificationType["ReportCreated"] = 0] = "ReportCreated";
})(NotificationType || (NotificationType = {}));
exports.onCreateReport = functions.firestore
    .document('/Repports/{repport}')
    .onCreate(async (change, context) => {
    var _a;
    const db = firebase_admin_1.default.firestore();
    const userDoc = await db.doc(`Users/${change.data().authorId}`).get();
    const publisherDoc = await db.doc(`Publishers/${change.data().publisherId}`).get();
    console.log(change.data());
    console.log(userDoc.data());
    console.log(publisherDoc.data());
    console.log(context);
    if (!userDoc.exists || !publisherDoc.exists) {
        return;
    }
    const notif = {
        publisher: {
            id: change.data().publisherId,
            name: (0, exports.getPublisherName)(publisherDoc.data()),
        },
        author: {
            id: change.data().authorId,
            name: (_a = userDoc === null || userDoc === void 0 ? void 0 : userDoc.data()) === null || _a === void 0 ? void 0 : _a.displayName,
        },
        date: new Date(),
        type: NotificationType.ReportCreated,
    };
    db.collection('Notifications').add(notif);
});
//# sourceMappingURL=index.js.map