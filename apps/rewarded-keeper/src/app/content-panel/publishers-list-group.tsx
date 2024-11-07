import './publishers-list-group.scss';
import {
  CSSProperties,
  ChangeEvent,
  Fragment,
  useCallback,
  useState,
} from 'react';
import { Checkbox } from '@atlaskit/checkbox';
import cloneDeep from 'lodash/cloneDeep';
import { getPublisherName } from './util';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { Link } from 'react-router-dom';
import { Publisher, PublisherActivityStatus, Report } from '../types';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, Publishers } from '../data';
import { uniqueId } from 'lodash';
import { SearchAndAddPublisher } from './search-or-add-publisher';
import EmailIcon from '@atlaskit/icon/glyph/email';
import MobileIcon from '@atlaskit/icon/glyph/mobile';
import VidHangUpIcon from '@atlaskit/icon/glyph/vid-hang-up';
import LocationIcon from '@atlaskit/icon/glyph/location';
import { filterNonInactiveAndNonPioneersOut } from '../utils';
import { PublishersListDialog } from '../comps';
import { borderRadius as getBorderRadius } from '@atlaskit/theme/constants';
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
  CheckmarkCircleFilled,
  ErrorCircle24Filled,
  ErrorCircleFilled,
  LocationFilled,
  MailFilled,
  PersonCallFilled,
  PersonFilled,
  PhoneFilled,
  Warning24Filled,
  WarningFilled,
} from '@fluentui/react-icons';
import { darkTheme, lightTheme, themeMode } from '../theme';
import { token } from '@atlaskit/tokens';

const borderRadius = getBorderRadius();
const tokens = themeToTokensObject(
  themeMode === 'light' ? lightTheme : darkTheme,
);
const linkStyle = {
  textDecoration: 'none',
  color: token('color.text'),
} as CSSProperties;
const publisherListItemStyle = {
  color: token('color.text'),
  cursor: 'pointer',
  backgroundColor: token('color.background.neutral'),
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
  const [showInactivesDialog, setShowInactivesDialog] = useState(false);
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
      idealWidth: 50,
      minWidth: 50,
    },
    name: {
      idealWidth: 250,
      minWidth: 50,
      defaultWidth: 250,
    },
    contact: {
      minWidth: 50,
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
      onClick: (e: React.MouseEvent) => toggleRow(e, row.rowId),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === ' ') {
          e.preventDefault();
          toggleRow(e, row.rowId);
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
        e.preventDefault();
      }
    },
    [toggleAllRows],
  );

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
            onHide={() => setShowInactivesDialog(false)}>
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
                      {getPublisherName(item)}
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
