import { useEffect, useState } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Publishers } from '../data/publishers';
import { Events, Group, Publisher, Repport } from '../types';
import {
  borderRadius as getBorderRadius,
  gridSize as getGridSize,
} from '@atlaskit/theme/constants';
import { token } from '@atlaskit/tokens';
import { N20, N200 } from '@atlaskit/theme/colors';
import { PublisherView } from './publisher-view';
import { getPublisherName } from './util';
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import { useParams, useLocation } from 'react-router-dom';
import { Groups, Repports } from '../data';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import { getLastSixMonths } from '../utils';
import Banner from '@atlaskit/banner';
import SectionMessage from '@atlaskit/section-message';

const borderRadius = getBorderRadius();
const gridSize = getGridSize();
const style = {
  display: 'flex',
  marginTop: `${gridSize * 2}px`,
  marginBottom: `${gridSize}px`,
  padding: `${gridSize * 4}px`,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  flexGrow: 1,
  backgroundColor: token('color.background.neutral', N20),
  borderRadius: `${borderRadius}px`,
  color: token('color.text.subtlest', N200),
};

export const PublishersList = () => {
  const months = getLastSixMonths();
  const defaultMonth = months[0];
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(
    null
  );
  const [group, setGroup] = useState<Group | null>(null);
  const [repports, setRepports] = useState<Repport[]>([]);
  const [counter, setCounter] = useState(0);
  const { groupId } = useParams();
  const location = useLocation();

  useEffect(() => {
    Repports.byMonthId(defaultMonth.getKey()).then(
      (reps) => setRepports(reps),
      (error) => console.log(error)
    );
  }, [location.hash, counter]);

  useEffect(() => {
    setSelectedPublisher(null);
    Publishers.byGroupId(groupId || 'unafiliated').then(
      (pubs) => setPublishers(pubs),
      (err) => {
        console.error(err);
      }
    );
  }, [groupId, counter, location.hash]);

  useEffect(() => {
    Groups.getOne(groupId || 'unafiliated').then(
      (group) => setGroup(group),
      (err) => {
        console.error(err);
      }
    );
  }, [groupId, location.hash]);

  useEffect(() => {
    const onPublisherUpdate = () => setCounter(counter + 1);
    Events.on('publisher_updated', onPublisherUpdate);

    return () => Events.off('publisher_updated', onPublisherUpdate);
  });

  const publishersWithMissingRepports = publishers.filter((publisher) => {
    return !repports.find((repport) => repport.publisherId === publisher.id);
  });

  const thereAreMissingRepports = publishersWithMissingRepports.length > 0;

  return (
    <div style={{ width: '100%' }}>
      <Breadcrumbs>
        <BreadcrumbsItem
          text={group?.name || 'Non affilié'}
          href="avascript:void(0)"
          key={group?.id}
          onClick={() => {
            setSelectedPublisher(null);
            setCounter(counter + 1);
          }}
        />
        {selectedPublisher && (
          <BreadcrumbsItem
            href="avascript:void(0)"
            text={getPublisherName(selectedPublisher)}
            key={selectedPublisher.id}
          />
        )}
      </Breadcrumbs>
      {!selectedPublisher && thereAreMissingRepports && (
        <SectionMessage
          title={`Certains rapports manquent (${publishersWithMissingRepports.length})`}
          appearance="warning"
        >
          <p>
            Veuillez contacter individuellement ceux de votre groupe qui n'ont
            pas encore remis leur rapports.
          </p>
        </SectionMessage>
      )}
      {!selectedPublisher && !thereAreMissingRepports && (
        <SectionMessage
          title="Tous les rapports ont été remis"
          appearance="success"
        >
          <p>
            Tous les rapports ont été remis et serons bientôt envoyés au béthel.
          </p>
        </SectionMessage>
      )}
      <div style={style as React.CSSProperties}>
        {selectedPublisher
          ? renderPublisherView(selectedPublisher, setSelectedPublisher, () =>
              setCounter(counter + 1)
            )
          : renderPublishersList(publishers, setSelectedPublisher, repports)}
      </div>
    </div>
  );
};

const renderPublisherView = (
  publisher: Publisher,
  setSelectedPublisher: (publisher: Publisher | null) => void,
  increaseCounter: () => void
) => {
  return (
    <PublisherView
      publisher={publisher}
      onHide={() => {
        setSelectedPublisher(null);
        increaseCounter();
      }}
    />
  );
};

const renderPublishersList = (
  publishers: Publisher[],
  setSelectedPublisher: (publisher: Publisher) => void,
  repports: Repport[]
) => {
  return (
    <ListGroup style={{ width: '100%' }}>
      <h4>Proclamateurs</h4>
      {publishers.map((publisher: Publisher, index: number) => {
        const publisherHasEmittedReport = repports.some(
          (repport) => repport.publisherId === publisher.id
        );

        return (
          <ListGroupItem
            key={index}
            style={{
              cursor: 'pointer',
              backgroundColor: !publisherHasEmittedReport
                ? '#fff8e1'
                : undefined,
            }}
            onClick={() => setSelectedPublisher(publisher)}
          >
            <div className="publisher-name-group">
              <span className="icons">
                {!publisherHasEmittedReport && (
                  <WarningIcon
                    label=""
                    primaryColor="#f9a825"
                    secondaryColor="#fff"
                  />
                )}
                {publisherHasEmittedReport && (
                  <CheckCircleIcon
                    label=""
                    primaryColor="#00bfa5"
                    secondaryColor="#fff"
                  />
                )}
              </span>
              <span>{getPublisherName(publisher)}</span>
            </div>
          </ListGroupItem>
        );
      })}
    </ListGroup>
  );
};
