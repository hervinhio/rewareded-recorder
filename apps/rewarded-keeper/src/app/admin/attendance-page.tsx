import Page, { Grid, GridColumn } from '@atlaskit/page';
import { Accordion, ButtonGroup } from 'react-bootstrap';
import { getLastSixMonths } from '../utils';
import { Month } from '../types';
import { DynamicTableStateless } from '@atlaskit/dynamic-table';
import { IconButton } from '@atlaskit/atlassian-navigation';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import { R300 } from '@atlaskit/theme/colors';
import { RowType } from '@atlaskit/dynamic-table/dist/types/types';
import {
  AttendanceRecord,
  AttendanceRecords,
  GlobalState,
  store,
} from '../data';
import { useDispatch, useSelector } from 'react-redux';
import { AttendanceReportModal, ConfirmationModal } from '../comps';
import { isEqual } from 'lodash';
import { Timestamp } from 'firebase/firestore';

const head = {
  cells: [
    {
      key: 'date',
      content: 'Date',
      isSortable: true,
    },
    {
      key: 'inPerson',
      content: 'Présentiel',
      isSortable: false,
    },
    {
      key: 'zoom',
      content: 'Zoom',
      isSortable: false,
    },
    {
      key: 'total',
      content: 'Total',
      isSortable: false,
    },
    {
      key: 'actions',
      content: 'Actions',
      isSortable: false,
    },
  ],
};

export function AttendancePage() {
  const now = new Date();
  const months = [
    Month.fromKey(`${now.getFullYear()}#${now.getMonth()}`),
    ...getLastSixMonths(),
  ];
  const { data, recordUnderEdit, recordPendingDeletion } = useSelector(
    (state: GlobalState) => ({
      data: state.attendanceRecords.records,
      recordPendingDeletion: state.attendanceRecords.forDeletion,
      recordUnderEdit: state.attendanceRecords.forModification,
    }),
    isEqual
  );
  const dispatch = useDispatch();

  return (
    <Page>
      <Grid layout="fluid" spacing="comfortable">
        <GridColumn medium={12}>
          <h5>Assitance</h5>
          <Accordion defaultActiveKey="0">
            {months.map((month, id) => (
              <Accordion.Item eventKey={`${id}`}>
                <Accordion.Header>{month.toLocaleFullMonth()}</Accordion.Header>
                <Accordion.Body>
                  <DynamicTableStateless
                    head={head}
                    rows={dataToRows(
                      data.filter((r) => r.monthId === month.getKey())
                    )}
                    emptyView={<h3>Aucune donnée enregistrée pour ce mois</h3>}
                  />
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
          {!!recordPendingDeletion && (
            <ConfirmationModal
              title="Supprimer un rapport d'assitance"
              risky={true}
              onClose={async (confirmed) => {
                if (confirmed) {
                  await AttendanceRecords.delete(recordPendingDeletion);
                } else {
                  dispatch(
                    AttendanceRecords.slice.actions.setForDeletion(undefined)
                  );
                }
              }}
            >
              Êtes-vous sur de vouloir supprimer ce rapport d'assistance, vous
              ne pourrez le recouvrer.
            </ConfirmationModal>
          )}
          {!!recordUnderEdit && (
            <AttendanceReportModal
              show={!!recordUnderEdit}
              record={recordUnderEdit}
              mode="edit"
              onHide={() => {
                dispatch(
                  AttendanceRecords.slice.actions.setForModification(undefined)
                );
              }}
            />
          )}
        </GridColumn>
      </Grid>
    </Page>
  );
}

function dataToRows(data: AttendanceRecord[]): RowType[] {
  if (!data.length) return [];
  const now = new Date();
  now.setHours(1, 0, 0, 0);
  const allRows: AttendanceRecord[] = [
    ...data,
    {
      date: Timestamp.fromDate(now),
      inPerson:
        data.map((r) => r.inPerson).reduce((p, c) => p + c) / data.length,
      zoom: data.map((r) => r.zoom).reduce((p, c) => p + c) / data.length,
      monthId: data[0].monthId,
      id: 'average',
    },
  ];
  return allRows.map((row, index) => ({
    key: `row-${index}-${row.inPerson}`,
    isHighlighted: row.id === 'average',
    cells: [
      {
        key: `cell-${index}-${row.inPerson}-date`,
        content: (
          <span>
            {row.id === 'average'
              ? 'Totaux'
              : row.date.toDate().toLocaleDateString()}
          </span>
        ),
      },
      {
        key: `cell-${index}-${row.inPerson}-inPerson`,
        content: (
          <span>
            {row.id === 'average' ? row.inPerson.toFixed(2) : row.inPerson}
          </span>
        ),
      },
      {
        key: `cell-${index}-${row.inPerson}-zoom`,
        content: (
          <span>{row.id === 'average' ? row.zoom.toFixed(2) : row.zoom}</span>
        ),
      },
      {
        key: `cell-${index}-${row.inPerson}-total`,
        content: (
          <span>
            {row.id === 'average'
              ? (row.inPerson + row.zoom).toFixed(2)
              : row.inPerson + row.zoom}
          </span>
        ),
      },
      {
        key: `cell-${index}-${row.inPerson}-inPerson`,
        content:
          row.id === 'average' ? null : (
            <ButtonGroup>
              <IconButton
                icon={<TrashIcon label="" primaryColor={R300} />}
                tooltip="Supprimer cet enregistrement"
                onClick={() =>
                  store.dispatch(
                    AttendanceRecords.slice.actions.setForDeletion(row)
                  )
                }
              />
              <IconButton
                icon={<EditFilledIcon label="" />}
                tooltip="Modifier cet enregistrement"
                onClick={() =>
                  store.dispatch(
                    AttendanceRecords.slice.actions.setForModification(row)
                  )
                }
              />
            </ButtonGroup>
          ),
      },
    ],
  }));
}
