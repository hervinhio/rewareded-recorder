import { configureStore } from '@reduxjs/toolkit';
import { Groups, GroupsState } from './groups';
// Reports store is deprecated - reports are now stored as arrays within publisher documents
// import { Reports, ReportsState } from './reports';
import { Publishers, PublishersState } from './publishers';
import { Users, UsersState } from './users';
import { Notifications, NotificationsState } from './notifications';
import { Submissions, SubmissionsState } from './submissions';
import { Config, ConfigState } from './config';
import { Dialogs, DialogsState } from './dialogs';
import { AttendanceRecordState, AttendanceRecords } from './attendance-records';
import { SpecialMonths, SpecialMonthsState } from './special-months';
import { Version } from './version';

export const store = configureStore({
    reducer: {
        groups: Groups.slice.reducer,
        // reports: Reports.slice.reducer, // DEPRECATED: Reports are now stored within publisher documents
        publishers: Publishers.slice.reducer,
        notifications: Notifications.slice.reducer,
        users: Users.slice.reducer,
        submissions: Submissions.slice.reducer,
        config: Config.slice.reducer,
        dialogs: Dialogs.slice.reducer,
        attendanceRecords: AttendanceRecords.slice.reducer,
        specialMonths: SpecialMonths.slice.reducer,
        version: Version.slice.reducer,
    },
});

export interface GlobalState {
    groups: GroupsState;
    // reports: ReportsState, // DEPRECATED: Reports are now stored within publisher documents
    publishers: PublishersState,
    notifications: NotificationsState,
    users: UsersState,
    submissions: SubmissionsState,
    config: ConfigState,
    dialogs: DialogsState,
    attendanceRecords: AttendanceRecordState,
    specialMonths: SpecialMonthsState,
    version: 1 | 2;
}
