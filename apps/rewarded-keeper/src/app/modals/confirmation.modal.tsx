import { ModalTransition } from "@atlaskit/modal-dialog";
import Modal, {
    ModalHeader,
    ModalTitle,
    ModalBody,
    ModalFooter,
} from '@atlaskit/modal-dialog';
import Button from "@atlaskit/button";

interface Props {
    title: string;
    risky?: boolean;
    children: any;
    onClose: (confirmed: boolean) => void
}

export const ConfirmationModal = (props: Props) => {
    const primaryButtonAppearance = props.risky ? 'danger' : 'primary';

    return (
        <Modal>
            <ModalTransition>
                <ModalHeader>
                    <ModalTitle>{props.title}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    {props.children}
                </ModalBody>
                <ModalFooter>
                <Button
                    appearance={primaryButtonAppearance}
                    onClick={() => props.onClose(true)}
                >
                    Confirmer
                </Button>
                <Button appearance="subtle" onClick={() => props.onClose(false)}>
                    Anuller
                </Button>
                </ModalFooter>
            </ModalTransition>
        </Modal>
    );
}
