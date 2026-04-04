import { useState } from 'react';
import { getPublisherName } from '../../content-panel/util';
import { Publisher } from '../../types';
import * as xlsx from 'xlsx';
import { getLastSixMonths } from '../../utils';
import { Link } from 'react-router-dom';
import { ReactElement } from 'react';
import {
  Button,
  Caption1,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  makeStyles,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  tokens,
} from '@fluentui/react-components';
import {
  ArrowDownloadFilled,
  CaretLeftFilled,
  CaretRightFilled,
} from '@fluentui/react-icons';
import { List, ListItem } from '@fluentui/react-list-preview';
import { EmptyState } from '../empty-state';

interface Props {
  children?: ReactElement;
  publishers: Publisher[];
  mode: 'missing' | 'regular' | 'inactive';
  onHide?: () => void;
}

const PAGE_SIZE = 10;

const useStyles = makeStyles({
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  listItem: {
    padding: '8px 12px',
    borderRadius: tokens.borderRadiusMedium,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
});

export const PublishersListDialog = (props: Props) => {
  const [page, setPage] = useState(0);
  const pagesCount = Math.ceil(props.publishers.length / PAGE_SIZE);
  const pagedPublishers = props.publishers.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );
  const styles = useStyles();

  return (
    <Dialog
      onOpenChange={(_, data) => {
        if (data.open) setPage(0);
      }}>
      <DialogTrigger disableButtonEnhancement>{props.children}</DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            {props.mode === 'regular' && (
              <span>Proclamateurs ayant rapporté</span>
            )}
            {props.mode === 'missing' && (
              <span>Proclamateurs manquant des rapports</span>
            )}
            {props.mode === 'inactive' && <span>Proclamateurs inactifs</span>}
          </DialogTitle>
          <DialogContent>
            {props.publishers.length === 0 ? (
              <EmptyState header="Aucun proclamateur dans cette catégorie n'a rapporté" />
            ) : (
              <>
                <List>
                  {pagedPublishers.map(
                    (publisher: Publisher, index: number) => (
                      <ListItem key={publisher.id} className={styles.listItem}>
                        {page * PAGE_SIZE + index + 1}.&nbsp;&nbsp;
                        <Link
                          style={{
                            color: tokens.colorNeutralForeground2Link,
                          }}
                          to={`/groups/${publisher.groupId}/${publisher.id}`}>
                          <span
                            style={{
                              color: tokens.colorNeutralForeground2Link,
                            }}>
                            {getPublisherName(publisher)}
                          </span>
                        </Link>
                      </ListItem>
                    ),
                  )}
                </List>
                {pagesCount > 1 && (
                  <div className={styles.pagination}>
                    <div>
                      <Button
                        appearance="subtle"
                        icon={<CaretLeftFilled />}
                        disabled={page <= 0}
                        onClick={() => setPage(page - 1)}
                      />
                      <Button
                        appearance="subtle"
                        icon={<CaretRightFilled />}
                        disabled={page >= pagesCount - 1}
                        onClick={() => setPage(page + 1)}
                      />
                    </div>
                    <Caption1>
                      {page + 1} / {pagesCount}
                    </Caption1>
                  </div>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Fermer</Button>
            </DialogTrigger>
            {props.mode === 'missing' && (
              <Button
                appearance="primary"
                onClick={() => generateAndDownloadExcelFile(props.publishers)}
                icon={<ArrowDownloadFilled />}>
                Télécharger
              </Button>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

const generateAndDownloadExcelFile = (pubs: Publisher[]): void => {
  const month = getLastSixMonths()[0];
  const data = [
    ['Proclamateur', 'Groupe'],
    ...pubs.map((p, index) => [
      getPublisherName(p),
      p.groupId.replace('-', ' '),
    ]),
  ];

  const workbook = xlsx.utils.book_new(),
    worksheet = xlsx.utils.aoa_to_sheet(data);
  workbook.SheetNames.push(month.toLocaleFullMonth());
  workbook.Sheets[month.toLocaleFullMonth()] = worksheet;
  xlsx.writeFile(
    workbook,
    `41939 - Rapports Manquants - ${month.toLocaleFullMonth()}.xlsx`,
  );
};
