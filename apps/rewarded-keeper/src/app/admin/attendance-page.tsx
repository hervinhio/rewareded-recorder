import { getLastTwelveMonths } from '../utils';
import {
  AttendanceRecord,
  AttendanceRecords,
  GlobalState,
  store,
} from '../data';
import { useDispatch, useSelector } from 'react-redux';
import { AttendanceReportModal, ConfirmationDialog } from '../comps';
import { isEqual } from 'lodash';
import { Timestamp } from 'firebase/firestore';
import { useState } from 'react';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Badge,
  Body1,
  Body1Strong,
  createTableColumn,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  makeStyles,
  Subtitle2,
  TableCellLayout,
  TableColumnDefinition,
  tokens,
  Toolbar,
  ToolbarButton,
  Tooltip,
} from '@fluentui/react-components';
import {
  AddFilled,
  CalendarFilled,
  DeleteFilled,
  EditFilled,
  TextWordCountFilled,
} from '@fluentui/react-icons';

const columns: TableColumnDefinition<AttendanceRecord>[] = [
  createTableColumn<AttendanceRecord>({
    columnId: 'date',
    compare: (a, b) => (a.date > b.date ? 1 : -1),
    renderHeaderCell: () => 'Date',
    renderCell: (row) => (
      <TableCellLayout
        media={
          row.id?.startsWith('average') ? (
            <TextWordCountFilled />
          ) : (
            <CalendarFilled />
          )
        }>
        <span>
          {!row.id?.startsWith('average') && (
            <Badge
              appearance="filled"
              color={row.isMidweekMeeting ? 'brand' : 'informative'}>
              {row.isMidweekMeeting ? 'M' : 'W'}
            </Badge>
          )}
          &nbsp;
          {row.id?.startsWith('average') ? (
            <Body1Strong>
              {row.isMidweekMeeting ? 'Totaux Semaine' : 'Totaux Weekend'}
            </Body1Strong>
          ) : (
            <Body1>
              {row.date.toDate().toLocaleDateString('fr-FR', {
                year: '2-digit',
                month: 'short',
                day: '2-digit',
              })}
            </Body1>
          )}
        </span>
      </TableCellLayout>
    ),
  }),
  createTableColumn({
    columnId: 'attendance',
    compare: (a, b) =>
      (a.zoom || 0) + (a.inPerson || 0) > (b.zoom || 0) + (b.inPerson || 0)
        ? 1
        : -1,
    renderHeaderCell: () => 'Assitance',
    renderCell: (row) => (
      <Body1>
        {row.id?.startsWith('average')
          ? (
              ((row.inPerson || 0) + (row.zoom || 0)) /
                (row.isMidweekMeeting ? row.count || 1 : row.count || 1) || 0
            ).toFixed(2)
          : (row.inPerson || 0) + (row.zoom || 0)}
      </Body1>
    ),
  }),
  createTableColumn({
    columnId: 'actions',
    renderHeaderCell: () => 'Actions',
    renderCell: (row) =>
      row.id === 'average' ? null : (
        <Toolbar>
          <Tooltip content="Supprimer cet enregistrement" relationship="label">
            <ToolbarButton
              icon={
                <DeleteFilled color={tokens.colorStatusDangerForeground1} />
              }
              aria-label="Supprimer cet enregistrement"
              onClick={() =>
                store.dispatch(
                  AttendanceRecords.slice.actions.setForDeletion(row),
                )
              }
            />
          </Tooltip>
          <Tooltip content="Modifier cet enregistrement" relationship="label">
            <ToolbarButton
              icon={<EditFilled />}
              onClick={() =>
                store.dispatch(
                  AttendanceRecords.slice.actions.setForModification(row),
                )
              }
            />
          </Tooltip>
        </Toolbar>
      ),
  }),
];

const useStyles = makeStyles({
  section: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
});

