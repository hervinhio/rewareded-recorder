import { CSSProperties, useState } from 'react';
import { Events, Group, Publisher, Report } from '../types';
import { Groups, Users, store } from '../data';
import { Link } from 'react-router-dom';
import { CreateGroupDialog, CreatePublisherModal } from './modals';
import avatar from './avatar.png';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { GlobalState } from '../data';
import { filterNonInactiveAndNonPioneersOut } from '../utils';
import {
  AppItem,
  NavCategory,
  NavCategoryItem,
  NavDivider,
  NavDrawerBody,
  NavItem,
  NavSectionHeader,
  NavSubItem,
  NavSubItemGroup,
} from '@fluentui/react-nav-preview';
import {
  AddCircle24Filled,
  BookContacts24Filled,
  BroadActivityFeed24Filled,
  CalendarEdit24Filled,
  ChartMultiple24Regular,
  Home24Filled,
  LockClosedFilled,
  PeopleAudience24Filled,
  PeopleCommunity24Filled,
  Settings24Filled,
  SignOut24Filled,
} from '@fluentui/react-icons';
import {
  Badge,
  CounterBadge,
  themeToTokensObject,
  Tooltip,
} from '@fluentui/react-components';
import { darkTheme, lightTheme, themeMode } from '../theme';
import { authenticator } from '../auth';

interface Props {
  isDrawerMode: boolean;
  onClose: () => void;
}

const tokens = themeToTokensObject(
  themeMode === 'light' ? lightTheme : darkTheme,
);

export const Sidenav = (props: Props) => {
  const user = Users.getCurrent();
  const [showCreatePublisherModal, setShowCreatePublisherModal] =
    useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const isAdmin = Users.getCurrent().admin;
  const linkStyle = {
    textDecoration: 'none',
    color: tokens.colorNeutralForeground2Link,
  } as CSSProperties;
  const dispatch = useDispatch();
  const { groups, reports, publishers } = useSelector((state: GlobalState) => {
    return {
      groups: state.groups,
      reports: state.reports,
      publishers: state.publishers.publishers,
    };
  }, shallowEqual);
  const currentPublisher = publishers.find((p) => user.publisherId === p.id);

  return (
    <NavDrawerBody>
      <AppItem
        icon={
          <img
            alt="Avatar"
            src={user.photoURL || avatar}
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              borderRadius: '50%',
              left: 0,
              right: 0,
              height: 50,
              width: 50,
            }}
          />
        }>
        {user?.displayName}
      </AppItem>
      <Link
        to="/"
        replace={true}
        style={linkStyle}
        onClick={() => {
          props.onClose();
        }}>
        <NavItem icon={<Home24Filled />} as="button" value="1">
          Acceuil
        </NavItem>
      </Link>
      {!!currentPublisher && (
        <Link
          to={`/groups/${currentPublisher?.groupId || 'unafiliated'}/${
            currentPublisher?.id
          }`}
          replace={true}
          style={linkStyle}
          onClick={() => {
            props.onClose();
          }}>
          <NavItem icon={<BroadActivityFeed24Filled />} as="button" value="2">
            Ma fiche
          </NavItem>
        </Link>
      )}
      <Link
        to="/settings"
        replace={true}
        style={linkStyle}
        onClick={() => {
          props.onClose();
        }}>
        <NavItem value="3" icon={<Settings24Filled />}>
          Paramètres
        </NavItem>
      </Link>
      {Users.getCurrent().admin && (
        <Link
          to="/users"
          replace={true}
          style={linkStyle}
          onClick={() => props.onClose()}>
          <NavItem value="4" icon={<PeopleAudience24Filled />}>
            Utilisateurs
          </NavItem>
        </Link>
      )}
      {Users.getCurrent().admin && (
        <Link
          to="/groups"
          replace={true}
          style={linkStyle}
          onClick={() => props.onClose()}>
          <NavItem icon={<PeopleCommunity24Filled />} value="5">
            Groupes
          </NavItem>
        </Link>
      )}
      <Link
        to="/contacts"
        replace={true}
        style={linkStyle}
        onClick={() => props.onClose()}>
        <NavItem icon={<BookContacts24Filled />} value="6">
          Contacts
        </NavItem>
      </Link>
      {Users.getCurrent().admin && (
        <Link
          to="/stats"
          replace={true}
          style={linkStyle}
          onClick={() => props.onClose()}>
          <NavItem icon={<ChartMultiple24Regular />} value="7">
            Statistiques
          </NavItem>
        </Link>
      )}
      <Link
        to="/attendance"
        replace={true}
        style={linkStyle}
        onClick={() => props.onClose()}>
        <NavItem icon={<CalendarEdit24Filled />} value="8">
          Assitance
        </NavItem>
      </Link>

      <NavSectionHeader>Groupes des prédication</NavSectionHeader>
      <Link
        to="/groups/pioneers"
        style={linkStyle}
        replace={true}
        onClick={() => {
          dispatch(Groups.slice.actions.selected('pioneers'));
          props.onClose();
        }}>
        <NavItem icon={<PeopleCommunity24Filled />} value="9">
          Pionniers&nbsp;{getGroupIconAfter('pioneers', reports.current)}
        </NavItem>
      </Link>
      <Link
        to="/groups/inactives"
        style={linkStyle}
        replace={true}
        onClick={() => {
          dispatch(Groups.slice.actions.selected('inactives'));
          props.onClose();
        }}>
        <NavItem icon={<PeopleCommunity24Filled />} value="10">
          Inactifs&nbsp;{getGroupIconAfter('inactives', reports.current)}
        </NavItem>
      </Link>
      {groups.groups.map((group: Group, index: number) => {
        return (
          <Link
            to={getGroupLink(group.id)}
            replace={true}
            style={linkStyle}
            key={group.id}
            onClick={() => {
              dispatch(Groups.slice.actions.selected(group));
              props.onClose();
            }}>
            <NavItem icon={<PeopleCommunity24Filled />} value={`${index + 11}`}>
              {group.name}&nbsp;{getGroupIconAfter(group.id, reports.current)}
            </NavItem>
          </Link>
        );
      })}
      <Link
        to="/groups/unafiliated"
        style={linkStyle}
        replace={true}
        onClick={() => {
          dispatch(Groups.slice.actions.selected('unafiliated'));
          props.onClose();
        }}>
        <NavItem
          icon={<PeopleCommunity24Filled />}
          value={`${groups.groups.length + 11}`}>
          Non affilié&nbsp;{getGroupIconAfter('unafiliated', reports.current)}
        </NavItem>
      </Link>

      <NavDivider />

      <NavSectionHeader>Options</NavSectionHeader>
      <NavCategory value={`${groups.groups.length + 12}`}>
        <NavCategoryItem icon={<AddCircle24Filled />}>Créer</NavCategoryItem>
        <NavSubItemGroup>
          {isAdmin && (
            <NavSubItem
              onClick={() => setShowCreatePublisherModal(true)}
              value={`${groups.groups.length + 13}`}>
              Un proclamateur
            </NavSubItem>
          )}
          {isAdmin && (
            <NavSubItem
              value={`${groups.groups.length + 14}`}
              onClick={() => {
                setShowCreateGroupModal(true);
              }}>
              Un groupe de prédication
            </NavSubItem>
          )}
        </NavSubItemGroup>
      </NavCategory>

      <NavSectionHeader>Options utilisateur</NavSectionHeader>
      <NavItem
        onClick={() => {
          authenticator.logout().then(() => {
            Events.emit('logout');
          });
        }}
        icon={<SignOut24Filled />}
        value={`${groups.groups.length + 15}`}>
        Se déconnecter
      </NavItem>

      <Link to={'/settings'} style={linkStyle} replace={true}>
        <NavItem
          icon={<Settings24Filled />}
          value={`${groups.groups.length + 16}`}
          title="Configuration"
          onClick={() => {
            authenticator.logout().then(() => {
              Events.emit('logout');
            });
          }}>
          Configuration
        </NavItem>
      </Link>
      {showCreatePublisherModal && (
        <CreatePublisherModal
          show={showCreatePublisherModal}
          onHide={() => {
            setShowCreatePublisherModal(false);
            props.onClose();
          }}
        />
      )}
      {showCreateGroupModal && (
        <CreateGroupDialog
          show={showCreateGroupModal}
          onHide={() => {
            setShowCreateGroupModal(false);
            props.onClose();
          }}
        />
      )}
    </NavDrawerBody>
  );
};

