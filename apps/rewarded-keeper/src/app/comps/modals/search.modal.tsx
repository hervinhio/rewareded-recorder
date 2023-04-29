import './search.modal.scss';
import { CSSProperties } from '@atlaskit/atlassian-navigation/dist/types/theme/types';
import EmptyState from '@atlaskit/empty-state';
import { Section } from '@atlaskit/side-navigation';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { Link } from 'react-router-dom';
import { getPublisherName } from '../../content-panel/util';
import { Group, Publisher } from '../../types';
import Button from '@atlaskit/button';
import Textfield from '@atlaskit/textfield';
import { Field, HelperMessage } from '@atlaskit/form';
import { Fragment, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import SearchIcon from '@atlaskit/icon/glyph/search';
import { useSelector } from 'react-redux';
import { GlobalState } from '../../data';
import { token } from '@atlaskit/tokens';

interface PopupContentsProps {
  groups: Group[];
  publishers: Publisher[];
  onClose: () => void;
}

interface Props {
  onClose: () => void;
}

const linkStyle = {
  textDecoration: 'none',
  color: token('color.text'),
  backgroundColor: token('color.background.neutral'),
} as CSSProperties;

export function SearchModal(props: Props) {
  const [value, setValue] = useState<string>('');
  const { groups, publishers } = useSelector((state: GlobalState) => ({
    groups: state.groups.groups,
    publishers: state.publishers.publishers,
  }));

  return (
    <Modal shouldCloseOnEscapePress={true} onClose={props.onClose}>
      <ModalTransition>
        <ModalHeader>
          <ModalTitle>Rechercher</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Field label="Recherche" name="search">
            {({ fieldProps }) => (
              <Fragment>
                <Textfield
                  placeholder="Nom"
                  {...fieldProps}
                  onChange={(event: any) => setValue(event.target.value)}
                  value={value}
                  elemBeforeInput={<SearchIcon label="" />}
                />
                <HelperMessage>
                  Nom du proclamateur ou du groupe de prédication à rechercher
                </HelperMessage>
              </Fragment>
            )}
          </Field>
          <PopupContents
            groups={filterGroups(groups, value)}
            publishers={filterPublishers(publishers, value)}
            onClose={props.onClose}
          />
        </ModalBody>
        <ModalFooter>
          <Button appearance="subtle" onClick={() => props.onClose()}>
            Fermer
          </Button>
        </ModalFooter>
      </ModalTransition>
    </Modal>
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
  const style = { backgroundColor: token('elevation.surface.overlay') };

  return (
    <div className="inline-dialog" style={style}>
      <ListGroup style={{ width: 'calc(100% - 32px)' }}>
        <Section title="Groupes">
          {props.groups.map((group: Group) => {
            return (
              <Link
                to={`/groups/${group.id}`}
                replace={true}
                style={linkStyle as any}
                onClick={() => props.onClose()}
                key={group.id}
              >
                <ListGroup.Item
                  style={{
                    color: token('color.text'),
                    backgroundColor: token('color.background.neutral'),
                  }}
                >
                  {group.name}
                </ListGroup.Item>
              </Link>
            );
          })}
        </Section>

        <Section title="Proclamateurs">
          {props.publishers.map((pub: Publisher) => {
            return (
              <Link
                to={`/groups/${pub.groupId}/${pub.id}`}
                replace={true}
                style={linkStyle as any}
                onClick={() => props.onClose()}
                key={pub.id}
              >
                <ListGroup.Item>{getPublisherName(pub)}</ListGroup.Item>
              </Link>
            );
          })}
        </Section>
      </ListGroup>
    </div>
  );
}

function filterPublishers(
  publishers: Publisher[],
  searchValue: string
): Publisher[] {
  if (!searchValue) return [];

  return publishers.filter((p) =>
    getPublisherName(p)
      .toLocaleLowerCase()
      .includes(searchValue.toLocaleLowerCase())
  );
}

function filterGroups(groups: Group[], searchValue: string): Group[] {
  if (!searchValue) return [];

  return groups.filter((g) =>
    g.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
  );
}
