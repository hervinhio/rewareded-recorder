import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../data';
import { Group, Publisher } from '../types';
import { getPublisherName } from '../content-panel/util';
import { useState } from 'react';
import {
  ArrowDownloadFilled,
  LocationFilled,
  MailFilled,
  PersonCallFilled,
  PersonCircleFilled,
  PhoneFilled,
} from '@fluentui/react-icons';
import * as xlsx from 'xlsx';
import { Link } from 'react-router-dom';
import {
  Button,
  Checkbox,
  makeStyles,
  mergeClasses,
  Persona,
  Subtitle2,
  tokens,
  Toolbar,
} from '@fluentui/react-components';
import { List, ListItem } from '@fluentui/react-list-preview';

const useStyles = makeStyles({
  selectedInfo: {
    marginTop: '16px',
  },
  buttonWrapper: {
    alignSelf: 'center',
  },
  item: {
    cursor: 'pointer',
    padding: '2px 6px',
    justifyContent: 'space-between',
  },
  itemSelected: {
    backgroundColor: tokens.colorSubtleBackgroundSelected,
  },
  itemOnWarning: {
    backgroundColor: tokens.colorStatusWarningBackground2,
  },
  toolbar: {
    marginTop: '8px',
    marginBottom: '16px',
  },
  link: {
    color: tokens.colorNeutralForeground2Link,
  },
});

export function ContactsPage() {
  const [showContactLessContacts, setShowContactlessContacts] = useState(false);
  const { publishers, groups } = useSelector((state: GlobalState) => {
    return {
      publishers: showContactLessContacts
        ? state.publishers.publishers.filter((p) => !p.address || !p.telephone)
        : state.publishers.publishers,
      groups: state.groups.groups,
    };
  }, shallowEqual);
  const classes = useStyles();

  const getRowBgColor = (publisher: Publisher) => {
    if (!publisher.telephone || !publisher.address) {
      return classes.itemOnWarning;
    }

    return '';
  };

  return (
    <div>
      <Subtitle2>
        Liste des proclamateurs manquant des informations de contact
      </Subtitle2>
      <Toolbar className={classes.toolbar}>
        <Checkbox
          label="Sans info"
          onChange={(ev) => setShowContactlessContacts(ev.target.checked)}
        />
        <Button
          icon={<ArrowDownloadFilled />}
          onClick={() => generateAndDownloadContactsFile(publishers, groups)}>
          Télécharger
        </Button>
      </Toolbar>
      <List style={{ width: '100%' }} navigationMode="composite">
        {publishers.map((publisher: Publisher) => {
          return (
            <ListItem
              key={publisher.id}
              className={mergeClasses(classes.item, getRowBgColor(publisher))}>
              <Link
                role="gridcell"
                className={classes.link}
                to={`/groups/${publisher.groupId}/${publisher.id}`}>
                <Persona
                  name={getPublisherName(publisher)}
                  avatar={<PersonCircleFilled />}
                />
              </Link>

              <div role="gridcell">
                {publisher.address && <LocationFilled />}
                {publisher.emailAddress && <MailFilled />}
                {publisher.emergencyPhone && <PersonCallFilled />}
                {publisher.telephone && <PhoneFilled />}
              </div>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}

const generateAndDownloadContactsFile = (
  publishers: Publisher[],
  groups: Group[],
) => {
  const data = [
    [
      'Proclamateur',
      'Groupe',
      'Téléphone',
      'Téléphone secours',
      'Addresse',
      'Addresse email',
    ],
    ...publishers.map((p) => [
      getPublisherName(p),
      groups.find((g) => g.id === p.groupId)?.name || 'Non affilié',
      p.telephone || '',
      p.emergencyPhone || '',
      p.address || '',
      p.emailAddress || '',
    ]),
  ];

  const workbook = xlsx.utils.book_new(),
    worksheet = xlsx.utils.aoa_to_sheet(data);
  workbook.SheetNames.push('Contacts');
  workbook.Sheets['Contacts'] = worksheet;
  xlsx.writeFile(workbook, `41939 - Contacts.xlsx`);
};
