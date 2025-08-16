import { createSlice } from "@reduxjs/toolkit";
import { SpecialMonth } from "../types";

export interface DialogsState {
    showContactsDialog: boolean;
    showSearchDialog: boolean;
    showCreatePublisherModal: boolean;
    showCreateGroupModal: boolean;
    showDownloadMissingReportsModal: boolean;
    showAttendanceReportModal: boolean;
    showRefreshDialog: boolean;
    showCreateSpecialMonthModal: boolean;
    editingSpecialMonth: SpecialMonth | null;
}

export class Dialogs {
    static slice = createSlice({
        name: 'Dialogs',
        initialState: {
            showContactsDialog: false,
            showSearchDialog: false,
            showRefreshDialog: false,
            showCreateSpecialMonthModal: false,
            editingSpecialMonth: null,
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
            toggleRefreshDialog: (state) => {
                return {
                    ...state,
                    showRefreshDialog: !state.showRefreshDialog,
                }
            },
            toggleCreateSpecialMonthModal: (state) => {
                return {
                    ...state,
                    showCreateSpecialMonthModal: !state.showCreateSpecialMonthModal,
                    editingSpecialMonth: null, // Clear editing state when opening create modal
                };
            },
            setEditingSpecialMonth: (state, action) => {
                return {
                    ...state,
                    showCreateSpecialMonthModal: true,
                    editingSpecialMonth: action.payload,
                };
            }
        }
    })
}
