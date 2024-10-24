import { configureStore } from '@reduxjs/toolkit';
import { Groups, GroupsState } from './groups';
import { Reports, ReportsState } from './reports';
import { Publishers, PublishersState } from './publishers';
import { Users, UsersState } from './users';
import { Notifications, NotificationsState } from './notifications';
import { Flags, FlagsState } from './flags';
import { Submissions, SubmissionsState } from './submissions';
import { Config, ConfigState } from './config';
import { Dialogs, DialogsState } from './dialogs';
import { AttendanceRecordState, AttendanceRecords } from './attendance-records';
import { Version } from './version';

export const store = configureStore({
    reducer: {
        groups: Groups.slice.reducer,
        reports: Reports.slice.reducer,
        publishers: Publishers.slice.reducer,
        notifications: Notifications.slice.reducer,
        users: Users.slice.reducer,
        flags: Flags.slice.reducer,
        submissions: Submissions.slice.reducer,
        config: Config.slice.reducer,
        dialogs: Dialogs.slice.reducer,
        attendanceRecords: AttendanceRecords.slice.reducer,
        version: Version.slice.reducer,
    },
});

export interface GlobalState {
    groups: GroupsState;
    reports: ReportsState,
    publishers: PublishersState,
    notifications: NotificationsState,
    users: UsersState,
    flags: FlagsState,
    submissions: SubmissionsState,
    config: ConfigState,
    dialogs: DialogsState,
    attendanceRecords: AttendanceRecordState,
    version: 1 | 2;
}
