import { getPublisherName } from '../../content-panel/util';
import { Publisher } from '../../types';
import * as xlsx from 'xlsx';
import { getLastSixMonths } from '../../utils';
import { Link } from 'react-router-dom';
import { ReactElement } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  themeToTokensObject,
} from '@fluentui/react-components';
import { ArrowDownloadFilled } from '@fluentui/react-icons';
import { List, ListItem } from '@fluentui/react-list-preview';
import { EmptyState } from '../empty-state';
import { darkTheme, lightTheme, themeMode } from '../../theme';

interface Props {
  children?: ReactElement;
  publishers: Publisher[];
  mode: 'missing' | 'regular' | 'inactive';
  onHide?: () => void;
}

const tokens = themeToTokensObject(
  themeMode === 'light' ? lightTheme : darkTheme,
);

export const PublishersListDialog = (props: Props) => {
  return (
    <Dialog>
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
            {props.publishers.length === 0
              ? renderEmptyState()
              : renderPublishers(props)}
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

const renderEmptyState = () => {
  return (
    <EmptyState header="Aucun proclamateur dans cette catégorie n'a rapporté" />
  );
};

const renderPublishers = (props: Props) => {
  return (
    <List>
      {props.publishers.map((publisher: Publisher, index: number) => {
        return (
          <ListItem>
            {index + 1}.&nbsp;&nbsp;
            <Link
              style={{
                color: tokens.colorNeutralStroke1,
              }}
              to={`/groups/${publisher.groupId}/${publisher.id}`}>
              <span style={{ color: tokens.colorNeutralStroke1 }}>
                {getPublisherName(publisher)}
              </span>
            </Link>
          </ListItem>
        );
      })}
    </List>
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
