import {
  createTableColumn,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  InfoLabel,
  makeStyles,
  TableCellLayout,
  TableColumnDefinition,
  themeToTokensObject,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
} from '@fluentui/react-components';
import { isSpecialPublisher, Month, Publisher, Report } from '../types';
import {
  BookFilled,
  CalendarMonthFilled,
  CaretLeftFilled,
  CaretRightFilled,
  DeleteFilled,
  EditFilled,
  TimerFilled,
} from '@fluentui/react-icons';
import { useMemo, useState } from 'react';
import { darkTheme, lightTheme, themeMode } from '../theme';

interface Props {
  reports: Report[];
  publisher: Publisher;
  onDeleteReport: (report: Report) => void;
  onEditReport: (report: Report) => void;
}

const tokens = themeToTokensObject(
  themeMode === 'light' ? lightTheme : darkTheme,
);
const useClasses = makeStyles({
  auxiliary: {
    backgroundColor: tokens.colorBrandBackground,
    color: '#ffffff',
  },
  null: {
    backgroundColor: tokens.colorStatusWarningBackground2,
  },
  first: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralStrokeOnBrand,
  },
  inactive: {
    backgroundColor: tokens.colorStatusDangerBackground2,
  },
  average: {
    backgroundColor: tokens.colorBrandBackground2,
  },
});

export function ReportsTable(props: Props) {
  const styles = useClasses();

  function getRowClass(
    report: Report,
    publisher: Publisher,
  ): string | undefined {
    if (report.comment === 'null-report') {
      return styles.null;
    } else if (!report.active && (report.hours || 0) < 1) {
      return styles.inactive;
    } else if (
      publisher.auxilaryPionierFor?.includes(report.monthId) ||
      report.isAPReport
    ) {
      return styles.auxiliary;
    } else if (report.monthId === 'average') {
      return styles.average;
    } else if (report.isFirstReport) {
      return styles.first;
    }

    return undefined;
  }

  const columns: TableColumnDefinition<Report>[] = [
    createTableColumn<Report>({
      columnId: 'monthId',
      compare: (a, b) => {
        return a > b ? 1 : -1;
      },
      renderHeaderCell: () => {
        return 'Mois';
      },
      renderCell: (item) => {
        const month =
          item.monthId === 'average'
            ? 'Moyenne'
            : Month.fromKey(item.monthId).toLocaleFullMonth();
        return item.comment ? (
          <TableCellLayout media={<CalendarMonthFilled />}>
            <InfoLabel info={item.comment}>{month}</InfoLabel>
          </TableCellLayout>
        ) : (
          <TableCellLayout media={<CalendarMonthFilled />}>
            {month}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Report>({
      columnId: 'hours',
      compare: (a, b) => {
        return a > b ? 1 : -1;
      },
      renderHeaderCell: () => {
        return 'Heures';
      },
      renderCell: (item) => {
        return (
          <TableCellLayout media={<TimerFilled />}>
            {isSpecialPublisher(props.publisher, Month.fromKey(item.monthId))
              ? item.hours
              : 'N/A'}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Report>({
      columnId: 'courses',
      compare: (a, b) => {
        return a > b ? 1 : -1;
      },
      renderHeaderCell: () => {
        return 'Cours';
      },
      renderCell: (item) => {
        return (
          <TableCellLayout media={<BookFilled />}>
            {item.courses}
          </TableCellLayout>
        );
      },
    }),
    createTableColumn<Report>({
      columnId: 'actions',
      compare: (a, b) => {
        return a > b ? 1 : -1;
      },
      renderHeaderCell: () => {
        return 'Actions';
      },
      renderCell: (item) => {
        return (
          <TableCellLayout>
            {!item.id.startsWith('null-report') && (
              <Toolbar>
                <ToolbarGroup>
                  <ToolbarButton
                    icon={
                      <EditFilled
                        color={
                          item.isFirstReport
                            ? tokens.colorNeutralStrokeOnBrand
                            : ''
                        }
                      />
                    }
                    onClick={() => props.onEditReport(item)}
                  />
                  <ToolbarButton
                    icon={
                      <DeleteFilled
                        color={
                          item.isFirstReport
                            ? tokens.colorNeutralStrokeOnBrand
                            : ''
                        }
                      />
                    }
                    onClick={() => props.onDeleteReport(item)}
                  />
                </ToolbarGroup>
              </Toolbar>
            )}
          </TableCellLayout>
        );
      },
    }),
  ];

  const [page, setPage] = useState(0);

  const pagesCount = Math.ceil(props.reports.length / 6);

  const items = useMemo(() => {
    const lastSixReports = props.reports.slice(page * 6, page * 6 + 6);

    const averageReport: Report = {
      id: '',
      monthId: 'average',
      publisherId: props.publisher.id || '',
      active: true,
      submitted: false,
      comment: '',
      isAPReport: false,
      courses: Math.round(
        lastSixReports.map((r) => r.courses || 0).reduce((p, c) => p + c) /
          (lastSixReports.length || 1),
      ),
      hours: Math.round(
        lastSixReports.map((r) => r.hours || 0).reduce((p, c) => p + c) /
          (lastSixReports.length || 1),
      ),
      isFirstReport: false,
    };
    return [averageReport, ...lastSixReports];
  }, [page, props.reports, props.publisher.id]);

  const previousPage = () => {
    if (page <= 0) return;
    setPage(page - 1);
  };

  const nextPage = () => {
    if (page >= pagesCount - 1) return;
    setPage(page + 1);
  };

  return (
    <div>
      <DataGrid items={items} columns={columns} getRowId={(item) => item.id}>
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<Report>>
          {({ item, rowId }) => (
            <DataGridRow<Report>
              key={rowId}
              className={getRowClass(item, props.publisher)}>
              {({ renderCell }) => (
                <DataGridCell>{renderCell(item)}</DataGridCell>
              )}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>

      <div className="pagination">
        <Toolbar>
          <ToolbarGroup>
            <ToolbarButton
              icon={<CaretLeftFilled />}
              onClick={() => previousPage()}
            />
            <ToolbarButton
              icon={<CaretRightFilled />}
              onClick={() => nextPage()}
            />
          </ToolbarGroup>
        </Toolbar>
      </div>
    </div>
  );
}
