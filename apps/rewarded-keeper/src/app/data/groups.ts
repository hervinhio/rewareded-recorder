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
import { Events, Group } from '../types';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';

export interface GroupsState {
  groups: Group[];
  loading: boolean;
  active?: Group;
}

const InitialState: GroupsState = {
  groups: [],
  loading: false,
};

export class Groups {
  static readonly CollectionName = 'Groups';
  static readonly slice = createSlice({
    name: 'Groups',
    initialState: InitialState,
    reducers: {
      added: (state, { payload }) => {
        state.groups = [...state.groups, payload]
      },
      deleted: (state, { payload }) => {
        if (state.active?.id === payload) {
          state.active = undefined;
        }

        state.groups = state.groups.filter(group => group.id !== payload);
      },
      selected: (state, { payload }) => {
        if (payload === 'unafiliated') {
          state.active = undefined;
        }

        state.active = payload;
      },
      loaded: (state, { payload }) => {
        state.groups = payload;
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      }
    }
  });

  static async create(group: Group): Promise<Group> {
    await setDoc(doc(db, Groups.CollectionName, group.id), group);
    store.dispatch(Groups.slice.actions.added(group));
    Events.emit('group_updated', { id: group.id });
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
