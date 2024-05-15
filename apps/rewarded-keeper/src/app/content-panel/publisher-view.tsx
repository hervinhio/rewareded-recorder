import './publisher-view.scss';
import { useState } from 'react';
import { GlobalState, Users } from '../data';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { token } from '@atlaskit/tokens';
import {
  borderRadius as getBorderRadius,
  gridSize as getGridSize,
} from '@atlaskit/theme/constants';
import { N20, N200, R300 } from '@atlaskit/theme/colors';
import { shallowEqual, useSelector } from 'react-redux';
import { PublisherModificationViewSwitch } from './publisher-modification-view-switch';
import {
  Group,
  Publisher,
  PublisherActivityStatus,
  getGroupName,
} from '../types';
import { PublisherViewContent } from './publisher-view-content';
import Page from '@atlaskit/page';
import { getPublisherName } from './util';
import PageHeader from '@atlaskit/page-header';
import Lozenge from '@atlaskit/lozenge';
import { ButtonGroup } from '@atlaskit/button';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import AddCircleIcon from '@atlaskit/icon/glyph/add-circle';
import { IconButton } from '@atlaskit/atlassian-navigation';
import MobileIcon from '@atlaskit/icon/glyph/mobile';
import EmailIcon from '@atlaskit/icon/glyph/email';
import LocationIcon from '@atlaskit/icon/glyph/location';
import PeopleGroupIcon from '@atlaskit/icon/glyph/people-group';
import EmptyState from '@atlaskit/empty-state';
import { PublisherViewBreadCrumbs } from './publisher-view-breadcrumbs';

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

interface Props {
  publisher?: Publisher;
  onHide: () => void;
}

interface State {
  publisher?: Publisher;
  group?: Group;
  showReportModal: boolean;
  showModificationView: boolean;
  publisherIdToDelete: string | undefined;
  setShowReportModal: (show: boolean) => void;
  setShowModificationView: (show: boolean) => void;
  onHide: () => void;
  setPublisherIdToDelete: (publisherId: string | undefined) => void;
}

export const PublisherView = (props: Props) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showModificationView, setShowModificationView] = useState(false);
  const [publisherIdToDelete, setPublisherIdToDelete] = useState<
    string | undefined
  >();
  const state: State = {
    showReportModal,
    showModificationView,
    publisherIdToDelete,
    setShowReportModal,
    setShowModificationView,
    onHide: props.onHide,
    setPublisherIdToDelete,
    publisher: props.publisher,
  };
  const { groupId, publisherId } = useParams();
  const { group, groups, publisher } = useSelector((state: GlobalState) => {
    return {
      group: state.groups.groups.find((g) => g.id === groupId),
      groups: state.groups.groups,
      publisher: state.publishers.publishers.find((p) => p.id === publisherId),
    };
  }, shallowEqual);
  const navigate = useNavigate();

  if (!publisher) {
    return <PublisherNotFound />;
  }

  return (
    <div style={style as React.CSSProperties}>
      <Page>
        <PageHeader
          breadcrumbs={
            <PublisherViewBreadCrumbs publisher={publisher} group={group} />
          }
          actions={makeActionsContent(
            publisher?.id,
            setShowReportModal,
            setShowModificationView,
            setPublisherIdToDelete,
          )}
          bottomBar={makeBottomBar(publisher, groups)}
        >
          {getPublisherName(publisher)}
        </PageHeader>
        <PublisherModificationViewSwitch
          show={showModificationView && !!publisher}
          {...state}
          publisher={publisher}
          group={group}
        />
        <PublisherViewContent
          show={!(showModificationView && !!publisher)}
          {...state}
          publisher={publisher}
          group={group}
          onHide={() => navigate(`/groups/${groupId}`)}
        />
      </Page>
    </div>
  );
};

const makeActionsContent = (
  publisherId: string | undefined,
  setShowReportModal: (show: boolean) => void,
  setShowModificationView: (show: boolean) => void,
  setPublisherIdToDelete: (id: string | undefined) => void,
) => {
  const isAdmin = Users.getCurrent().admin;

  return (
    <ButtonGroup>
      <IconButton
        icon={<EditFilledIcon label="" />}
        tooltip="Modify this publisher"
        onClick={() => setShowModificationView(true)}
        isDisabled={!isAdmin}
      />
      <IconButton
        tooltip="Add a new report"
        onClick={() => setShowReportModal(true)}
        icon={<AddCircleIcon label="" />}
      />
      <IconButton
        icon={<TrashIcon label="" primaryColor={R300} />}
        tooltip="Delete this publisher"
        onClick={() => setPublisherIdToDelete(publisherId)}
        isDisabled={!isAdmin}
      />
    </ButtonGroup>
  );
};

const makeBottomBar = (publisher?: Publisher, groups?: Group[]) => {
  if (!publisher) return <span></span>;

  return (
    <div className="publisher-header">
      <div className="publisher-header-contact">
        {publisher?.isRegularPioneer ||
          (publisher?.activityStatus === PublisherActivityStatus.Inactive && (
            <span>
              <PeopleGroupIcon label="Groupe" />
              &nbsp;
              <Link
                to={`/groups/${publisher?.groupId || 'unafiliated'}`}
                replace={true}
              >
                {getGroupName(publisher.groupId || 'unafiliated', groups || [])}
              </Link>
            </span>
          ))}
        <span>
          <LocationIcon label="Addresse" />
          &nbsp;{publisher.address || '(Aucun)'}
        </span>
        <span>
          <MobileIcon label="Phone" />
          &nbsp;
          <a href={`tel:${publisher.telephone}`}>
            {publisher.telephone || '(Aucun)'}
          </a>
        </span>
        <span>
          <EmailIcon label="Email" />
          &nbsp;
          <a href={`email:${publisher.emailAddress}`}>
            {publisher.emailAddress || '(Aucun)'}
          </a>
        </span>
      </div>
      <div className="publisher-header-privileges">
        <div>{publisher.isElder && <Lozenge>Ancien</Lozenge>}</div>
        <div>
          {publisher.isRegularPioneer && <Lozenge isBold>Pionnier</Lozenge>}
        </div>
      </div>
    </div>
  );
};

function PublisherNotFound() {
  return (
    <EmptyState
      header="Ce proclamateur n'existe pas ou vous ne pouvez pas le voir"
      description="Veuillez vous assurer que le proclamateur existe dans l'application. D'autre part, seul l'administrateur a accès à tous les groupes de prédicaation. Si vous voulez qu'une opération particulière soit éffectuée sur un proclamateur d'un autre groupe, veuillez contacter l'administrateur."
      imageUrl={
        '/assets/10007697_not found_error_alert_browser_content_icon.png'
      }
    />
  );
}
