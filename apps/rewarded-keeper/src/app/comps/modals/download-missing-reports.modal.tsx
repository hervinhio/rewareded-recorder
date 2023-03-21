import { useSelector } from 'react-redux';
import { GlobalState, Users } from '../../data';
import { getGroupName, Group, Publisher, Repport } from '../../types';
import Modal, {
  ModalHeader,
  ModalTitle,
  ModalTransition,
  ModalBody,
  ModalFooter,
} from '@atlaskit/modal-dialog';
import { LoadingButton } from '@atlaskit/button';
import { useState } from 'react';
import DownloadIcon from '@atlaskit/icon/glyph/download';
import './download-missing-reports.modal.scss';
import { getLastSixMonths } from '../../utils';
import { getPublisherName } from '../../content-panel/util';
import * as xlsx from 'xlsx';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import Button from '@atlaskit/button';
import { flatten } from 'lodash';

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
            (p) => p.groupId === user.groupId || 'unafiliated'
          )
        : state.publishers.publishers;

      let reports: Repport[] = [];
      if (user.admin) {
        reports = state.reports.reports;
      } else {
        publishers.forEach((p) => {
          reports.push(
            ...state.reports.reports.filter((r) => r.publisherId === p.id)
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
    }
  );

  if (!props.show) {
    return null;
  }

  return (
    <Modal shouldCloseOnEscapePress={true}>
      <ModalTransition>
        <ModalHeader>
          <ModalTitle>Rapports manquants</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="modal-contents">
            <p>
              Vous {isLoading ? 'êtes entrain de' : 'allez'} générer la liste
              des rapports manquants pour
              {!selectedGroup || !group
                ? ' tous les groupes de prédication'
                : ` le groupe ${group?.name}`}
            </p>
            {Users.getCurrent().admin && (
              <DropdownButton
                title={getGroupName(selectedGroup?.id || 'unafiliated', groups)}
                disabled={isLoading}
                defaultValue={selectedGroup?.id}
                onSelect={(v) => {
                  if (v) {
                    setSelectedGroup(groups[Number(v)]);
                  }
                }}
              >
                {groups.map((group, index) => (
                  <Dropdown.Item key={group.id} eventKey={index}>
                    {' '}
                    {group.name}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <LoadingButton
            appearance="subtle"
            isLoading={isLoading}
            iconBefore={<DownloadIcon label="" />}
            onClick={() => {
              setIsLoading(true);
              generateAndDownloadMissingReportsFile(
                reports,
                publishers,
                getSelectedGroups(selectedGroup, group, groups)
              );
              setIsLoading(false);
              props.onHide();
            }}
          >
            Générer et télécharger
          </LoadingButton>
          &nbsp;
          <Button onClick={props.onHide}>Anuller</Button>
        </ModalFooter>
      </ModalTransition>
    </Modal>
  );
}

function generateAndDownloadMissingReportsFile(
  reports: Repport[],
  publishers: Publisher[],
  groups: Group[]
) {
  const months = getLastSixMonths();
  const reportsData = groups.map((g) => {
    return publishers
      .filter((p) => p.groupId === g.id)
      .map((pub: Publisher) => {
        const misingMonths = months.filter((m) => {
          return !reports.some(
            (r) => r.monthId === m.getKey() && r.publisherId === pub.id
          );
        });

        return misingMonths.map((m, index) => {
          return [
            index === 0 ? getPublisherName(pub) : '',
            groups.find((g) => g.id === pub.groupId)?.name || 'Non affilié',
            m.toLocaleFullMonth(),
            '', // Publications
            '', // Vidéos
            '', // Heures
            '', // Nouvelles visites
            '', // Cours
          ];
        });
      });
  });
  const workbook = xlsx.utils.book_new();

  reportsData.forEach((data) => {
    const sheetData = [
      [
        'Proclamateur',
        'Groupe',
        'Mois',
        'Publications',
        'Vidéos',
        'Heures',
        'Nouvelles visites',
        'Cours',
      ],
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
  groups: Group[]
): Group[] {
  if (selectedGroup) {
    return [selectedGroup, {id: 'unafiliated', name: '', overseerId: ''}];
  } else if (group) {
    return [group, {id: 'unafiliated', name: '', overseerId: ''}];
  }

  return [...groups, {id: 'unafiliated', name: '', overseerId: ''}];
}
