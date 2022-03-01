import Banner from "@atlaskit/banner";
import Button from "@atlaskit/button";
import Modal, { ModalHeader, ModalTitle, ModalTransition, ModalBody, ModalFooter } from "@atlaskit/modal-dialog";
import { useEffect, useState } from "react";
import { Dropdown, DropdownButton, Form } from "react-bootstrap";
import { Groups } from "../data/groups";
import { Publishers } from "../data/publishers";
import { Publisher } from "../types";
import WarningIcon from '@atlaskit/icon/glyph/warning';

export interface CreateGroupModalProps {
    show: boolean;
    onHide: () => void;
}

interface ValidationParams {
    groupName: string;
    groupId: string
    groupOverseerId: string | null;
    onHide: () => void;
    setError: (error: any) => void
}

export const CreateGroupModal = (props: CreateGroupModalProps) => {
    const [ groupName, setGroupName ] = useState<string>('');
    const [ groupId, setGroupId ] = useState<string>('');
    const [ groupOverseerId, setGroupOverseerId ] = useState<string | null>('');
    const [ elders, setElders ] = useState<Publisher[]>([]);
    const [ error, setError ] = useState('');
    const dependency = JSON.stringify(elders);

    useEffect(() => {
        Publishers.elders()
            .then((data) => setElders(data), (err) => console.error(err));
    }, [dependency]);
    
    return (
      <Modal>
        <ModalTransition>
          <ModalHeader>
              <ModalTitle>Ajouter un groupe</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Form>
              {error && <Banner
                    appearance="warning"
                    icon={<WarningIcon label="" secondaryColor="inherit" />}
                    isOpen
                  >
                  {error}
              </Banner>}
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Nom du groupe</Form.Label>
                <Form.Control type="text" placeholder="John Doe" onChange={(e) => {
                    setGroupName(e.target.value);
                    setGroupId(e.target.value.replace(/ /g, '-').trim());
                }}/>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Identifiant</Form.Label>
                <Form.Control type="text" value={groupId} disabled={true}/>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Responsable</Form.Label>
                <DropdownButton
                  title={getElderFullNameById(groupOverseerId, elders)}
                  onSelect={(v) => v ? setGroupOverseerId(elders[Number(v)].id || '') : null}
                >
                  { elders.map((elder, index) => <Dropdown.Item key={index} eventKey={index}> {getElderFullName(elder)}</Dropdown.Item>) }
                </DropdownButton>
              </Form.Group>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button appearance="primary" onClick={() => onValidate({
                groupId,
                groupOverseerId,
                groupName,
                onHide: props.
                onHide,
                setError
            })}>
              Ajouter
            </Button>
            <Button appearance="subtle" onClick={props.onHide}>
              Fermer
            </Button>
          </ModalFooter>
        </ModalTransition>
      </Modal>
  );
};

const getElderFullNameById = (id: string | null, elders: Publisher[]) => {
  if (!id) return '';

  const elder = elders.find(e => e.id === id);

  if (elder) {
    return getElderFullName(elder);
  }

  return '';
}

const getElderFullName = (elder: Publisher) => {
  return (elder.name + ' ' + elder.lastName + ' ' + elder.firstName).trim();
}

const onValidate = (params: ValidationParams) => {
    if (!!params.groupName && !!params.groupOverseerId) {
      Groups.create({ id: params.groupId, overseerId: params.groupOverseerId, name: params.groupName })
        .then(() => {
          params.onHide();
        })
        .catch((error: any) => {
          params.setError(error?.message);
        });
    } else {
      params.setError('Le formulaire contient des erreurs. Veuillez les corriger avant de continuer.');
    }
  }
