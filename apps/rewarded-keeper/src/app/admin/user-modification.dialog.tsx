import { User } from "../types";
import { ModalTransition } from '@atlaskit/modal-dialog';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button';
import { Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Users } from "../data";
import { useState } from "react";

interface Props {
    user: User;
    onClose: () => void;
}

export function UserModificationDialog({ user, onClose }: Props) {
    const dispatch = useDispatch();
    const [isAdmin, setIsAdmin] = useState(user.admin);

    return (
        <Modal onClose={onClose}>
            <ModalTransition>
                <ModalHeader>
                <ModalTitle>{user.displayName} | Modification</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Administrateur</Form.Label>
                            <Form.Check
                                checked={isAdmin}
                                onChange={(e) => {
                                    dispatch(Users.slice.actions.updated({ ...user, admin: e.target.checked }));
                                    setIsAdmin(e.target.checked);
                                }}
                            />
                        </Form.Group>
                    </Form>
                </ModalBody>
                <ModalFooter>
                <Button
                    appearance={'primary'}
                    onClick={async () => {
                        await Users.update({ ...user, admin: isAdmin });
                        onClose();
                    }}
                >
                    Confirmer
                </Button>
                <Button appearance="subtle" onClick={() => onClose()}>
                    Anuller
                </Button>
                </ModalFooter>
            </ModalTransition>
        </Modal>
    );
}
