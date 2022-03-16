import { useEffect, useState } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Publishers } from '../data/publishers';
import { Group, Publisher, Repport } from '../types';
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
import { getLastSixMonths } from '../utils';
import Banner from '@atlaskit/banner';

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
    Repports.byMonthId(defaultMonth.getKey())
      .then(
        (reps) => setRepports(reps),
        (error) => console.log(error)
      );
  }, [location.hash]);

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

  const publishersWithMissingRepports = publishers.filter(publisher => {
    return !repports.find(repport => repport.publisherId === publisher.id);
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
      {!selectedPublisher && thereAreMissingRepports && <Banner
            appearance="warning"
            icon={<WarningIcon label="" secondaryColor="inherit" />}
            isOpen
          >
            Certains rapports manquent ({ publishersWithMissingRepports.length })
      </Banner>}
      <div style={style as React.CSSProperties}>
        {selectedPublisher
          ? renderPublisherView(selectedPublisher, setSelectedPublisher, () =>
              setCounter(counter + 1)
            )
          : renderPublishersList(publishers, setSelectedPublisher)}
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
  setSelectedPublisher: (publisher: Publisher) => void
) => {
  return (
    <ListGroup style={{ width: '100%' }}>
      <h4>Proclamateurs</h4>
      {publishers.map((publisher: Publisher, index: number) => {
        return (
          <ListGroupItem
            key={index}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedPublisher(publisher)}
          >
            {getPublisherName(publisher)}
          </ListGroupItem>
        );
      })}
    </ListGroup>
  );
};
