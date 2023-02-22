import { Submission } from "../types"
import Popup from '@atlaskit/popup';
import Button from '@atlaskit/button/standard-button';
import Table from 'react-bootstrap/Table';
import { useState } from "react";
import { Badge } from "react-bootstrap";

export function SubmissionEntry({ submission }: { submission: Submission }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popup
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            placement="bottom-start"
            content={() => <PopupContent submission={submission}/>}
            trigger={(triggerProps) => (
                <li className="list-group-item d-flex justify-content-between align-items-center">
                    <Button onClick={() => setIsOpen(!isOpen)} appearance="link" {...triggerProps}>Soumission du {submission.date.toDate().toLocaleDateString('fr-FR')}</Button>
                    <Badge bg="primary">{submission.all.sheets}</Badge>
                </li>
            )}
      />
    );
}

function PopupContent({ submission }: { submission: Submission }) {
    return (
        <div style={{padding: 16}}>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Subdivision</th>
                        <th>Nb Rapports</th>
                        <th>Pub.</th>
                        <th>Vid.</th>
                        <th>Heures</th>
                        <th>Visites</th>
                        <th>Cours</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Tous</td>
                        <td>{submission.all.sheets}</td>
                        <td>{submission.all.publications}</td>
                        <td>{submission.all.videos}</td>
                        <td>{submission.all.hours}</td>
                        <td>{submission.all.visits}</td>
                        <td>{submission.all.studies}</td>
                    </tr>
                    <tr>
                        <td>Procl.</td>
                        <td>{submission.publishers.sheets}</td>
                        <td>{submission.publishers.publications}</td>
                        <td>{submission.publishers.videos}</td>
                        <td>{submission.publishers.hours}</td>
                        <td>{submission.publishers.visits}</td>
                        <td>{submission.publishers.studies}</td>
                    </tr>
                    <tr>
                        <td>Pion. Aux.</td>
                        <td>{submission.auxilaryPioneers.sheets}</td>
                        <td>{submission.auxilaryPioneers.publications}</td>
                        <td>{submission.auxilaryPioneers.videos}</td>
                        <td>{submission.auxilaryPioneers.hours}</td>
                        <td>{submission.auxilaryPioneers.visits}</td>
                        <td>{submission.auxilaryPioneers.studies}</td>
                    </tr>
                    <tr>
                        <td>Pion. Perm.</td>
                        <td>{submission.regularPionners.sheets}</td>
                        <td>{submission.regularPionners.publications}</td>
                        <td>{submission.regularPionners.videos}</td>
                        <td>{submission.regularPionners.hours}</td>
                        <td>{submission.regularPionners.visits}</td>
                        <td>{submission.regularPionners.studies}</td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );
}
