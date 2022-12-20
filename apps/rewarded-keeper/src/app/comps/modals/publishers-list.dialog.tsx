import Button from '@atlaskit/button';
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

interface Props {
  publishers: Publisher[];
  onHide: () => void;
}

export const PublishersListDialog = (props: Props) => {
  return (
    <Modal shouldCloseOnEscapePress={true}>
      <ModalTransition>
        <ModalHeader>
          <ModalTitle>Proclamateurs ayant rapporté</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {props.publishers.length === 0
            ? renderEmptyState()
            : renderPublishers(props)}
        </ModalBody>
        <ModalFooter>
          <Button appearance="subtle" onClick={props.onHide}>
            Fermer
          </Button>
          <Button
            appearance="primary"
            onClick={() => generateAndDownloadExcelFile(props.publishers)}
            iconBefore={<DownloadIcon label="" />}
          >
            Télécharger
          </Button>
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
          <li className="list-group-item">
            {index + 1}.&nbsp;&nbsp;{getPublisherName(publisher)}
          </li>
        );
      })}
    </ul>
  );
};

const generateAndDownloadExcelFile = (pubs: Publisher[]): void => {
  const month = getLastSixMonths()[0];
  const data = [
    ['Proclamateur', 'Groupe'],
    ...pubs.map((p, index) => [getPublisherName(p), p.groupId.replace('-', ' ')])
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
