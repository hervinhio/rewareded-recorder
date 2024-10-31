import { useSelector } from 'react-redux';
import { GlobalState, Users } from '../../data';
import { Group, Publisher, Report } from '../../types';
import { useState } from 'react';
import { ArrowDownloadFilled } from '@fluentui/react-icons';
import './download-missing-reports.modal.scss';
import { getLastSixMonths } from '../../utils';
import { getPublisherName } from '../../content-panel/util';
import * as xlsx from 'xlsx';
import { flatten } from 'lodash';
import { GroupDropdownMenu } from '../group-dropdown.menu';
import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger } from '@fluentui/react-components';

interface Props {
  show: boolean;
  onHide: () => void;
}

export function DownloadMissingReportsModal(props: Props) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { reports, publishers, group, groups } = useSelector(
    (state: GlobalState) => {
      const user = Users.getCurrent();
      const publishers = user.admin
        ? state.publishers.publishers.filter(
            (p) => p.groupId === user.groupId || 'unafiliated',
          )
        : state.publishers.publishers;

      let reports: Report[] = [];
      if (user.admin) {
        reports = state.reports.reports;
      } else {
        publishers.forEach((p) => {
          reports.push(
            ...state.reports.reports.filter((r) => r.publisherId === p.id),
          );
        });
      }

      return {
        reports,
        publishers,
        group: user.admin
          ? null
          : state.groups.groups.find((g) => user.groupId === g.id) || null,
        groups: state.groups.groups,
      };
    },
  );

  if (!props.show) {
    return null;
  }

  return (
    <Dialog open={props.show}>
      <DialogTrigger>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Rapports manquants</DialogTitle>
          <DialogContent>
              <p>
                Vous {isLoading ? 'êtes entrain de' : 'allez'} générer la liste
                des rapports manquants pour
                {!selectedGroup || !group
                  ? ' tous les groupes de prédication'
                  : ` le groupe ${group?.name}`}
              </p>
              <GroupDropdownMenu
                onChange={(groupId: string) =>
                  setSelectedGroup(groups.find((g) => g.id === groupId) || null)
                }
              />
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button onClick={props.onHide}>Annuler</Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              icon={<ArrowDownloadFilled />}
              onClick={() => {
                setIsLoading(true);
                generateAndDownloadMissingReportsFile(
                  reports,
                  publishers,
                  getSelectedGroups(selectedGroup, group, groups),
                );
                setIsLoading(false);
                props.onHide();
              }}
            >
              Télécharger
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

function generateAndDownloadMissingReportsFile(
  reports: Report[],
  publishers: Publisher[],
  groups: Group[],
) {
  const months = getLastSixMonths();
  const lastSixMonths = getLastSixMonths().map((m) => m.getKey());

  const reportsData = groups.map((g) => {
    return publishers
      .filter((p) => {
        const lastSixReports = reports.filter(
          (r) => r.publisherId === p.id && lastSixMonths.includes(r.monthId),
        );
        return p.groupId === g.id && lastSixReports.length < 6;
      })
      .map((pub: Publisher) => {
        const misingMonths = months.filter((m) => {
          return !reports.some(
            (r) => r.monthId === m.getKey() && r.publisherId === pub.id,
          );
        });

        return misingMonths.map((m, index) => {
          return [
            index === 0 ? getPublisherName(pub) : '',
            groups.find((g) => g.id === pub.groupId)?.name || 'Non affilié',
            m.toLocaleFullMonth(),
            '', // Heures
            '', // Cours
          ];
        });
      });
  });
  const workbook = xlsx.utils.book_new();

  reportsData.forEach((data) => {
    if (!data.length) return;

    const sheetData = [
      ['Proclamateur', 'Groupe', 'Mois', 'Heures', 'Cours'],
      ...flatten(data),
    ];
    const worksheet = xlsx.utils.aoa_to_sheet(sheetData);
    const monthName = data[0][0][1];
    workbook.SheetNames.push(monthName);
    workbook.Sheets[monthName] = worksheet;
  });

  xlsx.writeFile(workbook, `41939 - Rapports Manquants - 6 derniers mois.xlsx`);
}

function getSelectedGroups(
  selectedGroup: Group | null,
  group: Group | null,
  groups: Group[],
): Group[] {
  if (selectedGroup) {
    return [selectedGroup, { id: 'unafiliated', name: '', overseerId: '' }];
  } else if (group) {
    return [group, { id: 'unafiliated', name: '', overseerId: '' }];
  }

  return [...groups, { id: 'unafiliated', name: '', overseerId: '' }];
}
