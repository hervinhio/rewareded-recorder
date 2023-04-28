import Button, { ButtonGroup } from '@atlaskit/button';
import EmptyState from '@atlaskit/empty-state';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { getPublisherName } from '../../content-panel/util';
import { Publisher } from '../../types';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import * as xlsx from 'xlsx';
import { getLastSixMonths } from '../../utils';
import { Link } from 'react-router-dom';
import { Fragment } from 'react';
import { token } from '@atlaskit/tokens';

interface Props {
  publishers: Publisher[];
  mode: 'missing' | 'regular' | 'inactive';
  onHide: () => void;
}

export const PublishersListDialog = (props: Props) => {
  return (
    <Modal shouldCloseOnEscapePress={true}>
      <ModalTransition>
        <ModalHeader>
          <ModalTitle>
            {props.mode === 'regular' && (
              <span>Proclamateurs ayant rapporté</span>
            )}
            {props.mode === 'missing' && (
              <span>Proclamateurs manquant des rapports</span>
            )}
            {props.mode === 'inactive' && <span>Proclamateurs inactifs</span>}
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          {props.publishers.length === 0
            ? renderEmptyState()
            : renderPublishers(props)}
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button appearance="subtle" onClick={props.onHide}>
              Fermer
            </Button>
            {props.mode === 'missing' && (
              <Button
                appearance="primary"
                onClick={() => generateAndDownloadExcelFile(props.publishers)}
                iconBefore={<DownloadIcon label="" />}
              >
                Télécharger
              </Button>
            )}
          </ButtonGroup>
        </ModalFooter>
      </ModalTransition>
    </Modal>
  );
};

const renderEmptyState = () => {
  return (
    <EmptyState header="Aucun proclamateur dans cette catégorie n'a rapporté" />
  );
};

const renderPublishers = (props: Props) => {
  return (
    <ul className="list-group">
      {props.publishers.map((publisher: Publisher, index: number) => {
        return (
          <Fragment>
            {props.mode !== 'inactive' && (
              <li className="list-group-item" style={{color: token('color.text')}}>
                {index + 1}.&nbsp;&nbsp;{getPublisherName(publisher)}
              </li>
            )}
            {props.mode === 'inactive' && (
              <span>
                {index + 1}.&nbsp;&nbsp;
                <Link
                  style={{ color: token('color.text') }}
                  to={`/groups/${publisher.groupId}/${publisher.id}`}
                >
                  <span style={{color: token('color.text')}}>{getPublisherName(publisher)}</span>
                </Link>
              </span>
            )}
          </Fragment>
        );
      })}
    </ul>
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
    `41939 - Rapports Manquants - ${month.toLocaleFullMonth()}.xlsx`
  );
};
