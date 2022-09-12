import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import { Publisher, Group, Events, Month } from '../types';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import Banner from '@atlaskit/banner';
import { Groups, Publishers } from '../data';
import React from 'react';
import Button from '@atlaskit/button';
import { FirebaseError } from 'firebase/app';
import { MovingTrainIcon } from '../comps';
import { getMonthsToAYear } from '../utils';

interface Props {
  publisher: Publisher;
  publishers?: Publisher[];
  onHide: () => void;
}

interface State {
  groupId: string;
  groups: Group[];
  error: any;
  page: number;
  isLoading: boolean;
  changeCount: number;
  auxilaryPionnerFor: string[];
  isBulkEdit: boolean;
}

export class PublisherModificationView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      groupId:
        (props.publishers?.length || 0) > 0
          ? props.publishers?.[0].groupId || 'unafiliated'
          : props.publisher.groupId,
      error: null,
      groups: [],
      page: 0,
      isLoading: false,
      changeCount: 0,
      auxilaryPionnerFor: [],
      isBulkEdit: (props.publishers?.length || 0) > 0,
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
            value={this.state.isBulkEdit ? '(Many)' : publisher.firstName}
            disabled={this.state.isLoading || this.state.isBulkEdit}
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
            disabled={this.state.isLoading || this.state.isBulkEdit}
            value={this.state.isBulkEdit ? '(Many)' : publisher.name}
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
            value={this.state.isBulkEdit ? '(Many)' : publisher.lastName}
            disabled={this.state.isLoading || this.state.isBulkEdit}
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
            checked={this.state.isBulkEdit ? false : publisher.isElder}
            disabled={this.state.isLoading || this.state.isBulkEdit}
            onChange={(e) => {
              publisher.isElder = e.target.checked;
              this.setState({ changeCount: this.state.changeCount + 1 });
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Check
            type="checkbox"
            checked={this.state.isBulkEdit ? false : publisher.isRegularPioneer}
            label="Pionnier Permanent ?"
            disabled={this.state.isLoading || this.state.isBulkEdit}
            onChange={(e) => {
              publisher.isRegularPioneer = e.target.checked;
              this.setState({ changeCount: this.state.changeCount + 1 });
            }}
          />
        </Form.Group>

        <Form.Select
          aria-label="Pionier auxiliaire pour"
          multiple={true}
          disabled={this.state.isLoading || this.state.isBulkEdit}
          onChange={(event) => {
            const selectedValues: string[] = [];
            for (var i = 0; i < event.target.selectedOptions.length; i++) {
              const option = event.target.selectedOptions.item(i);

              if (option) {
                selectedValues.push(option.value);
              }
            }

            publisher.auxilaryPionierFor = selectedValues;
            this.setState({ auxilaryPionnerFor: selectedValues });
          }}
        >
          {this.state.isBulkEdit
            ? '(Many)'
            : getMonthsToAYear().map((month: Month, id: number) => {
                return (
                  <option
                    selected={publisher.auxilaryPionierFor?.includes(
                      month.getKey()
                    )}
                    key={id}
                    value={month.getKey()}
                  >
                    {month.toLocaleFullMonth()}
                  </option>
                );
              })}
        </Form.Select>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Groupe de prédication</Form.Label>
          <DropdownButton
            title={this.getGroupName(groupId, groups)}
            disabled={this.state.isLoading}
            onSelect={(v) => {
              if (v) {
                this.setState({ groupId: groups[Number(v)].id });
                if (this.state.isBulkEdit) {
                  this.props.publishers?.forEach((p) => {
                    p.groupId = groups[Number(v)].id;
                  });
                  return;
                }
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
    if (this.state.isBulkEdit) {
      return Publishers.transferToGroup(
        this.props.publishers || [],
        this.state.groupId
      )
        .then(() => {
          this.props.onHide();
          Events.emit('publisher_updated');
        })
        .catch((error: FirebaseError) => {
          this.setState({ error: error.message });
        });
    }

    return Publishers.save(this.props.publisher)
      .then(() => {
        this.props.onHide();
        Events.emit('publisher_updated');
      })
      .catch((error: FirebaseError) => {
        this.setState({ error: error.message });
      });
  }

  getGroupName = (groupId: string, groups: Group[]) => {
    return groups.find((group) => group.id === groupId)?.name || 'Non affilié';
  };
}
