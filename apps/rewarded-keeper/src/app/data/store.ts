import { configureStore } from '@reduxjs/toolkit';
import { Groups, GroupsState } from './groups';
import { Repports, ReportsState } from './reports';
import { Publishers, PublishersState } from './publishers';
import { Users, UsersState } from './users';
import { Notifications, NotificationsState } from './notifications';
import { Flags, FlagsState } from './flags';
import { Submissions, SubmissionsState } from './submissions';
import { Config, ConfigState } from './config';
import { Dialogs, DialogsState } from './dialogs';

export const store = configureStore({
    reducer: {
        groups: Groups.slice.reducer,
        reports: Repports.slice.reducer,
        publishers: Publishers.slice.reducer,
        notifications: Notifications.slice.reducer,
        users: Users.slice.reducer,
        flags: Flags.slice.reducer,
        submissions: Submissions.slice.reducer,
        config: Config.slice.reducer,
        dialogs: Dialogs.slice.reducer,
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
};
