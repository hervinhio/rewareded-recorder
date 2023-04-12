import {
  Header,
  NavigationContent,
  NavigationHeader,
  NestableNavigationContent,
  NestingItem,
  SideNavigation,
} from '@atlaskit/side-navigation';
import { ButtonItem, Section } from '@atlaskit/menu';
import { CSSProperties, useState } from 'react';
import { Events, Group, Publisher, Repport } from '../types';
import { Groups, Users, store } from '../data';
import { Link } from 'react-router-dom';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import { auth, isAuthenticated } from '../auth';
import { User } from 'firebase/auth';
import PersonCircleIcon from '@atlaskit/icon/glyph/person-circle';
import PeopleGroupIcon from '@atlaskit/icon/glyph/people-group';
import AddCircleIcon from '@atlaskit/icon/glyph/add-circle';
import SignOutIcon from '@atlaskit/icon/glyph/sign-out';
import InviteTeamIcon from '@atlaskit/icon/glyph/invite-team';
import TableIcon from '@atlaskit/icon/glyph/table';
import MediaServicesGridIcon from '@atlaskit/icon/glyph/media-services/grid';
import HomeIcon from '@atlaskit/icon/glyph/home';
import { CreateGroupModal, CreatePublisherModal, RepportModal } from './modals';
import avatar from './avatar.png';
import Badge from '@atlaskit/badge';
import Tooltip from '@atlaskit/tooltip';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { GlobalState } from '../data';
import SettingsIcon from '@atlaskit/icon/glyph/settings';
import PeopleIcon from '@atlaskit/icon/glyph/people';
import LockFilledIcon from '@atlaskit/icon/glyph/lock-filled';
import MentionIcon from '@atlaskit/icon/glyph/mention';
import { filterNonInactiveAndNonPioneersOut } from '../utils';

interface Props {
  isDrawerMode: boolean;
  onClose: () => void;
}

