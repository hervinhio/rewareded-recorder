import { CSSProperties } from '@atlaskit/atlassian-navigation/dist/types/theme/types';
import EmptyState from '@atlaskit/empty-state';
import InlineDialog from '@atlaskit/inline-dialog';
import Page from '@atlaskit/page';
import {
  NavigationContent,
  Section,
} from '@atlaskit/side-navigation';
import { NavItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getPublisherName } from '../content-panel/util';
import { Group, Publisher } from '../types';
import './search-popup.scss';

interface PopupContentsProps {
  groups: Group[];
  publishers: Publisher[];
  onClose: () => void;
}

interface Props extends PopupContentsProps {
  isOpen: boolean;
  children: React.ReactNode;
}

const linkStyle = { textDecoration: 'none', color: '#000' } as CSSProperties;

export function SearchPopup(props: Props) {
  return (
    <InlineDialog
      isOpen={props.isOpen}
      onClose={() => props.onClose()}
      content={
        <PopupContents
          groups={props.groups}
          publishers={props.publishers}
          onClose={props.onClose}
        />
      }
      placement="bottom-end"
    >
      {props.children}
    </InlineDialog>
  );
}

function PopupContents(props: PopupContentsProps) {
  if (
    props.groups.length === props.publishers.length &&
    props.groups.length === 0
  ) {
    return (
      <EmptyState
        header="Aucun resultat"
        description="Aucun groupe ou aucun utilisateur ne correspond aux critères de recherche."
      />
    );
  }

  return (
    <PopupContentsList
      publishers={props.publishers}
      groups={props.groups}
      onClose={props.onClose}
    />
  );
}

function PopupContentsList(props: PopupContentsProps) {
  return (
    <div className="inline-dialog">
      <Page>
        <NavigationContent>
          <Section title="Groupes">
            {props.groups.map((group: Group, index: number) => {
              return (
                <Link
                  to={`/groups/${group.id}`}
                  replace={true}
                  style={linkStyle as any}
                  onClick={() => props.onClose()}
                  key={index}
                >
                  <NavItem>{group.name}</NavItem>
                </Link>
              );
            })}
          </Section>

          <Section title="Proclamateurs">
            {props.publishers.map((pub: Publisher, index: number) => {
              return (
                <Link
                  to={`/groups/${pub.groupId}/${pub.id}`}
                  replace={true}
                  style={linkStyle as any}
                  onClick={() => props.onClose()}
                  key={index}
                >
                  <NavItem>{getPublisherName(pub)}</NavItem>
                </Link>
              );
            })}
          </Section>
        </NavigationContent>
      </Page>
    </div>
  );
}
