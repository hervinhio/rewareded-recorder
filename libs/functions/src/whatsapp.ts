import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import {getLastSixMonths} from './utils';

const timezone = 'Africa/Kinshasa';

interface WhatsappMessage {
    messaging_product: 'whatsapp',
    to: string;
    type: string;
    template: {
        name: string;
        language: {
            code: string;
        }
    }
}

exports.notifyOfMissingReports = functions.pubsub
    .schedule('0 0 1,5,10,15,19,20 * *')
    .timeZone(timezone)
    .onRun(async () => {
      const month = getLastSixMonths()[0];


      const db = admin.firestore();
      const reports = (await db.collection('Repports')
          .where('monthId', '==', month.getKey())
          .get()).docs.map((ref) => ({
        id: ref.id,
        ...ref.data(),
      }));
      const groups = (await db.collection('Groups').get())
          .docs.map((ref) => ({
            id: ref.id,
            ...ref.data(),
          }));
      const publishers = (await db.collection('Publishers').get())
          .docs.map((ref) => ({
            id: ref.id,
            ...ref.data(),
          }));

      groups.forEach((group) => {
        const pubs = publishers.filter((p: any) => p.groupId === group.id);
        const pubsWithNoReports = pubs.filter((p: any) => {
            return !reports.some((r: any) => r.publisherId === p.id);
        });
      });
    });
