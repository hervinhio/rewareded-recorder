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
import Button from '@atlaskit/button';
import { useState } from 'react';

export function ContactsPage() {
  const [showContactLessContacts, setShowContactlessContacts] = useState(false);
  const publishers = useSelector((state: GlobalState) => {
    return showContactLessContacts
        ? state.publishers.publishers.filter(
            (p) => !p.address || !p.telephone || !p.emergencyPhone
            )
        : state.publishers.publishers;
  }, shallowEqual);

  return (
    <Page>
      <PageHeader
        actions={
          <Button
            isSelected={showContactLessContacts}
            onClick={() => setShowContactlessContacts(!showContactLessContacts)}
          >
            Sans info
          </Button>
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
