import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
  Timestamp,
  Transaction,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Repport } from '../types';
import { db } from './database';

export class Repports {
  static CollectionName = 'Repports';

  static async unsubmitted() {
    const repports: Repport[] = [];
    const q = query(
      collection(db, Repports.CollectionName),
      where('submitted', '==', false)
    );

    (await getDocs(q)).forEach((doc) => {
      repports.push({ ...doc.data(), id: doc.id } as Repport);
    });

    return repports;
  }

  static async submitAll() {
    const q = query(
      collection(db, Repports.CollectionName),
      where('submitted', '==', false)
    );

    return await runTransaction(db, async (transaction: Transaction) => {
      const docs = await getDocs(q);
      docs.forEach((doc) => {
        transaction.update(doc.ref, { ...doc.data(), submitted: true });
      });
    });
  }

  static async create(repport: Repport): Promise<Repport> {
    await addDoc(collection(db, Repports.CollectionName), {
      ...repport,
      date: Timestamp.now(),
    });
    return repport;
  }

  static async update(repport: any): Promise<Repport> {
    await updateDoc(doc(db, Repports.CollectionName, repport.id), repport);
    return repport;
  }

  static async byMonthIdAndPublisherId(
    monthId: string | undefined,
    publisherId: string | undefined
  ): Promise<Repport | null> {
    if (!monthId || !publisherId) {
      return null;
    }

    const q = query(
      collection(db, Repports.CollectionName),
      where('publisherId', '==', publisherId),
      where('monthId', '==', monthId)
    );

    const repports: Repport[] = [];
    (await getDocs(q)).forEach((doc) => {
      repports.push({ ...doc.data(), id: doc.id } as Repport);
    });

    return repports.length > 0 ? repports[0] : null;
  }

  static async byPublisherId(
    publisherId: string | undefined
  ): Promise<Repport[]> {
    if (!publisherId) return [];

    const repports: Repport[] = [];
    const q = query(
      collection(db, Repports.CollectionName),
      where('publisherId', '==', publisherId)
    );

    (await getDocs(q)).forEach((doc) => {
      repports.push({ ...doc.data(), id: doc.id } as Repport);
    });

    return repports;
  }

  static async byMonthId(monthId: string | undefined): Promise<Repport[]> {
    if (!monthId) return [];

    const repports: Repport[] = [];
    const q = query(
      collection(db, Repports.CollectionName),
      where('monthId', '==', monthId)
    );

    (await getDocs(q)).forEach((doc) => {
      repports.push({ ...doc.data(), id: doc.id } as Repport);
    });

    return repports;
  }

  static async delete(repportId: string | undefined): Promise<void> {
    if (!repportId) return;

    return await deleteDoc(doc(db, Repports.CollectionName, repportId));
  }

  static async deleteByPublisherId(publisherId: string): Promise<void> {
    const q = query(
      collection(db, Repports.CollectionName),
      where('publisherId', '==', publisherId)
    );

    return await runTransaction(db, async (transaction: Transaction) => {
      (await getDocs(q)).forEach((doc) => {
        transaction.delete(doc.ref);
      });
    });
  }
}
