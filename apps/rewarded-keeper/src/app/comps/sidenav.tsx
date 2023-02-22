import {
  Header,
  NavigationContent,
  NavigationHeader,
  NestableNavigationContent,
  NestingItem,
  SideNavigation,
} from '@atlaskit/side-navigation';
import { ButtonItem, Section } from '@atlaskit/menu';
import { CSSProperties, useEffect, useState } from 'react';
import { Events, Group, Publisher, Repport } from '../types';
import { Groups, Users } from '../data';
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
import { Flags } from '../data/flags';

interface Props {
  onClose: () => void;
}

export const Sidenav = (props: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [showCreatePublisherModal, setShowCreatePublisherModal] =
    useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showRepportModal, setShowRepportModal] = useState(false);
  const isAdmin = Users.getCurrent().admin;
  const linkStyle = { textDecoration: 'none', color: '#000' } as CSSProperties;
  const dispatch = useDispatch();
  const { groups, reports, publishers } = useSelector((state: GlobalState) => {
    return {
      groups: state.groups,
      reports: state.reports,
      publishers: state.publishers,
    };
  }, shallowEqual);

  useEffect(() => {
    isAuthenticated().then(
      () => setUser(auth.currentUser),
      Flags.raiseError
    );
  }, []);

  return (
    <SideNavigation label="Navigation" testId="side-navigation">
      <NavigationContent>
        <NavigationHeader>
          <Header description="">
            <div
              className="navigation-back-button"
              onClick={() => props.onClose()}
            >
              <ArrowLeftIcon size="medium" label="" />
            </div>
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
                src={avatar}
                style={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  left: 0,
                  right: 0,
                  height: 72,
                  width: 72,
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
            <ButtonItem iconBefore={<HomeIcon label="" />}>Accueil</ButtonItem>
          </Link>
        </Section>

        <Section title="Groupes">
          {groups.groups.map((group: Group, index: number) => {
            return (
              <Link
                to={`/groups/${group.id}`}
                replace={true}
                style={linkStyle}
                key={index}
                onClick={() => {
                  dispatch(Groups.slice.actions.selected(group));
                  props.onClose();
                }}
              >
                <ButtonItem
                  iconBefore={<PeopleGroupIcon label="" />}
                  isSelected={group.id === groups.active?.id}
                  iconAfter={getGroupIconAfter(
                    group.id,
                    reports.current,
                    publishers.publishers
                  )}
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
              iconAfter={getGroupIconAfter(
                'unafiliated',
                reports.current,
                publishers.publishers
              )}
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

const getGroupIconAfter = (
  groupId: string,
  repports: Repport[],
  publishers: Publisher[]
) => {
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
  const groupPublishers = publishers.filter(
    (publisher) => publisher.groupId === groupId
  );
  const latePublishers = groupPublishers.filter(
    (publisher) =>
      !repports.some((repport) => repport.publisherId === publisher.id)
  );

  return latePublishers.length;
};
