import { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home24Filled,
  Home24Regular,
  BroadActivityFeed24Filled,
  BroadActivityFeed24Regular,
  PeopleCommunity24Filled,
  PeopleCommunity24Regular,
  Settings24Filled,
  Settings24Regular,
} from '@fluentui/react-icons';
import { tokens } from '@fluentui/react-components';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../data';
import { Users } from '../data';
import './bottom-nav.scss';

export const BottomNav = () => {
  const user = Users.getCurrent();
  const location = useLocation();

  const { publishers } = useSelector(
    (state: GlobalState) => ({
      publishers: state.publishers.publishers,
    }),
    shallowEqual,
  );

  const currentPublisher = publishers.find((p) => user.publisherId === p.id);
  const groupLink = `/groups/${currentPublisher?.groupId || 'unafiliated'}`;
  const mySheetLink = currentPublisher
    ? `/groups/${currentPublisher.groupId || 'unafiliated'}/${currentPublisher.id}`
    : null;

  const isActive = (path: string) => location.pathname === path;

  const linkStyle: CSSProperties = {
    textDecoration: 'none',
  };

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <Link
        to="/"
        replace
        style={linkStyle}
        className={`bottom-nav-item${isActive('/') ? ' active' : ''}`}>
        {isActive('/') ? <Home24Filled /> : <Home24Regular />}
        <span>Accueil</span>
      </Link>

      <Link
        to={groupLink}
        replace
        style={linkStyle}
        className={`bottom-nav-item${isActive(groupLink) ? ' active' : ''}`}>
        {isActive(groupLink) ? (
          <PeopleCommunity24Filled />
        ) : (
          <PeopleCommunity24Regular />
        )}
        <span>Mon groupe</span>
      </Link>

      {mySheetLink && (
        <Link
          to={mySheetLink}
          replace
          style={linkStyle}
          className={`bottom-nav-item${isActive(mySheetLink) ? ' active' : ''}`}>
          {isActive(mySheetLink) ? (
            <BroadActivityFeed24Filled />
          ) : (
            <BroadActivityFeed24Regular />
          )}
          <span>Ma fiche</span>
        </Link>
      )}

      <Link
        to="/settings"
        replace
        style={linkStyle}
        className={`bottom-nav-item${isActive('/settings') ? ' active' : ''}`}>
        {isActive('/settings') ? <Settings24Filled /> : <Settings24Regular />}
        <span>Paramètres</span>
      </Link>
    </nav>
  );
};
