import { Submission } from '../types';
import Popup from '@atlaskit/popup';
import Table from 'react-bootstrap/Table';
import { useState } from 'react';
import { Badge } from 'react-bootstrap';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import Button from '@atlaskit/button';
import { Users } from '../data';
import SendIcon from '@atlaskit/icon/glyph/send';
import { getLastSixMonths } from '../utils';
import WorldIcon from '@atlaskit/icon/glyph/world';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';

export function SubmissionEntry({ submission }: { submission: Submission }) {
  const [isOpen, setIsOpen] = useState(false);
  const month = getLastSixMonths()[0];
  const jwSubmissionLink = `https://hub.jw.org/congregation-reports/fr/9dce4501-3a5a-46c2-9089-94f9a64da0d5/monthly-reports/${
    month.year
  }/${month.month + 1}/submited`;
  const jwSubmissionEditLink = `https://hub.jw.org/congregation-reports/fr/9dce4501-3a5a-46c2-9089-94f9a64da0d5/monthly-reports/${
    month.year
  }/${month.month + 1}/edit`;

  return (
    <Popup
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-start"
      content={() => <PopupContent submission={submission} />}
      trigger={(triggerProps) => (
        <li className="list-group-item justify-content-between align-items-center"
          style={{display: 'flex', flexDirection: 'row'}}
        >
          <Badge bg="primary">{submission.all.sheets}</Badge>
          <span style={{ display: 'flex', flexDirection: 'row'}}>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              appearance="subtle-link"
              {...triggerProps}
              css={{ textOverflow: 'ellipsis'}}
            >
              Soumission du{' '}
              {submission.date.toDate().toLocaleDateString('fr-FR')}
            </Button>
          </span>

          <span>
            <Button
              appearance="link"
              href={jwSubmissionEditLink}
              target="_blank"
              iconBefore={<EditFilledIcon label="" />}
              isDisabled={!Users.getCurrent().admin}
            ></Button>
            <Button
              appearance="link"
              href={jwSubmissionLink}
              target="_blank"
              iconBefore={<WorldIcon label="" />}
              isDisabled={!Users.getCurrent().admin}
            ></Button>
            <Button
              appearance="subtle"
              onClick={() => sendSubmission(submission)}
              iconBefore={<SendIcon label="" />}
              isDisabled={!Users.getCurrent().admin}
            ></Button>
            <Button
              appearance="subtle"
              onClick={() => getAndDownloadSubmissionFile(submission)}
              iconBefore={<DownloadIcon label="" />}
              isDisabled={!Users.getCurrent().admin}
            ></Button>
          </span>
        </li>
      )}
    />
  );
}

function PopupContent({ submission }: { submission: Submission }) {
  return (
    <div style={{ padding: 16 }}>
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

function sendSubmission(submission: Submission) {
  const anchorNode = document.createElement('a');
  const month = getLastSixMonths()[0];
  const body = encodeURIComponent(getSubmissionMessageBody(submission));

  anchorNode.setAttribute(
    'href',
    `mailto:SRV.CD@bethel.jw.org?subject=S-10 | ${month.toLocaleFullMonth()}&body=${body}`
  );
  document.body.appendChild(anchorNode);
  anchorNode.click();
  anchorNode.remove();
}

function getSubmissionMessageBody(submission: Submission): string {
  return `Proclamateurs\n=============\nNombre Rapports: ${submission.publishers.sheets}\nPublications: ${submission.publishers.publications}\nVidéos: ${submission.publishers.videos}\nHeures: ${submission.publishers.hours}\nNouvelles visites: ${submission.publishers.visits}\nCours bibliques: ${submission.publishers.studies}\n\nPionniers Auxiliaires\n=====================\nNombre Rapports: ${submission.auxilaryPioneers.sheets}\nPublications: ${submission.auxilaryPioneers.publications}\nVidéos: ${submission.auxilaryPioneers.videos}\nHeures: ${submission.auxilaryPioneers.hours}\nNouvelles visites: ${submission.auxilaryPioneers.visits}\nCours Bibliques: ${submission.auxilaryPioneers.studies}\n\nPIonniers permanents\n=====================\nNombre Rapports: ${submission.regularPionners.sheets}\nPublications: ${submission.regularPionners.publications}\nVidéos: ${submission.regularPionners.videos}\nHeures: ${submission.regularPionners.hours}\nNouvelles visites: ${submission.regularPionners.visits}\nCours Bibliques: ${submission.regularPionners.studies}\n\n
`;
}

function getAndDownloadSubmissionFile(submission: Submission) {
  const dataStr =
    'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(submission));
  const downloadAnchorNode = document.createElement('a');
  const exportName = `s10-${submission.date
    .toDate()
    .toLocaleDateString('fr-FR')
    .replace('/', '.')}`;

  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', exportName + '.json');
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
