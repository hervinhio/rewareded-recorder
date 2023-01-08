import {
  collection,
  deleteDoc,
  doc,
  endAt,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  startAt,
} from 'firebase/firestore';
import { Group } from '../types';
import { db } from './database';

export class Groups {
  static readonly CollectionName = 'Groups';

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

  static async getOne(groupId: string): Promise<Group> {
    return await getDoc(doc(db, Groups.CollectionName, groupId)).then((doc) => {
      return { ...doc.data(), id: doc.id } as Group;
    });
  }

  static async findByName(namePart: string): Promise<Group[]> {
    const normalizedNamePart = `${namePart
      .charAt(0)
      .toUpperCase()}${namePart.slice(1)}`;

    const q = query(
      collection(db, Groups.CollectionName),
      orderBy('name'),
      startAt(normalizedNamePart),
      endAt(`${normalizedNamePart}\uf8ff`)
    );
    const groups: Group[] = [];

    (await getDocs(q)).forEach((group) => {
      groups.push(group.data() as Group);
    });

    return groups;
  }
}
