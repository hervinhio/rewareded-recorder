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
import { Link } from 'react-router-dom';
import { token } from '@atlaskit/tokens';

const contactListItemStyle = {
  color: token('color.text'),
  cursor: 'pointer',
  backgroundColor: token('color.background.neutral'),
};

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
              iconBefore={<FilterIcon label="" />}
              isSelected={showContactLessContacts}
              appearance="subtle"
              onClick={() =>
                setShowContactlessContacts(!showContactLessContacts)
              }
            >
              Sans info
            </Button>
            <LoadingButton
              iconBefore={<DownloadIcon label="" />}
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
                ...contactListItemStyle,
                backgroundColor: getRowBgColor(publisher),
              }}
            >
              <div className="publisher-name-group">
                <span className="publisher-name">
                  <Link
                    style={{ color: token('color.text') }}
                    to={`/groups/${publisher.groupId}/${publisher.id}`}
                  >
                    {getPublisherName(publisher)}
                  </Link>
                </span>
                <span className="flex-expand"></span>
                {publisher.address && (
                  <LocationIcon label="" primaryColor={token('color.icon')} />
                )}
                {publisher.emailAddress && (
                  <EmailIcon label="" primaryColor={token('color.icon')} />
                )}
                {publisher.emergencyPhone && (
                  <VidHangUpIcon label="" primaryColor={token('color.icon')} />
                )}
                {publisher.telephone && (
                  <MobileIcon label="" primaryColor={token('color.icon')} />
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
    return token('color.background.warning');
  }

  return token('color.background.neutral');
};

const generateAndDownloadContactsFile = (publishers: Publisher[]) => {
  const data = [
    [
      'Proclamateur',
      'Téléphone',
      'Téléphone secours',
      'Addresse',
      'Addresse email',
    ],
    ...publishers.map((p) => [
      getPublisherName(p),
      p.telephone || '',
      p.emergencyPhone || '',
      p.address || '',
      p.emailAddress || '',
    ]),
  ];

  const workbook = xlsx.utils.book_new(),
    worksheet = xlsx.utils.aoa_to_sheet(data);
  workbook.SheetNames.push('Contacts');
  workbook.Sheets['Contacts'] = worksheet;
  xlsx.writeFile(workbook, `41939 - Contacts.xlsx`);
};
