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
} from 'firebase/firestore';
import { Repports } from '.';
import { Events, Publisher } from '../types';
import { db } from './database';
import { createSlice } from '@reduxjs/toolkit';
import { store } from './store';
import { uniqueId } from 'lodash';

interface PublishersByGroup {
  [groupId: string]: Publisher[];
}

export interface PublishersState {
  publishers: Publisher[];
  loading: boolean;
  byGroup: PublishersByGroup;
}

export class Publishers {
  private static InititalState: PublishersState = {
    publishers: [],
    loading: false,
    byGroup: {},
  };
  static CollectionName = 'Publishers';
  static slice = createSlice({
    name: 'Publishers',
    initialState: Publishers.InititalState,
    reducers: {
      added: (state, { payload }) => {
        state.publishers = [...state.publishers, payload];
        if (!state.byGroup[payload.groupId]) {
          state.byGroup[payload.groupId] = [];
        }
        state.byGroup[payload.groupId] = [...state.byGroup[payload.groupId], payload];
      },
      removed: (state, { payload }) => {
        state.publishers = state.publishers.filter(publisher => publisher.id !== payload);
        state.byGroup[payload.groupId] = state.byGroup[payload.groupId]
          .filter(publisher => publisher.id !== payload);
      },
      loaded: (state, { payload }) => {
        state.publishers = payload;
        state.byGroup = {};
        payload.forEach((publisher: Publisher) => {
          if (!state.byGroup[publisher.groupId]) {
            state.byGroup[publisher.groupId] = [];
          }

          state.byGroup[publisher.groupId].push(publisher);
        });
      },
      changed: (state, { payload }) => {
        state.publishers = [...state.publishers.filter(p => p.id !== payload.id), payload];
        state.byGroup[payload.groupId] = [...state.publishers.filter(p => p.id !== payload.id), payload];
      },
      manyChanged: (state, { payload }) => {
        const filtered = state.publishers.filter(p => payload.some((p2: Publisher) => p2.id === p.id));
        state.publishers = [...filtered, ...payload];
        state.byGroup[payload.groupId] = [...filtered, ...payload];
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      }
    }
  })

  static async create(publisher: Publisher): Promise<Publisher> {
    const ref = await addDoc(collection(db, Publishers.CollectionName), publisher);
    store.dispatch(Publishers.slice.actions.added({ ...publisher, id: ref.id, }));
    const createdPublisher =  { ...publisher, id: ref.id };
    Events.emit('publisher_updated', createdPublisher);

    return createdPublisher;
  }

  static async all(): Promise<Publisher[]> {
    const publishers: Publisher[] = [];
    const q = query(collection(db, Publishers.CollectionName), orderBy('name'));

    (await getDocs(q)).forEach((doc) => {
      publishers.push({ ...doc.data(), id: doc.id } as Publisher);
    });

    return publishers;
  }

  static async save(publisher: Publisher): Promise<Publisher> {
    await setDoc(
      doc(db, Publishers.CollectionName, publisher.id || ''),
      publisher
    );

    store.dispatch(Publishers.slice.actions.changed(publisher));
    Events.emit('publisher_updated', publisher);
    return publisher;
  }

  static async delete(publisherId: string | undefined): Promise<void> {
    if (!publisherId) return;
    await Repports.deleteByPublisherId(publisherId);
    await deleteDoc(doc(db, Publishers.CollectionName, publisherId));
    Events.emit('publisher_deleted', { id: publisherId });

    store.dispatch(Publishers.slice.actions.removed(publisherId));
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

    await runTransaction(db, async (transaction: Transaction) => {
      const docs = await getDocs(q);
      docs.forEach((doc) => {
        transaction.update(doc.ref, { ...doc.data(), groupId });
      });
    });

    const changedPublishers = publishers.map(p => ({ ...p, groupId }));
    Events.emit('publisher_updated', { id: uniqueId()});
    store.dispatch(Publishers.slice.actions.manyChanged(changedPublishers));
  }

  static async findByName(namePart: string): Promise<Publisher[]> {
    const normalizedNamePart = `${namePart
      .charAt(0)
      .toUpperCase()}${namePart.slice(1)}`;
    const publishers: Publisher[] = [];
    const q = query(
      collection(db, Publishers.CollectionName),
      orderBy('name'),
      startAt(normalizedNamePart),
      endAt(`${normalizedNamePart}\uf8ff`),
    );

    (await getDocs(q)).forEach((doc) => {
      publishers.push({ ...doc.data(), id: doc.id } as Publisher);
    });

    return publishers;
  }
}