export function AttendancePage() {
  const styles = useStyles();
  const months = getLastTwelveMonths(new Date());
  const { data, recordUnderEdit, recordPendingDeletion } = useSelector(
    (state: GlobalState) => ({
      data: state.attendanceRecords.records,
      recordPendingDeletion: state.attendanceRecords.forDeletion,
      recordUnderEdit: state.attendanceRecords.forModification,
    }),
    isEqual,
  );
  const dispatch = useDispatch();
  const [showNewRecordDialog, setShowNewRecordDialog] = useState(false);

  return (
    <section className={styles.section}>
      <Subtitle2>Assitance</Subtitle2>
      <Toolbar>
        <ToolbarButton
          appearance="subtle"
          icon={<AddFilled />}
          onClick={() => setShowNewRecordDialog(true)}>
          Nouveau rapport
        </ToolbarButton>
      </Toolbar>
      <br />
      <br />
      <Accordion>
        {months.map((month, id) => (
          <AccordionItem value={`${id}`} key={id}>
            <AccordionHeader>{month.toLocaleFullMonth()}</AccordionHeader>
            <AccordionPanel>
              <DataGrid
                columns={columns}
                getRowId={(item) => item.id}
                items={getMonthRecords(month.getKey(), data)}>
                <DataGridHeader>
                  <DataGridRow>
                    {({ renderHeaderCell }) => (
                      <DataGridHeaderCell>
                        {renderHeaderCell()}
                      </DataGridHeaderCell>
                    )}
                  </DataGridRow>
                  <DataGridBody<AttendanceRecord>>
                    {({ item, rowId }) => (
                      <DataGridRow<AttendanceRecord> key={rowId}>
                        {({ renderCell }) => (
                          <DataGridCell>{renderCell(item)}</DataGridCell>
                        )}
                      </DataGridRow>
                    )}
                  </DataGridBody>
                </DataGridHeader>
              </DataGrid>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      {!!recordPendingDeletion && (
        <ConfirmationDialog
          title="Supprimer un rapport d'assitance"
          show={!!recordPendingDeletion}
          risky={true}
          onClose={async (confirmed) => {
            if (confirmed) {
              await AttendanceRecords.delete(recordPendingDeletion);
            } else {
              dispatch(
                AttendanceRecords.slice.actions.setForDeletion(undefined),
              );
            }
          }}>
          <Body1>
            Êtes-vous sur de vouloir supprimer ce rapport d'assistance, vous ne
            pourrez le recouvrer.
          </Body1>
        </ConfirmationDialog>
      )}
      {!!recordUnderEdit && (
        <AttendanceReportModal
          show={!!recordUnderEdit}
          record={recordUnderEdit}
          mode="edit"
          onHide={() => {
            dispatch(
              AttendanceRecords.slice.actions.setForModification(undefined),
            );
          }}
        />
      )}
      {showNewRecordDialog && (
        <AttendanceReportModal
          mode="create"
          onHide={() => setShowNewRecordDialog(false)}
          show={true}
        />
      )}
    </section>
  );
}

function getMonthRecords(
  monthId: string,
  records: AttendanceRecord[],
): AttendanceRecord[] {
  const monthRecords = records.filter((r) => r.monthId === monthId);
  const midweekRows = monthRecords.filter((r) => r.isMidweekMeeting);
  const weekendRows = monthRecords.filter((r) => !r.isMidweekMeeting);
  const now = new Date();

  return [
    ...monthRecords,
    {
      date: Timestamp.fromDate(now),
      inPerson:
        midweekRows.length > 0
          ? midweekRows.map((r) => r.inPerson || 0).reduce((p, c) => p + c)
          : 0,
      zoom:
        midweekRows.length > 0
          ? midweekRows.map((r) => r.zoom || 0).reduce((p, c) => p + c)
          : 0,
      monthId: records[0]?.monthId,
      isMidweekMeeting: true,
      id: 'average-midweek',
      count: midweekRows.length,
    },
    {
      date: Timestamp.fromDate(now),
      inPerson:
        weekendRows.length > 0
          ? weekendRows.map((r) => r.inPerson || 0).reduce((p, c) => p + c)
          : 0,
      zoom:
        weekendRows.length > 0
          ? weekendRows.map((r) => r.zoom || 0).reduce((p, c) => p + c)
          : 0,
      monthId: records[0]?.monthId,
      isMidweekMeeting: false,
      id: 'average-weekend',
      count: weekendRows.length,
    },
  ];
}
