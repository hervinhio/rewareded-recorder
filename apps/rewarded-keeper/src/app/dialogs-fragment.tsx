import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  AttendanceReportModal,
  CreateGroupDialog,
  CreatePublisherModal,
  DownloadMissingReportsModal,
  RefreshDialog,
  SearchModal,
} from './comps';
import { CreateSpecialMonthDialog } from './comps/modals/create-special-month.dialog';
import { Dialogs, GlobalState } from './data';
import { Fragment } from 'react';

export function DialogsFragment() {
  const {
    showSearchDialog,
    showCreatePublisherModal,
    showCreateGroupModal,
    showDownloadMissingReportsModal,
    showAttendanceReportModal,
    showRefreshDialog,
    showCreateSpecialMonthModal,
  } = useSelector((state: GlobalState) => state.dialogs, shallowEqual);
  const dispatch = useDispatch();

  return (
    <Fragment>
      {showSearchDialog && (
        <SearchModal
          onClose={() => dispatch(Dialogs.slice.actions.toggleSearchDialog())}
          show={showSearchDialog}
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
      {showRefreshDialog && (
        <RefreshDialog
          show={showRefreshDialog}
          onHide={() => dispatch(Dialogs.slice.actions.toggleRefreshDialog())}
        />
      )}
      {showCreateSpecialMonthModal && (
        <CreateSpecialMonthDialog
          show={showCreateSpecialMonthModal}
          onClose={() =>
            dispatch(Dialogs.slice.actions.toggleCreateSpecialMonthModal())
          }
        />
      )}
    </Fragment>
  );
}
