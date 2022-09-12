import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  runTransaction,
  Transaction,
  documentId,
  startAt,
  endAt,
  getDoc,
} from 'firebase/firestore';
import { Repports } from '.';
import { Publisher } from '../types';
import { db } from './database';

export class Publishers {
  static CollectionName = 'Publishers';

  static async create(publisher: Publisher): Promise<Publisher> {
    await addDoc(collection(db, Publishers.CollectionName), publisher);
    return publisher;
  }

  static async all(): Promise<Publisher[]> {
    const publishers: Publisher[] = [];
    const q = query(collection(db, Publishers.CollectionName), orderBy('name'));

    (await getDocs(q)).forEach((doc) => {
      publishers.push({ ...doc.data(), id: doc.id } as Publisher);
    });

    return publishers;
  }

  static async elders(): Promise<Publisher[]> {
    const elders: Publisher[] = [];
    const q = query(
      collection(db, Publishers.CollectionName),
      where('isElder', '==', true)
    );

    (await getDocs(q)).forEach((doc) => {
      elders.push({ ...doc.data(), id: doc.id } as Publisher);
    });

    return elders;
  }

  static async byGroupId(groupId: string): Promise<Publisher[]> {
    const publishers: Publisher[] = [];
    const q = query(
      collection(db, Publishers.CollectionName),
      where('groupId', '==', groupId),
      orderBy('name')
    );

    (await getDocs(q)).forEach((doc) => {
      publishers.push({ ...doc.data(), id: doc.id } as Publisher);
    });

    return publishers;
  }

  static async unafiliated(): Promise<Publisher[]> {
    return Publishers.byGroupId('unafiliated');
  }

  static async save(publisher: Publisher): Promise<Publisher> {
    await setDoc(
      doc(db, Publishers.CollectionName, publisher.id || ''),
      publisher
    );
    return publisher;
  }

  static async delete(publisherId: string | undefined): Promise<void> {
    if (!publisherId) return;
    await Repports.deleteByPublisherId(publisherId);
    return await deleteDoc(doc(db, Publishers.CollectionName, publisherId));
  }

  static async getOne(publisherId: string): Promise<Publisher> {
    return await getDoc(doc(db, Publishers.CollectionName, publisherId)).then(
      (doc) => {
        return { ...doc.data(), id: doc.id } as Publisher;
      }
    );
  }

  static async transferToGroup(publishers: Publisher[], groupId: string) {
    const q = query(
      collection(db, Publishers.CollectionName),
      where(
        documentId(),
        'in',
        publishers.map((p) => p.id || '')
      )
    );

    return await runTransaction(db, async (transaction: Transaction) => {
      const docs = await getDocs(q);
      docs.forEach((doc) => {
        transaction.update(doc.ref, { ...doc.data(), groupId });
      });
    });
  }

  static async findByName(namePart: string): Promise<Publisher[]> {
    const normalizedNamePart = `${namePart
      .charAt(0)
      .toUpperCase()}${namePart.slice(1)}`;
    const publishers: Publisher[] = [];
    const q = query(
      collection(db, Publishers.CollectionName),
      orderBy('name'),
      orderBy('lastName'),
      orderBy('firstName'),
      startAt(normalizedNamePart),
      startAt(normalizedNamePart),
      startAt(normalizedNamePart),
      endAt(`${normalizedNamePart}\uf8ff`),
      endAt(`${normalizedNamePart}\uf8ff`),
      endAt(`${normalizedNamePart}\uf8ff`)
    );

    (await getDocs(q)).forEach((doc) => {
      publishers.push({ ...doc.data(), id: doc.id } as Publisher);
    });

    return publishers;
  }
}
