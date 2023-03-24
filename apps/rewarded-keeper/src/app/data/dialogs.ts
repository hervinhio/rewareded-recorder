import { createSlice } from "@reduxjs/toolkit";

export interface DialogsState {
    showContactsDialog: boolean;
};

export class Dialogs {
    static slice = createSlice({
        name: 'Dialogs',
        initialState: {
            showContactsDialog: false,
        } as DialogsState,
        reducers: {
            toggleContactsDialog: (state) => {
                state.showContactsDialog = !state.showContactsDialog;
            }
        }
    })
}
