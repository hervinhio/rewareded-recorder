import './publishers-list-group.scss';
import {
  CSSProperties,
  Fragment,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { getPublisherName } from './util';
import { Link } from 'react-router-dom';
import { Publisher, PublisherActivityStatus, Report } from '../types';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../data';
import { filterNonInactiveAndNonPioneersOut } from '../utils';
import { PublishersListDialog } from '../comps';
import {
  Button,
  createTableColumn,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableColumnDefinition,
  TableColumnSizingOptions,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSelectionCell,
  themeToTokensObject,
  Tooltip,
  useTableColumnSizing_unstable,
  useTableFeatures,
  useTableSelection,
} from '@fluentui/react-components';
import {
  CheckmarkCircle24Filled,
  ErrorCircle24Filled,
  LocationFilled,
  MailFilled,
  PersonCallFilled,
  PersonFilled,
  PhoneFilled,
  Warning24Filled,
} from '@fluentui/react-icons';
import { darkTheme, lightTheme, themeMode } from '../theme';

const tokens = themeToTokensObject(
  themeMode === 'light' ? lightTheme : darkTheme,
);

const linkStyle = {
  textDecoration: 'none',
  color: tokens.colorNeutralStroke1,
} as CSSProperties;
const publisherListItemStyle = {
  color: tokens.colorNeutralStroke1,
  cursor: 'pointer',
  backgroundColor: tokens.colorNeutralBackground1,
};

interface Props {
  onPublishersSelected: (publishers: string[]) => void;
  selectedPublishersIds: string[];
  groupId?: string;
}

const columnsDef: TableColumnDefinition<Publisher>[] = [
  createTableColumn<Publisher>({
    columnId: 'state',
    renderHeaderCell: () => <>Etat</>,
  }),
  createTableColumn<Publisher>({
    columnId: 'name',
    renderHeaderCell: () => <>Nom</>,
  }),
  createTableColumn<Publisher>({
    columnId: 'contact',
    renderHeaderCell: () => <>Contact</>,
  }),
];

export function PublishersListGroup(props: Props) {
  const { publishers, reports, inactives } = useSelector(
    (state: GlobalState) => {
      const pubs =
        state.publishers.byGroup[props.groupId || 'unafiliated'] || [];
      return {
        publishers: pubs
          .filter((p: Publisher) =>
            filterNonInactiveAndNonPioneersOut(
              p,
              props.groupId || 'unafiliated',
            ),
          )
          .sort((a: Publisher, b: Publisher) =>
            sortPublishers(a, b, state.reports.current || []),
          ),
        inactives:
          props.groupId !== 'inactives'
            ? pubs.filter(
                (p) => p.activityStatus === PublisherActivityStatus.Inactive,
              )
            : [],
        reports: state.reports.current,
      };
    },
    shallowEqual,
  );

  const [columnSizingOptions] = useState<TableColumnSizingOptions>({
    state: {
      idealWidth: 40,
      minWidth: 40,
    },
    name: {
      idealWidth: 250,
      minWidth: 50,
      defaultWidth: 200,
    },
    contact: {
      idealWidth: 50,
      defaultWidth: 50,
    },
  });

  const {
    getRows,
    columnSizing_unstable,
    tableRef,
    selection: {
      allRowsSelected,
      someRowsSelected,
      toggleAllRows,
      toggleRow,
      isRowSelected,
    },
  } = useTableFeatures(
    {
      columns: columnsDef,
      items: publishers,
    },
    [
      useTableColumnSizing_unstable({ columnSizingOptions }),
      useTableSelection({ selectionMode: 'multiselect' }),
    ],
  );
  const rows = getRows((row) => {
    const selected = isRowSelected(row.rowId);
    return {
      ...row,
      onClick: (e: React.MouseEvent) => {
        toggleRow(e, row.rowId);
        console.log('Inside the onClick', selected);

        if (row.item.id && !selected) {
          props.onPublishersSelected([
            ...props.selectedPublishersIds,
            row.item.id,
          ]);
        } else if (row.item.id && selected) {
          props.onPublishersSelected(
            props.selectedPublishersIds.filter((id) => id !== row.item.id),
          );
        }
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === ' ') {
          e.preventDefault();
          toggleRow(e, row.rowId);

          if (row.item.id && !selected) {
            props.onPublishersSelected([
              ...props.selectedPublishersIds,
              row.item.id,
            ]);
          } else if (row.item.id && selected) {
            props.onPublishersSelected(
              props.selectedPublishersIds.filter((id) => id !== row.item.id),
            );
          }
        }
      },
      selected,
      appearance: selected ? ('brand' as const) : ('none' as const),
    };
  });
  const toggleAllKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === ' ') {
        toggleAllRows(e);
        props.onPublishersSelected(
          publishers.map((p) => p.id).filter((id) => !!id) as string[],
        );
        e.preventDefault();
      }
    },
    [toggleAllRows],
  );

  useEffect(() => {
    if (allRowsSelected) {
      props.onPublishersSelected(
        publishers.map((p) => p.id).filter((id) => !!id) as string[],
      );
    } else {
      props.onPublishersSelected([]);
    }
  }, [allRowsSelected]);

  return (
    <Fragment>
      {inactives.length > 0 && (
        <div
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            width: 'fit-content',
            ...publisherListItemStyle,
          }}>
          <PublishersListDialog
            publishers={inactives}
            mode="inactive"
            onHide={() => {
              /* Do nothing */
            }}>
            <Button>{inactives.length} Inactifs</Button>
          </PublishersListDialog>
        </div>
      )}
      <Table
        {...columnSizing_unstable.getTableProps()}
        ref={tableRef}
        style={{ minWidth: '100%', width: '100%' }}>
        <TableHeader>
          <TableSelectionCell
            checked={
              allRowsSelected ? true : someRowsSelected ? 'mixed' : false
            }
            onClick={toggleAllRows}
            onKeyDown={toggleAllKeydown}
            checkboxIndicator={{ 'aria-label': 'Select all rows ' }}
          />
          {columnsDef.map((column) => (
            <TableHeaderCell
              key={column.columnId}
              {...columnSizing_unstable.getTableHeaderCellProps(
                column.columnId,
              )}>
              {column.renderHeaderCell()}
            </TableHeaderCell>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map(({ item, selected, onClick, onKeyDown, appearance }) => {
            const hasReported = reports.some(
              (report) => report.publisherId === item.id,
            );
            return (
              <TableRow
                onClick={onClick}
                onKeyDown={onKeyDown}
                aria-selected={selected}
                appearance={appearance}
                id={item.id}
                style={{ backgroundColor: getRowBgColor(hasReported, item) }}>
                <TableSelectionCell
                  checked={selected}
                  checkboxIndicator={{ 'aria-label': 'Select row' }}
                />
                <TableCell
                  {...columnSizing_unstable.getTableCellProps('state')}>
                  <TableCellLayout truncate>
                    <PublisherRowIcon
                      hasReported={hasReported}
                      publisher={item}
                      key={item.id}
                    />
                  </TableCellLayout>
                </TableCell>
                <TableCell {...columnSizing_unstable.getTableCellProps('name')}>
                  <TableCellLayout truncate media={<PersonFilled />}>
                    <Link
                      to={`/groups/${item.groupId}/${item.id}`}
                      replace={true}
                      style={linkStyle}>
                      {getPublisherName(item, true)}
                    </Link>
                  </TableCellLayout>
                </TableCell>
                <TableCell
                  {...columnSizing_unstable.getTableCellProps('contact')}>
                  <TableCellLayout truncate>
                    <PublisherContactIcons publisher={item} />
                  </TableCellLayout>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Fragment>
  );
}

const PublisherContactIcons = ({ publisher }: { publisher: Publisher }) => (
  <div>
    {publisher.address && <LocationFilled />}
    {publisher.emailAddress && <MailFilled />}
    {publisher.emergencyPhone && <PersonCallFilled />}
    {publisher.telephone && <PhoneFilled />}
  </div>
);

const getRowBgColor = (hasReported: boolean, publisher: Publisher) => {
  if (publisher.activityStatus === PublisherActivityStatus.Inactive) {
    return tokens.colorStatusDangerBackground1;
  } else if (!hasReported) {
    return tokens.colorStatusWarningBackground1;
  }

  return tokens.colorNeutralBackground1;
};

const PublisherRowIcon = ({
  hasReported,
  publisher,
}: {
  hasReported: boolean;
  publisher: Publisher;
}) => {
  if (publisher.activityStatus === PublisherActivityStatus.Inactive) {
    return (
      <Tooltip content="Ce proclamateur est inactif" relationship="description">
        <ErrorCircle24Filled color={tokens.colorStatusDangerForeground1} />
      </Tooltip>
    );
  }

  return (
    <>
      {!hasReported && (
        <Tooltip
          content="N'a pas de rapport pour le mois écolé"
          relationship="description">
          <Warning24Filled color={tokens.colorStatusWarningForeground1} />
        </Tooltip>
      )}
      {hasReported && (
        <Tooltip
          content="A rapporté pour le mois écoulé"
          relationship="description">
          <CheckmarkCircle24Filled
            color={tokens.colorStatusSuccessForeground1}
          />
        </Tooltip>
      )}
    </>
  );
};

function sortPublishers(a: Publisher, b: Publisher, reports: Report[]): 1 | -1 {
  const pubAHasReport = reports.some((report) => report.publisherId === a.id);
  const pubBHasReport = reports.some((report) => report.publisherId === b.id);

  if (pubAHasReport && !pubBHasReport) return 1;
  if (pubBHasReport && !pubAHasReport) return -1;
  return getPublisherName(a) >= getPublisherName(b) ? 1 : -1;
}
