import { doc, getDoc, setDoc } from "@firebase/firestore";
import { createSlice, nanoid } from "@reduxjs/toolkit";
import { db } from "./database";
import { Users } from "./users";
import { store } from "./store";
import { Flags } from "./flags";

export interface ConfigState {
    useShortenedMonths: boolean;
    theme: 'dark' | 'light' | 'system';
}

export class Config {
    private static InitialState: ConfigState = {
        useShortenedMonths: true,
        theme: 'system',
    }
    static CollectionName = 'Config';
    static slice = createSlice({
        name: 'Config',
        initialState: Config.InitialState,
        reducers: {
            loaded: (_state, { payload }) => {
                return payload;
            },
            changed: (_state, {payload}) => {
                return payload;
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
        try {
            await setDoc(doc(db, `${Config.CollectionName}/${Users.getCurrent().id}`), { ...state });
        } catch (e: unknown) {
            Flags.raiseError(e);
            return;
        }

        localStorage.setItem('themeMode', state.theme);
        store.dispatch(Config.slice.actions.changed(state));
        Flags.raiseSuccess({
            title: 'Configuration mise à jour avec succès. Recharger la page peut-être nécessaire',
        });
    }

    static switchThemeToDark(): Promise<void> {
        const config = store.getState().config;

        return Config.update({ ...config, theme: 'dark'});
    }

    static switchThemeToLight(): Promise<void> {
        const config = store.getState().config;

        return Config.update({ ...config, theme: 'light'});
    }

    static switchThemeToAuto(): Promise<void> {
        const config = store.getState().config;

        return Config.update({ ...config, theme: 'system'});
    }
}
