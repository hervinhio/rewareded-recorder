import { CSSProperties, useState } from 'react';
import {
  Events,
  Group,
  Permission,
  Publisher,
  Report,
  Role,
  User,
} from '../types';
import { Groups, Users, store, Publishers } from '../data';
import { Link } from 'react-router-dom';
import { auth } from '../auth';
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
  Calendar24Filled,
  CalendarEdit24Filled,
  ChartMultiple24Regular,
  ChevronDown24Regular,
  ChevronRight24Regular,
  Home24Filled,
  PeopleAudience24Filled,
  PeopleCommunity24Filled,
  QuestionCircle24Regular,
  Settings24Filled,
  SignOut24Filled,
  FolderPeople24Filled,
  TaskListSquareLtr24Regular,
} from '@fluentui/react-icons';
import {
  Badge,
  CounterBadge,
  tokens,
  Tooltip,
} from '@fluentui/react-components';
import {
  MultiPermissionGuard,
  PermissionGuard,
  RoleGuard,
} from '../components/permission-guard';

interface Props {
  isDrawerMode: boolean;
  onClose: () => void;
}

export const Sidenav = (props: Props) => {
  const user = Users.getCurrent();
  const [showCreatePublisherModal, setShowCreatePublisherModal] =
    useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupsExpanded, setGroupsExpanded] = useState(true);
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  const isAdmin = Users.getCurrent().admin;
  const linkStyle = {
    textDecoration: 'none',
    color: tokens.colorNeutralForeground2Link,
  } as CSSProperties;
  const dispatch = useDispatch();
  const { groups, currentReports, publishers } = useSelector((state: GlobalState) => {
    return {
      groups: Groups.getAllowedGroupsForUser(Users.getCurrent()),
      currentReports: Publishers.getCurrentMonthReports(),
      publishers: state.publishers.publishers,
    };
  }, shallowEqual);
  const currentPublisher = publishers.find((p) => user.publisherId === p.id);

  return (
    <NavDrawerBody style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      {/* Static top section — not scrollable */}
      <div style={{ flex: '0 0 auto' }}>
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

        <div className="sidenav-hide-on-mobile">
          <RoleGuard
            allowedRoles={[Role.ROOT, Role.ADMIN, Role.GROUP_ADMIN]}
            user={user}>
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
          </RoleGuard>

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
        </div>

        <PermissionGuard
          permission={Permission.USER_ADMIN}
          user={Users.getCurrent()}>
          <Link
            to="/users"
            replace={true}
            style={linkStyle}
            onClick={() => props.onClose()}>
            <NavItem value="4" icon={<PeopleAudience24Filled />}>
              Utilisateurs
            </NavItem>
          </Link>

          <Link
            to="/groups"
            replace={true}
            style={linkStyle}
            onClick={() => props.onClose()}>
            <NavItem icon={<PeopleCommunity24Filled />} value="5">
              Groupes
            </NavItem>
          </Link>
        </PermissionGuard>

        <MultiPermissionGuard
          permissions={[
            Permission.CONTACT_EDIT,
            Permission.VIEW_GROUP_MEMBERS,
            Permission.USER_ADMIN,
          ]}
          user={Users.getCurrent()}>
          <Link
            to="/contacts"
            replace={true}
            style={linkStyle}
            onClick={() => props.onClose()}>
            <NavItem icon={<BookContacts24Filled />} value="6">
              Contacts
            </NavItem>
          </Link>
        </MultiPermissionGuard>

        <PermissionGuard
          permission={Permission.USER_ADMIN}
          user={Users.getCurrent()}>
          <Link
            to="/stats"
            replace={true}
            style={linkStyle}
            onClick={() => props.onClose()}>
            <NavItem icon={<ChartMultiple24Regular />} value="7">
              Statistiques
            </NavItem>
          </Link>
        </PermissionGuard>

        <PermissionGuard
          permission={Permission.ATTENDANCE_MANAGE}
          user={Users.getCurrent()}>
          <Link
            to="/attendance"
            replace={true}
            style={linkStyle}
            onClick={() => props.onClose()}>
            <NavItem icon={<CalendarEdit24Filled />} value="8">
              Assitance
            </NavItem>
          </Link>
        </PermissionGuard>

        <RoleGuard
          allowedRoles={[Role.ADMIN, Role.ROOT]}
          user={Users.getCurrent()}>
          <Link
            to="/months"
            replace={true}
            style={linkStyle}
            onClick={() => props.onClose()}>
            <NavItem icon={<Calendar24Filled />} value="9">
              Mois spéciaux
            </NavItem>
          </Link>
        </RoleGuard>

        <Link
          to="/appointed-members"
          style={linkStyle}
          replace={true}
          onClick={() => {
            props.onClose();
          }}>
          <NavItem icon={<FolderPeople24Filled />} value="10">
            Membres nommés
          </NavItem>
        </Link>

        <RoleGuard allowedRoles={[Role.ROOT]} user={Users.getCurrent()}>
          <Link
            to="/requests"
            replace={true}
            style={linkStyle}
            onClick={() => props.onClose()}>
            <NavItem icon={<TaskListSquareLtr24Regular />} value="11">
              Requêtes
            </NavItem>
          </Link>
        </RoleGuard>

        <Link
          to="/help"
          replace={true}
          style={linkStyle}
          onClick={() => props.onClose()}>
          <NavItem icon={<QuestionCircle24Regular />} value="help">
            Aide
          </NavItem>
        </Link>
      </div>

      {/* Groups section — collapsible and independently scrollable */}
      <div className="sidenav-hide-on-mobile sidenav-groups-wrapper">
        <PermissionGuard
          permission={Permission.VIEW_GROUP_MEMBERS}
          user={Users.getCurrent()}>
          <div className={`sidenav-groups-section${groupsExpanded ? ' expanded' : ''}`}>
          <div
            className="sidenav-section-header"
            onClick={() => setGroupsExpanded(!groupsExpanded)}>
            <span>Groupes des prédication</span>
            {groupsExpanded ? <ChevronDown24Regular /> : <ChevronRight24Regular />}
          </div>

          {groupsExpanded && (
            <div className="sidenav-groups-list">
              <Link
                to="/groups/pioneers"
                style={linkStyle}
                replace={true}
                onClick={() => {
                  props.onClose();
                }}>
                <NavItem icon={<PeopleCommunity24Filled />} value="11">
                  Pionniers&nbsp;{getGroupIconAfter('pioneers', currentReports)}
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
                <NavItem icon={<PeopleCommunity24Filled />} value="12">
                  Inactifs&nbsp;{getGroupIconAfter('inactives', currentReports)}
                </NavItem>
              </Link>

              {groups.map((group: Group, index: number) => {
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
                    <NavItem icon={<PeopleCommunity24Filled />} value={`${index + 13}`}>
                      {group.name}&nbsp;{getGroupIconAfter(group.id, currentReports)}
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
                  value={`${groups.length + 13}`}>
                  Non affilié&nbsp;{getGroupIconAfter('unafiliated', currentReports)}
                </NavItem>
              </Link>
            </div>
          )}
        </div>
        </PermissionGuard>
      </div>

      {/* Bottom section — fixed, non-scrollable */}
      <div style={{ flex: '0 0 auto' }}>
        <NavDivider />

        <MultiPermissionGuard
          permissions={[Permission.GROUP_MANAGE, Permission.PUBLISHER_MANAGE]}
          user={Users.getCurrent()}>
          <div
            className="sidenav-section-header"
            onClick={() => setOptionsExpanded(!optionsExpanded)}>
            <span>Options</span>
            {optionsExpanded ? <ChevronDown24Regular /> : <ChevronRight24Regular />}
          </div>
          {optionsExpanded && (
            <NavCategory value={`${groups.length + 14}`}>
              <NavCategoryItem icon={<AddCircle24Filled />}>Créer</NavCategoryItem>
              <NavSubItemGroup>
                <PermissionGuard
                  permission={Permission.PUBLISHER_MANAGE}
                  user={Users.getCurrent()}>
                  <NavSubItem
                    onClick={() => setShowCreatePublisherModal(true)}
                    value={`${groups.length + 15}`}>
                    Un proclamateur
                  </NavSubItem>
                </PermissionGuard>
                <PermissionGuard
                  permission={Permission.GROUP_MANAGE}
                  user={Users.getCurrent()}>
                  <NavSubItem
                    value={`${groups.length + 16}`}
                    onClick={() => {
                      setShowCreateGroupModal(true);
                    }}>
                    Un groupe de prédication
                  </NavSubItem>
                </PermissionGuard>
              </NavSubItemGroup>
            </NavCategory>
          )}
        </MultiPermissionGuard>

        <NavSectionHeader>Options utilisateur</NavSectionHeader>
        <NavItem
          onClick={() => {
            auth.signOut().then(() => {
              Events.emit('logout');
            });
          }}
          icon={<SignOut24Filled />}
          value={`${groups.length + 17}`}>
          Se déconnecter
        </NavItem>

        <div className="sidenav-hide-on-mobile">
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
        </div>
      </div>

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
    !canSeeGroupMembers(user) &&
    groupId !== 'inactives' &&
    groupId !== 'pioneers'
  ) {
    return '/groups/unauthorized';
  }

  return `/groups/${groupId}`;
};

const canSeeGroupMembers = (user: User) => {
  return (
    user.admin ||
    [Role.ROOT, Role.ADMIN, Role.GROUP_ADMIN, Role.REPORTER].includes(
      user.role || Role.BASIC,
    )
  );
};
