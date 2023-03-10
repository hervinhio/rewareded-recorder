import { CSSProperties, ChangeEvent } from 'react';
import { Checkbox } from '@atlaskit/checkbox';
import cloneDeep from 'lodash/cloneDeep';
import { getPublisherName } from './util';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { Link } from 'react-router-dom';
import { Publisher, PublisherActivityStatus } from '../types';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, Publishers } from '../data';
import { uniqueId } from 'lodash';
import { SearchAndAddPublisher } from './search-or-add-publisher';

const linkStyle = { textDecoration: 'none', color: '#000' } as CSSProperties;

interface Props {
  onPublishersSelected: (publishers: string[]) => void;
  selectedPublishersIds: string[];
  groupId?: string;
}

export function PublishersListGroup(props: Props) {
  const { publishers, reports } = useSelector(
    (state: GlobalState) => ({
      publishers:
        state.publishers.byGroup[props.groupId || 'unafiliated'] || [],
      reports: state.reports.current,
    }),
    shallowEqual
  );

  return (
    <ListGroup style={{ width: '100%' }}>
      <h4>Proclamateurs</h4>
      <ListGroupItem key={uniqueId()}>
        <SearchAndAddPublisher onAdd={Publishers.save} />
      </ListGroupItem>
      {publishers.map((publisher: Publisher, index: number) => {
        const publisherHasEmittedReport = reports.some(
          (report) => report.publisherId === publisher.id
        );

        return (
          <ListGroupItem
            key={publisher.id || uniqueId()}
            style={{
              cursor: 'pointer',
              color: getRowColor(publisher),
              backgroundColor: getRowBgColor(
                publisherHasEmittedReport,
                publisher
              ),
            }}
            onClick={() => props.onPublishersSelected([])}
          >
            <Link
              to={`/groups/${publisher.groupId}/${publisher.id}`}
              replace={true}
              style={linkStyle}
            >
              <div className="publisher-name-group">
                <Checkbox
                  onClick={(e: any) => e.stopPropagation()}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (event.target.checked) {
                      props.selectedPublishersIds.push(publisher.id || '');
                      props.onPublishersSelected(
                        cloneDeep(props.selectedPublishersIds)
                      );
                      return;
                    }

                    const index = props.selectedPublishersIds.indexOf(
                      publisher.id || ''
                    );
                    props.selectedPublishersIds.splice(index, 1);
                    props.onPublishersSelected(
                      cloneDeep(props.selectedPublishersIds)
                    );
                  }}
                />
                <span className="icons">
                  <PublisherRowIcon
                    hasReported={publisherHasEmittedReport}
                    publisher={publisher}
                  />
                </span>
                <span>{getPublisherName(publisher)}</span>
              </div>
            </Link>
          </ListGroupItem>
        );
      })}
    </ListGroup>
  );
}

const getRowBgColor = (hasReported: boolean, publisher: Publisher) => {
  if (publisher.activityStatus === PublisherActivityStatus.Inactive) {
    return '#FF7452';
  } else if (!hasReported) {
    return '#fff8e1';
  }

  return undefined;
};

const getRowColor = (publisher: Publisher) => {
  if (publisher.activityStatus === PublisherActivityStatus.Inactive) {
    return '#fff';
  }

  return undefined;
};

const PublisherRowIcon = ({
  hasReported,
  publisher,
}: {
  hasReported: boolean;
  publisher: Publisher;
}) => {
  if (publisher.activityStatus === PublisherActivityStatus.Inactive) {
    return <ErrorIcon label="" primaryColor="#BF2600" secondaryColor="#fff" />;
  }

  return (
    <>
      {!hasReported && (
        <WarningIcon label="" primaryColor="#f9a825" secondaryColor="#fff" />
      )}
      {hasReported && (
        <CheckCircleIcon
          label=""
          primaryColor="#00bfa5"
          secondaryColor="#fff"
        />
      )}
    </>
  );
};
