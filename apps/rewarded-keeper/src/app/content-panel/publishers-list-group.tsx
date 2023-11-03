import './publishers-list-group.scss';
import { CSSProperties, ChangeEvent, useState } from 'react';
import { Checkbox } from '@atlaskit/checkbox';
import cloneDeep from 'lodash/cloneDeep';
import { getPublisherName } from './util';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { Link } from 'react-router-dom';
import { Publisher, PublisherActivityStatus, Report } from '../types';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState, Publishers } from '../data';
import { uniqueId } from 'lodash';
import { SearchAndAddPublisher } from './search-or-add-publisher';
import EmailIcon from '@atlaskit/icon/glyph/email';
import MobileIcon from '@atlaskit/icon/glyph/mobile';
import VidHangUpIcon from '@atlaskit/icon/glyph/vid-hang-up';
import LocationIcon from '@atlaskit/icon/glyph/location';
import { filterNonInactiveAndNonPioneersOut } from '../utils';
import Button from '@atlaskit/button';
import { PublishersListDialog } from '../comps';
import { borderRadius as getBorderRadius } from '@atlaskit/theme/constants';
import { token } from '@atlaskit/tokens';
const borderRadius = getBorderRadius();

const linkStyle = {
  textDecoration: 'none',
  color: token('color.text'),
} as CSSProperties;
const publisherListItemStyle = {
  color: token('color.text'),
  cursor: 'pointer',
  backgroundColor: token('color.background.neutral'),
};

interface Props {
  onPublishersSelected: (publishers: string[]) => void;
  selectedPublishersIds: string[];
  groupId?: string;
}

export function PublishersListGroup(props: Props) {
  const [showInactivesDialog, setShowInactivesDialog] = useState(false);
  const { publishers, reports, inactives } = useSelector(
    (state: GlobalState) => {
      const pubs =
        state.publishers.byGroup[props.groupId || 'unafiliated'] || [];
      return {
        publishers: pubs
          .filter((p: Publisher) =>
            filterNonInactiveAndNonPioneersOut(
              p,
              props.groupId || 'unafiliated'
            )
          )
          .sort((a: Publisher, b: Publisher) =>
            sortPublishers(a, b, state.reports.current || [])
          ),
        inactives:
          props.groupId !== 'inactives'
            ? pubs.filter(
                (p) => p.activityStatus === PublisherActivityStatus.Inactive
              )
            : [],
        reports: state.reports.current,
      };
    },
    shallowEqual
  );

  return (
    <ListGroup style={{ width: '100%' }}>
      <h4>Proclamateurs</h4>
      <ListGroupItem
        key={uniqueId()}
        style={{
          ...publisherListItemStyle,
          borderTopRightRadius: borderRadius,
        }}
      >
        <SearchAndAddPublisher onAdd={Publishers.save} />
      </ListGroupItem>
      {inactives.length > 0 && (
        <ListGroupItem key={uniqueId()} style={publisherListItemStyle}>
          <div
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              left: 0,
              right: 0,
              width: 'fit-content',
              ...publisherListItemStyle,
            }}
          >
            <Button
              appearance="link"
              color={token('color.background.neutral')}
              onClick={() => setShowInactivesDialog(true)}
            >
              {inactives.length} Inactifs
            </Button>
          </div>
        </ListGroupItem>
      )}
      {publishers.map((publisher: Publisher) => {
        const publisherHasEmittedReport = reports.some(
          (report) => report.publisherId === publisher.id
        );

        return (
          <ListGroupItem
            key={publisher.id || uniqueId()}
            style={{
              ...publisherListItemStyle,
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
                <span className="publisher-name">
                  {getPublisherName(publisher)}
                </span>
                <span className="flex-expand"></span>
                {publisher.address && (
                  <LocationIcon
                    label=""
                    primaryColor={token('color.text')}
                    size="small"
                  />
                )}
                {publisher.emailAddress && (
                  <EmailIcon
                    label=""
                    primaryColor={token('color.text')}
                    size="small"
                  />
                )}
                {publisher.emergencyPhone && (
                  <VidHangUpIcon
                    label=""
                    primaryColor={token('color.text')}
                    size="small"
                  />
                )}
                {publisher.telephone && (
                  <MobileIcon
                    label=""
                    primaryColor={token('color.text')}
                    size="small"
                  />
                )}
              </div>
            </Link>
          </ListGroupItem>
        );
      })}
      {showInactivesDialog && (
        <PublishersListDialog
          publishers={inactives}
          mode="inactive"
          onHide={() => setShowInactivesDialog(false)}
        />
      )}
    </ListGroup>
  );
}

const getRowBgColor = (hasReported: boolean, publisher: Publisher) => {
  console.log(publisher);
  console.log(PublisherActivityStatus.Inactive);
  if (publisher.activityStatus === PublisherActivityStatus.Inactive) {
    return token('color.background.danger');
  } else if (!hasReported) {
    return token('color.background.warning');
  }

  return token('color.background.neutral');
};

const PublisherRowIcon = ({
  hasReported,
  publisher,
}: {
  hasReported: boolean;
  publisher: Publisher;
}) => {
  if (publisher.activityStatus === PublisherActivityStatus.Inactive) {
    return (
      <ErrorIcon
        label=""
        primaryColor={token('color.icon.danger')}
        secondaryColor={token('color.text')}
      />
    );
  }

  return (
    <>
      {!hasReported && (
        <WarningIcon
          label=""
          primaryColor={token('color.icon.warning')}
          secondaryColor={token('color.text')}
        />
      )}
      {hasReported && (
        <CheckCircleIcon
          label=""
          primaryColor={token('color.icon.success')}
          secondaryColor={token('color.text')}
        />
      )}
    </>
  );
};

function sortPublishers(a: Publisher, b: Publisher, reports: Report[]): 1 | -1 {
  const pubAHasReport = reports.some((report) => report.publisherId === a.id);
  const pubBHasReport = reports.some((report) => report.publisherId === b.id);

  if (pubAHasReport && !pubBHasReport) return 1;
  if (pubBHasReport && !pubAHasReport) return -1;
  return getPublisherName(a) >= getPublisherName(b) ? 1 : -1;
}
