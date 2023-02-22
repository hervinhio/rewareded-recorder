import { Submission } from "../types"
import Popup from '@atlaskit/popup';
import Table from 'react-bootstrap/Table';
import { useState } from "react";
import { Badge } from "react-bootstrap";
import DownloadIcon from '@atlaskit/icon/glyph/download';
import Button from '@atlaskit/button';
import { Users } from "../data";

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
                    <span>
                        <Badge bg="primary">{submission.all.sheets}</Badge>
                        <Button onClick={() => setIsOpen(!isOpen)} appearance="subtle-link" {...triggerProps}>Soumission du {submission.date.toDate().toLocaleDateString('fr-FR')}</Button>
                    </span>
                    <Button
                        appearance="subtle"
                        onClick={() => getAndDownloadSubmissionFile(submission)}
                        iconBefore={<DownloadIcon label="" />}
                        isDisabled={!Users.getCurrent().admin}
                    >
                    </Button>
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

function getAndDownloadSubmissionFile(submission: Submission) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submission));
    const downloadAnchorNode = document.createElement('a');
    const exportName = `s10-${submission.date.toDate().toLocaleDateString('fr-FR').replace('/', '.')}`

    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
