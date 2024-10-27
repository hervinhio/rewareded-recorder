import { createSlice } from "@reduxjs/toolkit";

export interface DialogsState {
    showContactsDialog: boolean;
    showSearchDialog: boolean;
    showCreatePublisherModal: boolean;
    showCreateGroupModal: boolean;
    showDownloadMissingReportsModal: boolean;
    showAttendanceReportModal: boolean;
}

export class Dialogs {
    static slice = createSlice({
        name: 'Dialogs',
        initialState: {
            showContactsDialog: false,
            showSearchDialog: false,
        } as DialogsState,
        reducers: {
            toggleContactsDialog: (state) => {
                return {
                    ...state,
                    showContactsDialog: !state.showContactsDialog,
                }
            },
            toggleSearchDialog: (state) => {
                return {
                    ...state,
                    showSearchDialog: !state.showSearchDialog
                }
            },
            toggleCreatePublisherModal: (state) => {
                return {
                    ...state,
                    showCreatePublisherModal: !state.showCreatePublisherModal,
                }
            },
            toggleCreateGroupModal: (state) => {
                return {
                    ...state,
                    showCreateGroupModal: !state.showCreateGroupModal,
                };
            },
            toggleDownloadMissingReportsModal: (state) => {
                return {
                    ...state,
                    showDownloadMissingReportsModal: !state.showDownloadMissingReportsModal,
                };
            },
            toggleAttendanceReportModal: (state) => {
                return {
                    ...state,
                    showAttendanceReportModal: !state.showAttendanceReportModal,
                };
            },
        }
    })
}
