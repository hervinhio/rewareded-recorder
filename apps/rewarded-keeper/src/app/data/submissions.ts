import { createSlice } from "@reduxjs/toolkit";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { Submission } from "../types/submission";
import { db } from "./database";
import { store } from "./store";

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
        const submissions: Submission[] = [];
        const q = query(
            collection(db, this.CollectionName),
            limit(10),
        );

        (await getDocs(q)).forEach((doc) => {
            submissions.push(doc.data() as Submission);
        });

        store.dispatch(this.slice.actions.loaded(submissions));
        return submissions;
    }

    static add(submission: Submission): void {
        store.dispatch(this.slice.actions.added(submission));
    }
}
