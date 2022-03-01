import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
} from 'firebase/firestore';
import { Group } from '../types';
import { db } from './database';

export class Groups {
  static CollectionName = 'Groups';

  static async create(group: Group): Promise<Group> {
    await setDoc(doc(db, Groups.CollectionName, group.id), group);
    return group;
  }

  static async get(): Promise<Group[]> {
    const q = query(collection(db, Groups.CollectionName));
    const groups: Group[] = [];

    (await getDocs(q)).forEach((group) => {
      groups.push(group.data() as Group);
    });

    return groups;
  }

  static async delete(group: Group): Promise<void> {
    return await deleteDoc(doc(db, Groups.CollectionName, group.id));
  }
}
