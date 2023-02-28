import fontawesome from '@fortawesome/fontawesome';
import {
  faPenSquare,
  faPlusCircle,
  faTrash,
} from '@fortawesome/fontawesome-free-solid';
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
import { Group, Publisher } from '../types';
import { PublisherViewContent } from './publisher-view-content';
import Page from '@atlaskit/page';
import { getPublisherName } from './util';
import __noop from '@atlaskit/ds-lib/noop';
import PageHeader from '@atlaskit/page-header';
import Lozenge from '@atlaskit/lozenge';
import Button, { ButtonGroup } from '@atlaskit/button';
import TrashIcon from '@atlaskit/icon/glyph/trash';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import AddCircleIcon from '@atlaskit/icon/glyph/add-circle';
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import { IconButton } from '@atlaskit/atlassian-navigation';

fontawesome.library.add(faPenSquare, faTrash, faPlusCircle);

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
  showRepportModal: boolean;
  showModificationView: boolean;
  publisherIdToDelete: string | undefined;
  setShowRepportModal: (show: boolean) => void;
  setShowModificationView: (show: boolean) => void;
  onHide: () => void;
  setPublisherIdToDelete: (publisherId: string | undefined) => void;
}

export const PublisherView = (props: Props) => {
  const [showRepportModal, setShowRepportModal] = useState(false);
  const [showModificationView, setShowModificationView] = useState(false);
  const [publisherIdToDelete, setPublisherIdToDelete] = useState<
    string | undefined
  >();
  const state: State = {
    showRepportModal,
    showModificationView,
    publisherIdToDelete,
    setShowRepportModal,
    setShowModificationView,
    onHide: props.onHide,
    setPublisherIdToDelete,
    publisher: props.publisher,
  };
  const { groupId, publisherId } = useParams();
  const { group, publisher } = useSelector((state: GlobalState) => {
    return {
      group: state.groups.groups.find((g) => g.id === groupId),
      publisher: state.publishers.publishers.find((p) => p.id === publisherId),
    };
  }, shallowEqual);
  const navigate = useNavigate();

  const breadcrumbs = (
    <Breadcrumbs onExpand={__noop}>
      <BreadcrumbsItem
        text={group?.name || 'Non affilié'}
        key="Group"
        component={() => (
          <Link to={`/groups/${group?.id || 'unafiliated'}`} replace={true}>
            {group?.name || 'Non affilié'}
          </Link>
        )}
      />
      <BreadcrumbsItem
        text={getPublisherName(publisher)}
        key="Publisher"
        href="javascript:void(0)"
      />
    </Breadcrumbs>
  );

  return (
    <div style={style as React.CSSProperties}>
      <Page>
        <PageHeader
          breadcrumbs={breadcrumbs}
          actions={makeActionsContent(
            publisher?.id,
            setShowRepportModal,
            setShowModificationView,
            setPublisherIdToDelete
          )}
          bottomBar={makeBottomBar(publisher)}
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
  setShowRepportModal: (show: boolean) => void,
  setShowModificationView: (show: boolean) => void,
  setPublisherIdToDelete: (id: string | undefined) => void
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
        onClick={() => setShowRepportModal(true)}
        icon={<AddCircleIcon label=""/>}
      />
      <IconButton
        icon={<TrashIcon label="" primaryColor={R300}/>}
        tooltip="Delete this report"
        onClick={() => setPublisherIdToDelete(publisherId)}
        isDisabled={!isAdmin}
      />
    </ButtonGroup>
  );
};

const makeBottomBar = (publisher?: Publisher) => {
  if (!publisher) return <span></span>;

  return (
    <>
      <div>{publisher.isElder && <Lozenge>Ancien</Lozenge>}</div>
      <div>
        {publisher.isRegularPioneer && <Lozenge isBold>Pionnier</Lozenge>}
      </div>
    </>
  );
};