export const Sidenav = (props: Props) => {
  const user = Users.getCurrent();
  const [showCreatePublisherModal, setShowCreatePublisherModal] =
    useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showRepportModal, setShowRepportModal] = useState(false);
  const isAdmin = Users.getCurrent().admin;
  const linkStyle = { textDecoration: 'none', color: '#000' } as CSSProperties;
  const dispatch = useDispatch();
  const { groups, reports } = useSelector((state: GlobalState) => {
    return {
      groups: state.groups,
      reports: state.reports,
      publishers: state.publishers,
    };
  }, shallowEqual);

  return (
    <SideNavigation label="Navigation" testId="side-navigation">
      <NavigationContent>
        <NavigationHeader>
          <Header description="">
            {props.isDrawerMode && (
              <div
                className="navigation-back-button"
                onClick={() => props.onClose()}
              >
                <ArrowLeftIcon size="medium" label="" />
              </div>
            )}
          </Header>
          <Header>
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
              }}
            >
              <h2>{user?.displayName}</h2>
              <img
                alt="Avatar"
                src={user.photoURL || avatar}
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  borderRadius: '50%',
                  left: 0,
                  right: 0,
                  height: 92,
                  width: 92,
                }}
              />
            </div>
          </Header>
          <Header description="Gérez les groupes ou d'autres options">
            Groupes &amp; options
          </Header>
        </NavigationHeader>

        <Section title="Places">
          <Link
            to="/"
            replace={true}
            style={linkStyle}
            onClick={() => {
              props.onClose();
            }}
          >
            <ButtonItem iconBefore={<HomeIcon label="" />}>Acceuil</ButtonItem>
          </Link>
          <Link
            to="/settings"
            replace={true}
            style={linkStyle}
            onClick={() => {
              props.onClose();
            }}
          >
            <ButtonItem iconBefore={<SettingsIcon label="" />}>
              Paramètres
            </ButtonItem>
          </Link>
          {Users.getCurrent().admin && (
            <Link
              to="/users"
              replace={true}
              style={linkStyle}
              onClick={() => props.onClose()}
            >
              <ButtonItem iconBefore={<PeopleIcon label="" />}>
                Utilisateurs
              </ButtonItem>
            </Link>
          )}
          {Users.getCurrent().admin && (
            <Link
              to="/groups"
              replace={true}
              style={linkStyle}
              onClick={() => props.onClose()}
            >
              <ButtonItem iconBefore={<PeopleGroupIcon label="" />}>
                Groups
              </ButtonItem>
            </Link>
          )}
          {Users.getCurrent().admin && (
            <Link
              to="/contacts"
              replace={true}
              style={linkStyle}
              onClick={() => props.onClose()}
            >
              <ButtonItem iconBefore={<MentionIcon label="" />}>
                Contacts
              </ButtonItem>
            </Link>
          )}
        </Section>

        <Section title="Groupes">
          <Link
            to="/groups/pioneers"
            style={linkStyle}
            replace={true}
            onClick={() => {
              dispatch(Groups.slice.actions.selected('pioneers'));
              props.onClose();
            }}
          >
            <ButtonItem
              iconBefore={<PeopleGroupIcon label="" />}
              isSelected={groups.active?.id === 'pioneers'}
              iconAfter={getGroupIconAfter('pioneers', reports.current)}
            >
              Pionniers
            </ButtonItem>
          </Link>
          <Link
            to="/groups/inactives"
            style={linkStyle}
            replace={true}
            onClick={() => {
              dispatch(Groups.slice.actions.selected('inactives'));
              props.onClose();
            }}
          >
            <ButtonItem
              iconBefore={<PeopleGroupIcon label="" />}
              isSelected={groups.active?.id === 'inactives'}
              iconAfter={getGroupIconAfter('inactives', reports.current)}
            >
              Inactifs
            </ButtonItem>
          </Link>
          {groups.groups.map((group: Group) => {
            return (
              <Link
                to={getGroupLink(group.id)}
                replace={true}
                style={linkStyle}
                key={group.id}
                onClick={() => {
                  dispatch(Groups.slice.actions.selected(group));
                  props.onClose();
                }}
              >
                <ButtonItem
                  iconBefore={<PeopleGroupIcon label="" />}
                  isSelected={group.id === groups.active?.id}
                  iconAfter={getGroupIconAfter(group.id, reports.current)}
                >
                  {group.name}
                </ButtonItem>
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
            }}
          >
            <ButtonItem
              iconBefore={<PeopleGroupIcon label="" />}
              isSelected={!groups.active}
              iconAfter={getGroupIconAfter('unafiliated', reports.current)}
            >
              Non affilié
            </ButtonItem>
          </Link>
        </Section>

        <NestableNavigationContent initialStack={[]}>
          <Section title="Options">
            <NestingItem
              iconBefore={<AddCircleIcon label="" />}
              id="2"
              title="Créer"
            >
              <Section title="Créer une entité">
                {isAdmin && (
                  <ButtonItem
                    iconBefore={<InviteTeamIcon label="" />}
                    onClick={() => setShowCreatePublisherModal(true)}
                  >
                    Proclamateur
                  </ButtonItem>
                )}
                {isAdmin && (
                  <ButtonItem
                    iconBefore={<MediaServicesGridIcon label="" />}
                    onClick={() => {
                      setShowCreateGroupModal(true);
                    }}
                  >
                    Groupe
                  </ButtonItem>
                )}
                <ButtonItem
                  iconBefore={<TableIcon label="" />}
                  onClick={() => setShowRepportModal(true)}
                >
                  Rapport
                </ButtonItem>
              </Section>
            </NestingItem>

            <NestingItem
              id="1"
              title={user?.displayName}
              iconBefore={<PersonCircleIcon label="" />}
            >
              <Section title="Option de l'utilisateur">
                <ButtonItem
                  onClick={() => {
                    auth.signOut().then(() => {
                      Events.emit('logout');
                    });
                  }}
                  iconBefore={<SignOutIcon label="" />}
                >
                  Se déconnecter
                </ButtonItem>
              </Section>
            </NestingItem>

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
              <CreateGroupModal
                show={showCreateGroupModal}
                onHide={() => {
                  setShowCreateGroupModal(false);
                  props.onClose();
                }}
              />
            )}
            {showRepportModal && (
              <RepportModal
                onHide={() => {
                  setShowRepportModal(false);
                  props.onClose();
                }}
                show={showRepportModal}
                publisherId={undefined}
              />
            )}
          </Section>
        </NestableNavigationContent>
      </NavigationContent>
    </SideNavigation>
  );
};

const getGroupIconAfter = (groupId: string, repports: Repport[]) => {
  const user = Users.getCurrent();
  if (user.groupId !== groupId && !user.admin) {
    return (
      <Tooltip content={'Vous ne pouvez pas voir le contenu de ce groupe'}>
        <LockFilledIcon label="Locked group" />
      </Tooltip>
    );
  }

  const publishers = store.getState().publishers.byGroup[groupId] || [];
  const count = getLatePublishersCountForGroup(publishers, groupId, repports);
  return count > 0 ? (
    <Tooltip content={`${count} rapports non remis`}>
      <Badge appearance="important">{count}</Badge>
    </Tooltip>
  ) : null;
};

const getLatePublishersCountForGroup = (
  publishers: Publisher[],
  groupId: string,
  repports: Repport[]
) => {
  if (groupId === 'inactives') {
    return publishers.length;
  }

  const groupPublishers = publishers.filter((p) =>
    filterNonInactiveAndNonPioneersOut(p, groupId)
  );
  const latePublishers = groupPublishers.filter(
    (publisher) =>
      !repports.some((repport) => repport.publisherId === publisher.id)
  );

  return latePublishers.length;
};

const getGroupLink = (groupId: string): string => {
  const user = Users.getCurrent();

  if (user.groupId !== groupId && !user.admin) {
    return '/groups/unauthorized';
  }

  return `/groups/${groupId}`;
};
