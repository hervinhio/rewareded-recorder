import { CSSProperties, ChangeEvent } from 'react';
import { Checkbox } from '@atlaskit/checkbox';
import cloneDeep from 'lodash/cloneDeep';
import { getPublisherName } from './util';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import { Link } from 'react-router-dom';
import { Publisher } from '../types';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../data';

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
      {publishers.map((publisher: Publisher, index: number) => {
        const publisherHasEmittedReport = reports.some(
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
            </Link>
          </ListGroupItem>
        );
      })}
    </ListGroup>
  );
}
