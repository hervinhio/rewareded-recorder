import './search.dialog.scss';
import { Link } from 'react-router-dom';
import { getPublisherName } from '../../content-panel/util';
import { Group, Publisher } from '../../types';
import { ChangeEvent, useState } from 'react';
import { ListGroup, ModalTitle } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { GlobalState } from '../../data';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTrigger,
  Field,
  Input,
  makeStyles,
  Persona,
  tokens,
} from '@fluentui/react-components';
import { List, ListItem } from '@fluentui/react-list-preview';
import { PeopleTeamFilled } from '@fluentui/react-icons';
import { EmptyState } from '../empty-state';

interface PopupContentsProps {
  groups: Group[];
  publishers: Publisher[];
  onClose: () => void;
}

interface Props {
  onClose: () => void;
  show: boolean;
}

const useClasses = makeStyles({
  links: {
    textDecoration: 'none',
    color: tokens.colorNeutralForeground2Link,
  },
  listItem: {
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2,
      color: tokens.colorNeutralStrokeOnBrand2,
    },
  },
  searchField: {
    marginBottom: '16px',
  },
});

export function SearchModal(props: Props) {
  const [value, setValue] = useState<string>('');
  const { groups, publishers } = useSelector((state: GlobalState) => ({
    groups: state.groups.groups,
    publishers: state.publishers.publishers,
  }));
  const styles = useClasses();

  return (
    <Dialog open={props.show}>
      <DialogSurface>
        <ModalTitle>Rechercher un proclamateur</ModalTitle>
        <DialogBody>
          <DialogContent>
            <Field label="Nom" className={styles.searchField}>
              <Input
                name="nom"
                onChange={(event: ChangeEvent) =>
                  setValue((event.target as HTMLInputElement).value)
                }
              />
            </Field>
            <PopupContents
              groups={filterGroups(groups, value)}
              publishers={filterPublishers(publishers, value)}
              onClose={props.onClose}
            />
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" onClick={() => props.onClose()}>
                Annuler
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
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
  const styles = useClasses();

  return (
    <List style={{ width: 'calc(100% - 32px)' }}>
      {props.groups.map((group: Group) => {
        return (
          <Link
            to={`/groups/${group.id}`}
            replace={true}
            className={styles.links}
            onClick={() => props.onClose()}
            key={group.id}>
            <ListItem className={styles.searchField}>
              <Persona
                name={group.name}
                role="gridcell"
                avatar={<PeopleTeamFilled />}
              />
              {group.name}
            </ListItem>
          </Link>
        );
      })}

      {props.publishers.map((pub: Publisher) => {
        return (
          <Link
            to={`/groups/${pub.groupId}/${pub.id}`}
            replace={true}
            className={styles.links}
            onClick={() => props.onClose()}
            key={pub.id}>
            <ListItem className={styles.searchField}>
              <Persona
                name={getPublisherName(pub)}
                role="gridcell"
                avatar={<PeopleTeamFilled />}
              />
            </ListItem>
          </Link>
        );
      })}
    </List>
  );
}

function filterPublishers(
  publishers: Publisher[],
  searchValue: string,
): Publisher[] {
  if (!searchValue) return [];

  return publishers.filter((p) =>
    getPublisherName(p)
      .toLocaleLowerCase()
      .includes(searchValue.toLocaleLowerCase()),
  );
}

function filterGroups(groups: Group[], searchValue: string): Group[] {
  if (!searchValue) return [];

  return groups.filter((g) =>
    g.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()),
  );
}
