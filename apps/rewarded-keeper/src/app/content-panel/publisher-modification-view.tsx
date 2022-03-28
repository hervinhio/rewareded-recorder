import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { Publisher, Group, Events } from '../types';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Banner from '@atlaskit/banner';
import { Groups, Publishers } from '../data';
import React from 'react';
import Button from '@atlaskit/button';
import { FirebaseError } from 'firebase/app';
import { MovingTrainIcon } from '../comps';

interface Props {
  publisher: Publisher;
  onHide: () => void;
}

interface State {
  groupId: string;
  groups: Group[];
  error: any;
  page: number;
  isLoading: boolean;
  changeCount: number;
}

export class PublisherModificationView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      groupId: props.publisher.groupId,
      error: null,
      groups: [],
      page: 0,
      isLoading: false,
      changeCount: 0,
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });

    Groups.get()
      .then(
        (g) => this.setState({ groups: g }),
        (err) => console.error(err)
      )
      .then(() => this.setState({ isLoading: false }));
  }

  render() {
    const error = this.state.error;
    const groupId = this.state.groupId;
    const groups = this.state.groups;
    const publisher = this.props.publisher;

    return (
      <Form style={{ width: '100%' }}>
        <Form.Group className="mb-3">
          <h4>Modification du proclamateur</h4>
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
        {this.state.isLoading && <MovingTrainIcon />}
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Prénom</Form.Label>
          <Form.Control
            type="text"
            placeholder="Patrick"
            value={publisher.firstName}
            disabled={this.state.isLoading}
            onChange={(e) => {
              publisher.firstName = e.target.value;
              this.setState({ changeCount: this.state.changeCount + 1 });
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Nom</Form.Label>
          <Form.Control
            type="text"
            placeholder="Irenge"
            disabled={this.state.isLoading}
            value={publisher.name}
            onChange={(e) => {
              publisher.name = e.target.value;
              this.setState({ changeCount: this.state.changeCount + 1 });
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Post-nom</Form.Label>
          <Form.Control
            type="text"
            placeholder="Kiyuka"
            value={publisher.lastName}
            disabled={this.state.isLoading}
            onChange={(e) => {
              publisher.lastName = e.target.value;
              this.setState({ changeCount: this.state.changeCount + 1 });
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Check
            type="checkbox"
            label="Ancien ?"
            checked={publisher.isElder}
            disabled={this.state.isLoading}
            onChange={(e) => {
              publisher.isElder = e.target.checked;
              this.setState({ changeCount: this.state.changeCount + 1 });
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Check
            type="checkbox"
            checked={publisher.isRegularPioneer}
            label="Pionnier Permanent ?"
            disabled={this.state.isLoading}
            onChange={(e) => {
              publisher.isRegularPioneer = e.target.checked;
              this.setState({ changeCount: this.state.changeCount + 1 });
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Check
            type="checkbox"
            label="Pionnier Auxiliaire ?"
            checked={publisher.isAuxylaryPioneer}
            disabled={this.state.isLoading}
            onChange={(e) => {
              publisher.isAuxylaryPioneer = e.target.checked;
              this.setState({ changeCount: this.state.changeCount + 1 });
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Groupe de prédication</Form.Label>
          <DropdownButton
            title={getGroupName(groupId, groups)}
            disabled={this.state.isLoading}
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

        <Form.Group className="mt-5">
          <Button
            appearance="subtle"
            onClick={() => this.props.onHide()}
            isDisabled={this.state.isLoading}
          >
            Retour
          </Button>
          <Button
            appearance="primary"
            onClick={() => {
              this.setState({ isLoading: true });
              this.savePublisher().finally(() =>
                this.setState({ isLoading: false })
              );
            }}
            isDisabled={this.state.isLoading}
          >
            Enregistrer
          </Button>
        </Form.Group>
      </Form>
    );
  }

  savePublisher() {
    return Publishers.save(this.props.publisher)
      .then(() => {
        this.props.onHide();
        Events.emit('publisher_updated');
      })
      .catch((error: FirebaseError) => {
        this.setState({ error: error.message });
      });
  }
}

const getGroupName = (groupId: string, groups: Group[]) => {
  return groups.find((group) => group.id === groupId)?.name || 'Non affilié';
};
