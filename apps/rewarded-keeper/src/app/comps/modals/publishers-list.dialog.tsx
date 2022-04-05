import Button from '@atlaskit/button';
import EmptyState from '@atlaskit/empty-state';
import Modal, {
    ModalHeader,
    ModalTitle,
    ModalTransition,
    ModalBody,
    ModalFooter,
} from '@atlaskit/modal-dialog';
import { getPublisherName } from '../../content-panel/util';
import { Publisher } from '../../types';

interface Props {
    publishers: Publisher[];
    onHide: () => void;
};

export const PublishersListDialog = (props: Props) => {
    return (
        <Modal>
            <ModalTransition>
                <ModalHeader>
                    <ModalTitle>Proclamateurs ayant rapporté</ModalTitle>
                </ModalHeader>
                <ModalBody>
                   {
                       props.publishers.length === 0 ? renderEmptyState() : renderPublishers(props)
                   }
                </ModalBody>
                <ModalFooter>
                    <Button
                        appearance="subtle"
                        onClick={props.onHide}
                    >
                        Fermer
                    </Button>
                </ModalFooter>
            </ModalTransition>
        </Modal>
    );
}

const renderEmptyState = () => {
    return <EmptyState header="Aucun proclamateur dans cette catégorie n'a rapporté" />;
}

const renderPublishers = (props: Props) => {
    return (
        <ul className="list-group">
            {
                props.publishers.map((publisher: Publisher) => {
                    return <li className="list-group-item">{getPublisherName(publisher)}</li>
                })
            }
        </ul>
    );
}