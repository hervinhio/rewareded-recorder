import {
  collection,
  deleteDoc,
  doc,
  endAt,
  getDocs,
  orderBy,
  query,
  setDoc,
  startAt,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Events, Group, Role } from '../types';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';
import { Publishers } from './publishers';
import { User } from '@sentry/react';
import { Congregations } from './congregations';

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
        if (state.active?.id === payload.id) {
          state.active = undefined;
        }

        state.groups = state.groups.filter(group => group.id !== payload.id);
      },
      selected: (state, { payload }) => {
        if (payload === 'unafiliated') {
          state.active = undefined;
          return;
        } else if (payload === 'pioneers') {
          state.active = {
            id: 'pioneers',
            name: 'Pionniers',
            overseerId: '',
          };
          return;
        } else if (payload === 'inactives') {
          state.active = {
            id: 'inactives',
            name: 'Inactifs',
            overseerId: '',
          };
          return;
        } else if (payload === 'elders') {
          state.active = {
            id: 'elders',
            name: 'Anciens',
            overseerId: '',
          };
          return;
        } else if (payload === 'ministerial-servants') {
          state.active = {
            id: 'ministerial-servants',
            name: 'Assistants ministériels',
            overseerId: '',
          };
          return;
        } else {
          state.active = payload;
        }
      },
      loaded: (state, { payload }) => {
        state.groups = payload;
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      },
      updated: (state, { payload }) => {
        state.groups = [ ...state.groups.filter(g => g.id !== payload.id), payload];
        if (state.active && state.active.id === payload.id) {
          state.active = payload;
        }
      }
    }
  });

  static async create(group: Group): Promise<Group> {
    await setDoc(doc(db, Groups.CollectionName, group.id), group);
    store.dispatch(Groups.slice.actions.added(group));
    Events.emit('group_updated', { id: group.id });
    return group;
  }

  static async update(group: Group) {
    await updateDoc(doc(db, Groups.CollectionName, group.id), { ...group });
    store.dispatch(Groups.slice.actions.updated(group));
    Events.emit('group_updated', { id: group.id });
    return group;
  }

  static async get(): Promise<Group[]> {
    const activeCongregationId = Congregations.getActiveCongregationId();
    const constraints = activeCongregationId
      ? [where('congregationId', '==', activeCongregationId)]
      : [];
    const q = query(collection(db, Groups.CollectionName), ...constraints);
    const groups: Group[] = [];

    (await getDocs(q)).forEach((group) => {
      groups.push(group.data() as Group);
    });

    store.dispatch(Groups.slice.actions.loaded(groups));
    return groups;
  }

  static async delete(group: Group): Promise<void> {
    const publishers = store.getState().publishers.publishers.filter(p => p.groupId === group.id);
    
    await deleteDoc(doc(db, Groups.CollectionName, group.id));
    
    Events.emit('group_deleted', group);
    store.dispatch(Groups.slice.actions.deleted(group));

    await Publishers.transferToGroup(publishers, 'unafiliated', true, group.id);
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

  static getAllowedGroupsForUser(user: User): Group[] {
    if (user.admin || user.role === Role.ROOT || user.role === Role.ADMIN) {
      return store.getState().groups.groups;
    }

    const groups = store.getState().groups.groups.filter(g => g.overseerId === user.id);
    
    if (groups.length > 0) {
      return groups;
    }

    // If no overseer groups, return the group of the user
    return store.getState().groups.groups.filter(g => g.id === user.groupId);
  }
}
