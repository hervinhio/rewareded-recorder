import { collection, doc, getDoc, setDoc, updateDoc, where } from "@firebase/firestore";
import { createSlice } from "@reduxjs/toolkit";
import { db } from "./database";
import { Users } from "./users";
import { store } from "./store";

export interface ConfigState {
    useShortenedMonths: boolean;
}

export class Config {
    private static InitialState: ConfigState = {
        useShortenedMonths: true,
    }
    static CollectionName = 'Config';
    static slice = createSlice({
        name: 'Reports',
        initialState: Config.InitialState,
        reducers: {
            loaded: (state, { payload }) => {
                state = payload;
            },
            changed: (state, {payload}) => {
                state = payload;
            },
        }
    });

    static async load(): Promise<void> {
        const config = await getDoc(doc(db, `${Config.CollectionName}/${Users.getCurrent().id}`));

        if (config.exists()) {
            store.dispatch(Config.slice.actions.loaded({ ...config.data()}));
        } else {
            store.dispatch(Config.slice.actions.loaded(Config.InitialState));
        }
    }

    static async update(state: ConfigState): Promise<void> {
        await setDoc(doc(db, `${Config.CollectionName}/${Users.getCurrent().id}`), { ...state });
        store.dispatch(Config.slice.actions.changed(state));
    }
}
