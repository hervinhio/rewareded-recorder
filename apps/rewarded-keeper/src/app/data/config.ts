import { doc, getDoc, setDoc } from "@firebase/firestore";
import { createSlice } from "@reduxjs/toolkit";
import { db } from "./database";
import { Users } from "./users";
import { store } from "./store";
import { isAuthenticated } from "../auth";

export interface ConfigState {
    useShortenedMonths: boolean;
}

export class Config {
    private static InitialState: ConfigState = {
        useShortenedMonths: true,
    }
    static CollectionName = 'Config';
    static slice = createSlice({
        name: 'Config',
        initialState: Config.InitialState,
        reducers: {
            loaded: (state, { payload }) => {
                return payload;
            },
            changed: (state, {payload}) => {
                return payload;
            },
        }
    });

    static async load(): Promise<void> {
        const authenticated = await isAuthenticated();

        if (!authenticated) return;

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
