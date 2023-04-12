import Page from '@atlaskit/page';
import PageHeader from '@atlaskit/page-header';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../data';
import { Publisher } from '../types';
import EmailIcon from '@atlaskit/icon/glyph/email';
import MobileIcon from '@atlaskit/icon/glyph/mobile';
import VidHangUpIcon from '@atlaskit/icon/glyph/vid-hang-up';
import LocationIcon from '@atlaskit/icon/glyph/location';
import { getPublisherName } from '../content-panel/util';
import { N300 } from '@atlaskit/theme/colors';
import Button, { ButtonGroup, LoadingButton } from '@atlaskit/button';
import { useState } from 'react';
import FilterIcon from '@atlaskit/icon/glyph/filter';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import * as xlsx from 'xlsx';

export function ContactsPage() {
  const [showContactLessContacts, setShowContactlessContacts] = useState(false);
  const publishers = useSelector((state: GlobalState) => {
    return showContactLessContacts
      ? state.publishers.publishers.filter((p) => !p.address || !p.telephone)
      : state.publishers.publishers;
  }, shallowEqual);

  return (
    <Page>
      <PageHeader
        actions={
          <ButtonGroup>
            <Button
              iconBefore={<FilterIcon label=""/>}
              isSelected={showContactLessContacts}
              onClick={() => setShowContactlessContacts(!showContactLessContacts)}
            >
              Sans info
            </Button>
            <LoadingButton
              iconBefore={<DownloadIcon label=""/>}
              appearance="primary"
              onClick={() => generateAndDownloadContactsFile(publishers)}
            >
              Télécharger
            </LoadingButton>
          </ButtonGroup>
        }
      >
        <h6>Liste des proclamateurs manquant des informations de contact</h6>
      </PageHeader>
      <ListGroup style={{ width: '100%' }}>
        {publishers.map((publisher: Publisher) => {
          return (
            <ListGroupItem
              key={publisher.id}
              style={{
                cursor: 'pointer',
                backgroundColor: getRowBgColor(publisher),
              }}
            >
              <div className="publisher-name-group">
                <span className="publisher-name">
                  {getPublisherName(publisher)}
                </span>
                <span className="flex-expand"></span>
                {publisher.address && (
                  <LocationIcon label="" primaryColor={N300} />
                )}
                {publisher.emailAddress && (
                  <EmailIcon label="" primaryColor={N300} />
                )}
                {publisher.emergencyPhone && (
                  <VidHangUpIcon label="" primaryColor={N300} />
                )}
                {publisher.telephone && (
                  <MobileIcon label="" primaryColor={N300} />
                )}
              </div>
            </ListGroupItem>
          );
        })}
      </ListGroup>
    </Page>
  );
}

const getRowBgColor = (publisher: Publisher) => {
  if (!publisher.telephone || !publisher.address) {
    return '#fff8e1';
  }

  return undefined;
};


const generateAndDownloadContactsFile = (publishers: Publisher[]) => {
  const data = [
    ['Proclamateur', 'Téléphone', 'Téléphone secours', 'Addresse', 'Addresse email'],
    ...publishers.map((p) => [
      getPublisherName(p),
      p.telephone || '',
      p.emergencyPhone || '',
      p.address || '',
      p.emailAddress  || '',
    ]),
  ];

  const workbook = xlsx.utils.book_new(),
    worksheet = xlsx.utils.aoa_to_sheet(data);
  workbook.SheetNames.push('Contacts');
  workbook.Sheets['Contacts'] = worksheet;
  xlsx.writeFile(
    workbook,
    `41939 - Contacts.xlsx`
  );
}
