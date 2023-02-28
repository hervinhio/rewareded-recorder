import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc } from 'firebase/firestore';
import { db, store } from '.';
import { User } from '../types';
import { createSlice } from '@reduxjs/toolkit';

interface UserMap {
  [id: string]: User,
}

export interface UsersState {
  current?: User;
  users: UserMap;
  loading: boolean;
}

export class Users {
  private static InitialState: UsersState = {
    loading: false,
    users: {},
  };
  private static readonly CollectionName = 'Users';
  private static current: User;
  static slice = createSlice({
    name: 'Users',
    initialState: Users.InitialState,
    reducers: {
      currentUserSet: (state, { payload }) => {
        state.current = payload;
      },
      loadingStarted: (state) => {
        state.loading = true;
      },
      loadingEnded: (state) => {
        state.loading = false;
      },
      loaded: (state, { payload }) => {
        payload?.forEach((user: User) => {
          state.users[user.id] = user;
        })
      },
      updated: (state, { payload }) => {
        state.users[payload.id] = { ...payload };
      },
      deleted: (state, { payload }) => {
        delete state.users[payload.id];
      }
    }
  })

  static async getOne(id: string): Promise<User | null> {
    const userDoc = await getDoc(doc(collection(db, Users.CollectionName), id));

    if (userDoc.exists()) {
      return userDoc.data() as User;
    }

    return null;
  }

  static async create(user: User): Promise<User> {
    user.admin = false;
    user.validated = false;

    await setDoc(doc(collection(db, Users.CollectionName), user.id), user);
    return user;
  }

  static setCurrent(user: User) {
    Users.current = user;
  }

  static getCurrent(): User {
    return Users.current;
  }

  static async delete(userId: string): Promise<void> {
    await deleteDoc(doc(db, `${Users.CollectionName}/${userId}`));
    store.dispatch(Users.slice.actions.deleted(userId));
  }

  static async update(user: User): Promise<void> {
    await updateDoc(doc(db, `${Users.CollectionName}/${user.id}`), { ...user });
    store.dispatch(Users.slice.actions.updated(user));
  }

  static async all(): Promise<void> {
    const users: User[] = [];

    const q = query(
      collection(db, this.CollectionName)
    );

    (await getDocs(q)).forEach((doc) => {
      users.push({ ...doc.data() as User, id: doc.id, });
    });

    store.dispatch(Users.slice.actions.loaded(users));
  }
}
