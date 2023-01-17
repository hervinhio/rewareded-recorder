import { createSlice } from "@reduxjs/toolkit";


interface FlagsMap {
    [id: string]: JSX.Element;
}

export interface FlagsState {
    flags: FlagsMap;
}

export class Flags {
    static slice = createSlice({
        name: 'Flags',
        initialState: {
            flags: {},
        } as FlagsState,
        reducers: {
            added: (state, { payload }) => {
                state.flags = { ...state.flags, [payload.id]: payload.flag }
            },
            removed: (state, { payload }) => {
                delete state.flags[payload];
            }
        }
    })
}
