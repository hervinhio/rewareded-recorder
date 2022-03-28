import {
  Header,
  NavigationHeader,
  SideNavigation,
} from '@atlaskit/side-navigation';
import { ButtonItem, Section } from '@atlaskit/menu';
import { CSSProperties, useEffect, useState } from 'react';
import { Events, Group } from '../types';
import { Groups } from '../data';
import { Link } from 'react-router-dom';

export const Sidenav = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [counter, setCounter] = useState(0);
  const linkStyle = { textDecoration: 'none', color: '#000' } as CSSProperties;

  useEffect(() => {
    let mounted = true;
    Groups.get().then(
      (data) => {
        if (mounted) setGroups(data || []);
      },
      (err) => console.error(err)
    );

    return function () {
      mounted = false;
    };
  }, [counter]);

  useEffect(() => {
    const onGroupUpdated = () => setCounter(counter + 1);
    Events.on('group_updated', onGroupUpdated);
    return () => Events.off('group_updated', onGroupUpdated);
  });

  return (
    <SideNavigation label="Navigation" testId="side-navigation">
      <NavigationHeader>
        <Header description="Gérez les groupes ou d'autres options">
          Groupes &amp; options
        </Header>
      </NavigationHeader>
      <Section title="Groupes">
        {groups.map((group: Group, index: number) => {
          return (
            <Link
              to={`/publishers/${group.id}`}
              replace={true}
              style={linkStyle}
              key={index}
            >
              <ButtonItem>{group.name}</ButtonItem>
            </Link>
          );
        })}
        <Link to="/publishers/unafiliated" style={linkStyle} replace={true}>
          <ButtonItem>Non affilié</ButtonItem>
        </Link>
      </Section>
    </SideNavigation>
  );
};
