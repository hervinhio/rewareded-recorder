import './publisher-view.scss';
import { useState } from 'react';
import { GlobalState } from '../data';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
import { PublisherModificationViewSwitch } from './publisher-modification-view-switch';
import {
  Group,
  Publisher,
  PublisherActivityStatus,
  getGroupName,
} from '../types';
import { PublisherViewContent } from './publisher-view-content';
import { getPublisherName } from './util';
import {
  AlbumAddFilled,
  CalculatorArrowClockwiseFilled,
  DeleteFilled,
  EditFilled,
  LocationFilled,
  PeopleCommunityFilled,
  ViewDesktopMobileFilled,
} from '@fluentui/react-icons';
import { PublisherViewBreadCrumbs } from './publisher-view-breadcrumbs';
import { ReportDialog } from '../comps';
import {
  Badge,
  Button,
  Card,
  CardFooter,
  CardHeader,
  makeStyles,
  Text,
  themeToTokensObject,
} from '@fluentui/react-components';
import { darkTheme, lightTheme, themeMode } from '../theme';
import { EmptyState } from '../comps/empty-state';
import { useRefreshPublisher } from './use-refresh-publisher';

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

const tokens = themeToTokensObject(
  themeMode === 'light' ? lightTheme : darkTheme,
);
const useClasses = makeStyles({
  card: {
    backgroundColor: tokens.colorBrandBackground2,
  },
});

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
  const refreshPublisher = useRefreshPublisher();

  if (!publisher) {
    return <PublisherNotFound />;
  }

  return (
    <div>
      <div className="header" style={{ marginBottom: '16px' }}>
        <PublisherViewBreadCrumbs publisher={publisher} group={group} />
        <PublisherCard
          onAction={(option: 'delete' | 'add' | 'edit' | 'refresh') => {
            switch (option) {
              case 'delete':
                setPublisherIdToDelete(publisher.id);
                break;
              case 'add':
                setShowReportModal(true);
                break;
              case 'edit':
                setShowModificationView(true);
                break;
              case 'refresh':
                refreshPublisher(publisher);
                break;
            }
          }}
          publisher={publisher}
          groups={groups}
        />
      </div>
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
      {showReportModal && (
        <ReportDialog
          onHide={() => setShowReportModal(false)}
          publisherId={publisher.id}
          show={showReportModal}
        />
      )}
    </div>
  );
};

const PublisherCard = (props: {
  onAction: (action: 'delete' | 'add' | 'edit' | 'refresh') => void;
  publisher?: Publisher;
  groups?: Group[];
}) => {
  const styles = useClasses();

  if (!props.publisher) return <span></span>;

  return (
    <div className="publisher-header">
      <Card className={styles.card}>
        <CardHeader
          header={
            <Text weight="semibold">{getPublisherName(props.publisher)}</Text>
          }
          description={
            <header>
              {props.publisher.activityStatus === PublisherActivityStatus.Inactive && (
                <Badge color="danger" shape="rounded" appearance="tint">
                  Inactif
                </Badge>
              )}
              {props.publisher.activityStatus === PublisherActivityStatus.Irregular && (
                <Badge color="warning" shape="rounded" appearance="tint">
                  Irrégulier
                </Badge>
              )}
              {props.publisher.activityStatus === PublisherActivityStatus.Active && (
                <Badge color="success" shape="rounded" appearance="tint">
                  Actif
                </Badge>
              )}
              {props.publisher.isElder && (
                <Badge color="subtle" shape="rounded" appearance="tint">
                  Ancien
                </Badge>
              )}
              {props.publisher.isMinisterialServant && (
                <Badge color="subtle" shape="rounded" appearance="tint">
                  Assitant
                </Badge>
              )}
              {props.publisher.isRegularPioneer && (
                <Badge color="subtle" shape="rounded" appearance="tint">
                  Pionnier
                </Badge>
              )}
            </header>
          }
        />
        <p>
          <div className="publisher-header-contact">
            {props.publisher?.isRegularPioneer ||
              (props.publisher?.activityStatus ===
                PublisherActivityStatus.Inactive && (
                <span>
                  <PeopleCommunityFilled />
                  &nbsp;
                  <Link
                    to={`/groups/${props.publisher?.groupId || 'unafiliated'}`}
                    replace={true}>
                    {getGroupName(
                      props.publisher.groupId || 'unafiliated',
                      props.groups || [],
                    )}
                  </Link>
                </span>
              ))}
            <span>
              <LocationFilled />
              &nbsp;{props.publisher.address || '(Aucun)'}
            </span>
            <span>
              <ViewDesktopMobileFilled />
              &nbsp;
              <a href={`tel:${props.publisher.telephone}`}>
                {props.publisher.telephone || '(Aucun)'}
              </a>
            </span>
            <span>
              <b>Date de naissance</b>:{' '}
              {props.publisher?.birthDate?.toDate().toLocaleDateString('FR') ||
                'Non définie'}
            </span>
            <span>
              <b>Date de baptême</b>:{' '}
              {props.publisher?.baptismDate
                ?.toDate()
                .toLocaleDateString('FR') || 'Non définie'}
            </span>
          </div>
        </p>
        <CardFooter>
          <Button
            icon={<AlbumAddFilled />}
            appearance="primary"
            onClick={() => props.onAction('add')}>
            Nouveau rapport
          </Button>
          <Button
            icon={<EditFilled />}
            onClick={() => props.onAction('edit')}
          />
          <Button
            icon={<DeleteFilled />}
            onClick={() => props.onAction('delete')}
          />
          <Button
            icon={<CalculatorArrowClockwiseFilled />}
            onClick={() => props.onAction('refresh')}
          />
        </CardFooter>
      </Card>
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
