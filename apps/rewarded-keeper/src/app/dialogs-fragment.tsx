import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  AttendanceReportModal,
  CreateGroupDialog,
  CreatePublisherModal,
  DownloadMissingReportsModal,
  SearchModal,
} from './comps';
import { Dialogs, GlobalState } from './data';
import { Fragment } from 'react';

export function DialogsFragment() {
  const {
    showSearchDialog,
    showCreatePublisherModal,
    showCreateGroupModal,
    showDownloadMissingReportsModal,
    showAttendanceReportModal,
  } = useSelector((state: GlobalState) => state.dialogs, shallowEqual);
  const dispatch = useDispatch();

  return (
    <Fragment>
      {showSearchDialog && (
        <SearchModal
          onClose={() => dispatch(Dialogs.slice.actions.toggleSearchDialog())}
        />
      )}
      {showCreatePublisherModal && (
        <CreatePublisherModal
          show={showCreatePublisherModal}
          onHide={() =>
            dispatch(Dialogs.slice.actions.toggleCreatePublisherModal())
          }
        />
      )}
      {showCreateGroupModal && (
        <CreateGroupDialog
          show={showCreateGroupModal}
          onHide={() =>
            dispatch(Dialogs.slice.actions.toggleCreateGroupModal())
          }
        />
      )}
      {showDownloadMissingReportsModal && (
        <DownloadMissingReportsModal
          show={showDownloadMissingReportsModal}
          onHide={() =>
            dispatch(Dialogs.slice.actions.toggleDownloadMissingReportsModal())
          }
        />
      )}
      {showAttendanceReportModal && (
        <AttendanceReportModal
          show={showAttendanceReportModal}
          mode="create"
          onHide={() =>
            dispatch(Dialogs.slice.actions.toggleAttendanceReportModal())
          }
        />
      )}
    </Fragment>
  );
}
