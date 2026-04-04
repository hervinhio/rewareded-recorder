import './submission-entry.scss';
import { Submission } from '../types';
import { Users } from '../data';
import { getLastSixMonths } from '../utils';
import { ListItem } from '@fluentui/react-list-preview';
import {
  Badge,
  Button,
  InfoLabel,
  makeStyles,
  PopoverSurface,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  tokens,
  Toolbar,
  ToolbarButton,
  Tooltip,
} from '@fluentui/react-components';
import { ArrowDownloadFilled, SendFilled } from '@fluentui/react-icons';
import { useMemo } from 'react';

const useStyles = makeStyles({
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '8px',
    marginBottom: '3px',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
  },
  header: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: '16px',
  },
});

export function SubmissionEntry({ submission }: { submission: Submission }) {
  const styles = useStyles();

  return (
    <ListItem className={styles.listItem}>
      <div className={styles.header}>
        <Badge appearance="filled">{submission.all.sheets}</Badge>&nbsp;
        <InfoLabel info={<PopupContent submission={submission} />}>
          Soumission du {submission.date.toDate().toLocaleDateString('fr-FR')}
        </InfoLabel>
      </div>
      <span className="flex-expand" />
      <Toolbar>
        <Tooltip
          relationship="description"
          content="Envoyer la soumission par email">
          <ToolbarButton
            onClick={() => sendSubmission(submission)}
            icon={<SendFilled />}
            disabled={!Users.getCurrent().admin}
          />
        </Tooltip>
        <Tooltip relationship="description" content="Télécharger la soumission">
          <ToolbarButton
            onClick={() => getAndDownloadSubmissionFile(submission)}
            icon={<ArrowDownloadFilled />}
            disabled={!Users.getCurrent().admin}
          />
        </Tooltip>
      </Toolbar>
    </ListItem>
  );
}

const columns = [
  { columnKey: 'division', label: 'Subdivision' },
  { columnKey: 'reports', label: 'Nb. Rapports' },
  { columnKey: 'Hours', label: 'Heures' },
  { columnKey: 'studies', label: 'Cours' },
];

function PopupContent({ submission }: { submission: Submission }) {
  const rows = useMemo(() => {
    return [
      {
        division: 'Tous',
        reports: submission.all.sheets,
        hours: submission.all.hours,
        studies: submission.all.studies,
        key: 'all',
      },
      {
        division: 'Procl.',
        reports: submission.publishers.sheets,
        hours: submission.publishers.hours,
        studies: submission.publishers.studies,
        key: 'publishers',
      },
      {
        division: 'Pion. Aux.',
        reports: submission.auxilaryPioneers.sheets,
        hours: submission.auxilaryPioneers.hours,
        studies: submission.auxilaryPioneers.studies,
        key: 'aux.pion',
      },
      {
        division: 'Pion. Perm.',
        reports: submission.regularPionners.sheets,
        hours: submission.regularPionners.hours,
        studies: submission.regularPionners.studies,
        key: 'reg.pion',
      },
    ];
  }, [JSON.stringify(submission)]);

  return (
    <Table style={{ width: 450 }}>
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHeaderCell key={c.columnKey}>{c.label}</TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((item) => (
          <TableRow key={item.key}>
            <TableCell>
              <TableCellLayout>{item.division}</TableCellLayout>
            </TableCell>
            <TableCell>
              <TableCellLayout>{item.reports}</TableCellLayout>
            </TableCell>
            <TableCell>
              <TableCellLayout>{item.hours}</TableCellLayout>
            </TableCell>
            <TableCell>
              <TableCellLayout>{item.studies}</TableCellLayout>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
