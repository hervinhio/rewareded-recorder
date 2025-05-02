import { createSlice } from "@reduxjs/toolkit";
import { Submission } from '../types';
import { store } from "./store";
import { Flags } from './flags';
import axios, { AxiosError } from 'axios';

export interface SubmissionsState {
    submissions: Submission[]
}


export class Submissions {
    private static InitialState: SubmissionsState = {
      submissions: [],
    };
    static CollectionName = 'Submissions';
    static slice = createSlice({
        name: 'Submissions',
        initialState: this.InitialState,
        reducers: {
            added: (state, { payload }) => {
                state.submissions = [ ...state.submissions, payload ];
            },
            loaded: (state, { payload }) => {
                state.submissions = payload;
            }
        },
    });

    static async all(): Promise<Submission[]> {
      try {
        const submissions: Submission[] = await axios.get('/api/submissions', {
          headers: { Authorization: localStorage.getItem('jwt') },
        }).then((res) => res.data);
        store.dispatch(this.slice.actions.loaded(submissions));
        return submissions;
      } catch (error) {
        Flags.raiseError('Unable to fetch submissions ' + (error as AxiosError).message);
        store.dispatch(this.slice.actions.loaded([]));
      }

      return [];
    }

    static add(submission: Submission): void {
        store.dispatch(this.slice.actions.added(submission));
    }
}
