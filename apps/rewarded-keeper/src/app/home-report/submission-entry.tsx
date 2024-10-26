import './submission-entry.scss';
import { Submission } from '../types';
import Popup from '@atlaskit/popup';
import { useState } from 'react';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import Button from '@atlaskit/button';
import { Users } from '../data';
import SendIcon from '@atlaskit/icon/glyph/send';
import { getLastSixMonths } from '../utils';
import WorldIcon from '@atlaskit/icon/glyph/world';
import EditFilledIcon from '@atlaskit/icon/glyph/edit-filled';
import { IconButton } from '@atlaskit/atlassian-navigation';
import { token } from '@atlaskit/tokens';
import Badge from '@atlaskit/badge';

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
        <li
          className="list-group-item justify-content-between align-items-center"
          style={{
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: token('color.background.neutral'),
            color: token('color.text'),
          }}
        >
          <Badge appearance="added">{submission.all.sheets}</Badge>
          <span style={{ display: 'flex', flexDirection: 'row' }}>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              appearance="subtle-link"
              {...triggerProps}
              style={{ textOverflow: 'ellipsis' }}
            >
              Soumission du{' '}
              {submission.date.toDate().toLocaleDateString('fr-FR')}
            </Button>
          </span>

          <span style={{ flexDirection: 'row', display: 'flex' }}>
            <IconButton
              href={jwSubmissionEditLink}
              target="_blank"
              tooltip="Modifier le formulatire soumis sur jw.org"
              icon={
                <EditFilledIcon label="" primaryColor={token('color.icon')} />
              }
              isDisabled={!Users.getCurrent().admin}
            ></IconButton>
            <IconButton
              tooltip="Voir le formulaire soumis sur jw.org"
              href={jwSubmissionLink}
              target="_blank"
              icon={<WorldIcon label="" primaryColor={token('color.icon')} />}
              isDisabled={!Users.getCurrent().admin}
            ></IconButton>
            <IconButton
              onClick={() => sendSubmission(submission)}
              tooltip="Envoyer la soumission par email"
              icon={<SendIcon label="" primaryColor={token('color.icon')} />}
              isDisabled={!Users.getCurrent().admin}
            ></IconButton>
            <IconButton
              onClick={() => getAndDownloadSubmissionFile(submission)}
              tooltip="Télécharger la soumission"
              icon={
                <DownloadIcon label="" primaryColor={token('color.icon')} />
              }
              isDisabled={!Users.getCurrent().admin}
            ></IconButton>
          </span>
        </li>
      )}
    />
  );
}

function PopupContent({ submission }: { submission: Submission }) {
  return (
    <div
      style={{
        padding: 16,
        backgroundColor: token('elevation.surface.overlay.pressed'),
        color: token('color.text'),
      }}
    >
      <table
        className="submission-table"
        style={{ color: token('color.text') }}
      >
        <thead>
          <tr>
            <th>Subdivision</th>
            <th>Nb Rapports</th>
            <th>Heures</th>
            <th>Cours</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tous</td>
            <td>{submission.all.sheets}</td>
            <td>{submission.all.hours}</td>
            <td>{submission.all.studies}</td>
          </tr>
          <tr>
            <td>Procl.</td>
            <td>{submission.publishers.sheets}</td>
            <td>N/A</td>
            <td>{submission.publishers.studies}</td>
          </tr>
          <tr>
            <td>Pion. Aux.</td>
            <td>{submission.auxilaryPioneers.sheets}</td>
            <td>{submission.auxilaryPioneers.hours}</td>
            <td>{submission.auxilaryPioneers.studies}</td>
          </tr>
          <tr>
            <td>Pion. Perm.</td>
            <td>{submission.regularPionners.sheets}</td>
            <td>{submission.regularPionners.hours}</td>
            <td>{submission.regularPionners.studies}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function sendSubmission(submission: Submission) {
  const anchorNode = document.createElement('a');
  const month = getLastSixMonths()[0];
  const body = encodeURIComponent(getSubmissionMessageBody(submission));

  anchorNode.setAttribute(
    'href',
    `mailto:SRV.CD@bethel.jw.org?subject=S-10 | ${month.toLocaleFullMonth()}&body=${body}`,
  );
  document.body.appendChild(anchorNode);
  anchorNode.click();
  anchorNode.remove();
}

function getSubmissionMessageBody(submission: Submission): string {
  return `Proclamateurs\n=============\nNombre Rapports: ${submission.publishers.sheets}\nHeures: N/A\nCours bibliques: ${submission.publishers.studies}\n\nPionniers Auxiliaires\n=====================\nNombre Rapports: ${submission.auxilaryPioneers.sheets}\nHeures: ${submission.auxilaryPioneers.hours}\nCours Bibliques: ${submission.auxilaryPioneers.studies}\n\nPIonniers permanents\n=====================\nNombre Rapports: ${submission.regularPionners.sheets}\nHeures: ${submission.regularPionners.hours}\nCours Bibliques: ${submission.regularPionners.studies}\n\n
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
