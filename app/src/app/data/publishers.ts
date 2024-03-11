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
  updateDoc,
  increment,
} from 'firebase/firestore';
import { Reports } from '.';
import { Events, Publisher, PublisherActivityStatus } from '../types';
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

export enum PublisherDeletionReason {
  Gone,
  Disfellowshiped,
};

export enum NewPublisherReason {
  New,
  Transferred,
};

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
        state.byGroup['pioneers'] = [...state.byGroup['pioneers'], payload];
        state.byGroup['inactives'] = [...state.byGroup['inactives'], payload];
      },
      removed: (state, { payload }) => {
        const publisher = state.publishers.find(pub => pub.id === payload) || {groupId: 'unafiliated', id: payload};
        state.publishers = state.publishers.filter(publisher => publisher.id !== payload);
        state.byGroup[publisher.groupId] = state.byGroup[publisher.groupId]
          .filter(publisher => publisher.id !== payload);
        state.byGroup['pioneers'] = state.byGroup[publisher.groupId]
          .filter(publisher => publisher.id !== payload);
        state.byGroup['inactives'] = state.byGroup[publisher.groupId]
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
        state.byGroup['pioneers'] = payload.filter((p: Publisher) => p.isRegularPioneer);
        state.byGroup['inactives'] = payload.filter((p: Publisher) => p.activityStatus === PublisherActivityStatus.Inactive);
      },
      changed: (state, { payload }) => {
        state.publishers = [...state.publishers.filter(p => p.id !== payload.id), payload];
        state.byGroup = { pioneers: [], inactives: []};
        state.publishers.forEach((publisher: Publisher) => {
          if (!state.byGroup[publisher.groupId]) {
            state.byGroup[publisher.groupId] = [];
          }

          state.byGroup[publisher.groupId].push(publisher);

          if ((payload as Publisher).isRegularPioneer) {
            state.byGroup['pioneers'].push(payload);
          }

          if ((payload as Publisher).activityStatus === PublisherActivityStatus.Inactive) {
            state.byGroup['inactives'].push(payload);
          }
        });
      },
      manyChanged: (state, { payload }) => {
        const filtered = state.publishers.filter(p => !payload.publishers.some((p2: Publisher) => p2.id === p.id));
        state.publishers = [...filtered, ...payload.publishers];
        state.byGroup[payload.fromGroup] = [...(state.byGroup[payload.fromGroup] || []).filter(p1 => payload.publishers.some((p2: Publisher) => p1.id !== p2.id))]
        state.byGroup[payload.toGroup] = [...filtered, ...payload.publishers];
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      },
      groupDeleted: (state, { payload }) => {
        delete state.byGroup[payload]
        const publishers = state.publishers.filter(p => p.groupId === payload);
        publishers.forEach(p => p.groupId = 'unafiliated');

        if (!state.byGroup['unafiliated']) {
          state.byGroup['unafiliated'] = [];
        }
        state.byGroup['unafiliated'] = [...state.byGroup['unafiliated'], ...publishers];
      }
    }
  })

  static async create(publisher: Publisher, reason: NewPublisherReason): Promise<Publisher> {
    const inc = increment(1);
    const field = reason === NewPublisherReason.Transferred ? 'newComers' : 'newPublishers';

    const ref = await addDoc(collection(db, Publishers.CollectionName), { ...publisher, activityStatus: PublisherActivityStatus.Inactive });
    await updateDoc(doc(db, 'Stats/unique'), { [field]: inc });
    store.dispatch(Publishers.slice.actions.added({ ...publisher, id: ref.id, activityStatus: PublisherActivityStatus.Inactive }));
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

    store.dispatch(Publishers.slice.actions.loaded(publishers));
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

  static async delete(publisherId: string | undefined, reason: PublisherDeletionReason): Promise<void> {
    if (!publisherId) return;
    const inc = increment(1);
    const field = reason === PublisherDeletionReason.Disfellowshiped ? 'disfellowshiped' : 'gone';

    await Reports.deleteByPublisherId(publisherId);
    await deleteDoc(doc(db, Publishers.CollectionName, publisherId));
    await updateDoc(doc(db, 'Stats/unique'), { [field]: inc, });
    Events.emit('publisher_deleted', { id: publisherId });

    store.dispatch(Publishers.slice.actions.removed(publisherId));
  }

  static async transferToGroup(publishers: Publisher[], groupId: string, groupDeleted: boolean, fromGroup: string) {
    const publishersIdsByTens = [] as string[][];
    
    publishers.forEach((p: Publisher, index: number) => {
      const byTensIdx = Math.floor((index + 1) / 10);
      if (!publishersIdsByTens[byTensIdx]) {
        publishersIdsByTens[byTensIdx] = [] as string[];

        if (p.id) {
          publishersIdsByTens[byTensIdx].push(p.id);
        }
      }
    });

    for (const ids of publishersIdsByTens) {
      const q = query(
        collection(db, Publishers.CollectionName),
        where(
          documentId(),
          'in',
          ids,
        )
      );
  
      await runTransaction(db, async (transaction: Transaction) => {
        const docs = await getDocs(q);
        docs.forEach((doc) => {
          transaction.update(doc.ref, { ...doc.data(), groupId });
        });
      });
    }
    
    if (groupDeleted) {
      store.dispatch(Publishers.slice.actions.groupDeleted(fromGroup));
    } else {
      const changedPublishers = publishers.map(p => ({ ...p, groupId }));
      store.dispatch(Publishers.slice.actions.manyChanged({
        fromGroup: fromGroup,
        toGroup: groupId,
        publishers: changedPublishers
      }));
      Events.emit('publishers_transfered', { id: uniqueId(), publishers: changedPublishers, fromGroup, toGroup: groupId});
    }
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
