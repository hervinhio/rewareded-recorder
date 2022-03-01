import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { Publisher, Group } from '../types';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Banner from '@atlaskit/banner';
import { Groups, Publishers } from '../data';
import { Timestamp } from 'firebase/firestore';
import React from 'react';
import Button from '@atlaskit/button';
import { FirebaseError } from 'firebase/app';

interface Props {
  publisher: Publisher;
  onHide: () => void;
}

interface State {
  groupId: string;
  groups: Group[];
  error: any;
  page: number;
}

export class PublisherModificationView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      groupId: props.publisher.groupId,
      error: null,
      groups: [],
      page: 0,
    };
  }

  componentDidMount() {
    Groups.get().then(
      (g) => this.setState({ groups: g }),
      (err) => console.error(err)
    );
  }

  render() {
    const error = this.state.error;
    const groupId = this.state.groupId;
    const groups = this.state.groups;
    const publisher = this.props.publisher;

    let birthDateValue = formatTimestampToDate(publisher.birthDate);
    let baptismDateValue = publisher.baptismDate ? formatTimestampToDate(publisher.baptismDate) : '';

    return (
      <Form style={{ width: '100%' }}>
        <Form.Group className="mb-3">
          <h4>Modification du proclamateur</h4>
          <Button appearance="subtle" onClick={() => this.props.onHide()}>
            Retour
          </Button>
          <Button appearance="primary" onClick={() => this.savePublisher()}>
            Enregistrer
          </Button>
        </Form.Group>
        {error && (
          <Banner
            appearance="warning"
            icon={<WarningIcon label="" secondaryColor="inherit" />}
            isOpen
          >
            {error}
          </Banner>
        )}
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Prénom</Form.Label>
          <Form.Control
            type="text"
            placeholder="Patrick"
            value={publisher.firstName}
            onChange={(e) => {
              publisher.firstName = e.target.value;
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Nom</Form.Label>
          <Form.Control
            type="text"
            placeholder="Irenge"
            value={publisher.name}
            onChange={(e) => {
              publisher.name = e.target.value;
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Post-nom</Form.Label>
          <Form.Control
            type="text"
            placeholder="Kiyuka"
            value={publisher.lastName}
            onChange={(e) => {
              publisher.lastName = e.target.value;
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Date de naissance</Form.Label>
          <Form.Control
            type="date"
            value={birthDateValue}
            onChange={(e) => {
              publisher.birthDate = Timestamp.fromDate(
                new Date(e.target.value)
              );
              birthDateValue = e.target.value;
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Date de baptême</Form.Label>
          <Form.Control
            type="date"
            value={baptismDateValue}
            onChange={(e) => {
              publisher.baptismDate = Timestamp.fromDate(
                new Date(e.target.value)
              );
              baptismDateValue = e.target.value;
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Check
            type="checkbox"
            label="Ancien ?"
            checked={publisher.isElder}
            onChange={(e) => {
              publisher.isElder = e.target.checked;
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Check
            type="checkbox"
            checked={publisher.isRegularPioneer}
            label="Pionnier Permanent ?"
            onChange={(e) => {
              publisher.isRegularPioneer = e.target.checked;
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Check
            type="checkbox"
            label="Pionnier Auxiliaire ?"
            checked={publisher.isAuxylaryPioneer}
            onChange={(e) => {
              publisher.isAuxylaryPioneer = e.target.checked;
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Groupe de prédication</Form.Label>
          <DropdownButton
            title={getGroupName(groupId, groups)}
            onSelect={(v) => {
              if (v) {
                this.setState({ groupId: groups[Number(v)].id });
                publisher.groupId = groups[Number(v)].id;
              }
            }}
          >
            {groups.map((group, index) => (
              <Dropdown.Item key={index} eventKey={index}>
                {' '}
                {group.name}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Form.Group>
      </Form>
    );
  }

  savePublisher() {
    Publishers.save(this.props.publisher)
      .then(() => {
        this.props.onHide();
      })
      .catch((error: FirebaseError) => {
        this.setState({ error: error.message });
      });
  }
}

const getGroupName = (groupId: string, groups: Group[]) => {
  return groups.find((group) => group.id === groupId)?.name || 'Non affilié';
};

const formatTimestampToDate = (timestamp: Timestamp) => {
  const date = timestamp.toDate();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()}`;
};