const getGroupIconAfter = (groupId: string, reports: Report[]) => {
  const user = Users.getCurrent();
  const isSpecialGroup =
    groupId === 'pioneers' ||
    groupId === 'inactives' ||
    groupId === 'unafiliated';

  if (user.groupId !== groupId && !user.admin && !isSpecialGroup) {
    return (
      <Tooltip
        content={'Vous ne pouvez pas voir le contenu de ce groupe'}
        relationship="label">
        <Badge icon={<LockClosedFilled />} color="informative" />
      </Tooltip>
    );
  }

  const publishers = store.getState().publishers.byGroup[groupId] || [];
  const count = getLatePublishersCountForGroup(publishers, groupId, reports);
  return count > 0 ? (
    <Tooltip content={`${count} rapports non remis`} relationship="label">
      <CounterBadge
        shape="circular"
        appearance="filled"
        color="danger"
        count={count}
      />
    </Tooltip>
  ) : null;
};

const getLatePublishersCountForGroup = (
  publishers: Publisher[],
  groupId: string,
  reports: Report[],
) => {
  if (groupId === 'inactives') {
    return publishers.length;
  }

  const groupPublishers = publishers.filter((p) =>
    filterNonInactiveAndNonPioneersOut(p, groupId),
  );
  const latePublishers = groupPublishers.filter(
    (publisher) =>
      !reports.some((report) => report.publisherId === publisher.id),
  );

  return latePublishers.length;
};

const getGroupLink = (groupId: string): string => {
  const user = Users.getCurrent();

  if (
    user.groupId !== groupId &&
    !user.admin &&
    groupId !== 'inactives' &&
    groupId !== 'pioneers'
  ) {
    return '/groups/unauthorized';
  }

  return `/groups/${groupId}`;
};
