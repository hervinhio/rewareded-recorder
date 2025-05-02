import { store } from '.';
import { User } from '../types';
import { createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { Flags } from './flags';

interface UserMap {
  [id: string]: User;
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
        });
      },
      updated: (state, { payload }) => {
        state.users[payload.id] = { ...payload };
      },
      deleted: (state, { payload }) => {
        delete state.users[payload.id];
      },
    },
  });

  static async getOne(id: string): Promise<User | null> {
    try {
      return await axios
        .get(`/api/users/${id}`, {
          headers: { Authorization: localStorage.getItem('jwt') },
        })
        .then((res) => res.data);
    } catch (error) {
      Flags.raiseError(
        'Unable to load user ' + id + ' : ' + (error as AxiosError).message,
      );
    }

    return null;
  }

  static async create(user: User): Promise<void> {
    user.admin = false;
    user.validated = false;

    try {
      const createdUser = await axios.post('/api/users', user, {
        headers: { Authorization: localStorage.getItem('jwt') },
      }).then((res) => res.data);
      store.dispatch(Users.slice.actions.updated(createdUser));
    } catch (error) {
      Flags.raiseError(
        'Unable to create user ' + user.id + ' : ' + (error as AxiosError).message,
      );
    }
  }

  static setCurrent(user: User) {
    Users.current = user;
  }

  static getCurrent(): User {
    return Users.current;
  }

  static async delete(userId: string): Promise<void> {
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: localStorage.getItem('jwt') },
      }).then((res) => {})
      store.dispatch(Users.slice.actions.deleted(userId));
    } catch (error) {
      Flags.raiseError(
        'Unable to delete user ' + userId + ' : ' + (error as AxiosError).message,
      );
    }
  }

  static async update(user: User): Promise<void> {
    try {
      const updatedUser = await axios.patch(`/api/users/${user.id}`, user, {
        headers: { Authorization: localStorage.getItem('jwt') },
      }).then((res) => res.data);
      store.dispatch(Users.slice.actions.updated(updatedUser));
    } catch (error) {
      Flags.raiseError(
        'Unable to update user ' + user.id + ' : ' + (error as AxiosError).message,
      );
    }
  }

  static async loadCurrent(): Promise<void> {
    try {
      const user = await axios.get('/api/users/current', {
        headers: { Authorization: localStorage.getItem('jwt') },
      }).then((res) => res.data);
      store.dispatch(Users.slice.actions.currentUserSet(user));
      Users.setCurrent(user);
    } catch (error) {
      Flags.raiseError(
        'Unable to load current user : ' + (error as AxiosError).message,
      );
    }

    store.dispatch(Users.slice.actions.currentUserSet(null));
  }

  static async all(): Promise<void> {
    try {
      const users = await axios.get('/api/users', {
        headers: { Authorization: localStorage.getItem('jwt') },
      }).then((res) => res.data);

      store.dispatch(Users.slice.actions.loaded(users));
    } catch (error) {
      Flags.raiseError(
        'Unable to load users : ' + (error as AxiosError).message,
      );
    }

    store.dispatch(Users.slice.actions.loaded([]));
  }
}
