import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '.';
import { User } from '../types';
import { createSlice } from '@reduxjs/toolkit';

export interface UsersState {
  current?: User;
  loading: boolean;
}

export class Users {
  private static InitialState: UsersState = {
    loading: false,
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
}
