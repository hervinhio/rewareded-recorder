import { ChangeEvent, CSSProperties, useState } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Publisher, Repport } from '../types';
import {
  borderRadius as getBorderRadius,
  gridSize as getGridSize,
} from '@atlaskit/theme/constants';
import { token } from '@atlaskit/tokens';
import { N20, N200 } from '@atlaskit/theme/colors';
import { getPublisherName } from './util';
import { Link, useParams } from 'react-router-dom';
import { Users } from '../data';
import WarningIcon from '@atlaskit/icon/glyph/warning';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
import SectionMessage, {
  SectionMessageAction,
} from '@atlaskit/section-message';
import { Checkbox } from '@atlaskit/checkbox';
import cloneDeep from 'lodash/cloneDeep';
import { PublisherModificationView } from './publisher-modification-view';

const borderRadius = getBorderRadius();
const gridSize = getGridSize();
const style = {
  display: 'flex',
  marginTop: `${gridSize * 2}px`,
  marginBottom: `${gridSize}px`,
  padding: `${gridSize * 4}px`,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  flexGrow: 1,
  backgroundColor: token('color.background.neutral', N20),
  borderRadius: `${borderRadius}px`,
  color: token('color.text.subtlest', N200),
};
const linkStyle = { textDecoration: 'none', color: '#000' } as CSSProperties;

interface Props {
  publishers: Publisher[];
  repports: Repport[];
}

export const PublishersList = (props: Props) => {
  const [selectedPublishersIds, setSelectedPublishersIds] = useState<string[]>(
    []
  );
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const { groupId } = useParams();
  const publishers = props.publishers.filter(
    (publisher) => publisher.groupId === groupId
  );

  const publishersWithMissingRepports = publishers.filter((publisher) => {
    return !props.repports.find(
      (repport) => repport.publisherId === publisher.id
    );
  });

  const thereAreMissingRepports = publishersWithMissingRepports.length > 0;

  return (
    <div style={{ width: '100%' }}>
      {selectedPublishersIds.length > 0 && (
        <SectionMessage
          title={`Selection en cours (${selectedPublishersIds.length})`}
          appearance="information"
          actions={makeSelectionAction(
            () => setIsBulkEditOpen(true),
            () => setIsBulkDeleteOpen(true)
          )}
        >
          <p>{selectedPublishersIds.length} proclamateurs sélectionnés</p>
        </SectionMessage>
      )}
      {!selectedPublishersIds.length && thereAreMissingRepports && (
        <SectionMessage
          title={`Certains rapports manquent (${publishersWithMissingRepports.length})`}
          appearance="warning"
        >
          <p>
            Veuillez contacter individuellement ceux de votre groupe qui n'ont
            pas encore remis leur rapports.
          </p>
        </SectionMessage>
      )}
      {!selectedPublishersIds.length && !thereAreMissingRepports && (
        <SectionMessage
          title="Tous les rapports ont été remis"
          appearance="success"
        >
          <p>
            Tous les rapports ont été remis et serons bientôt envoyés au béthel.
          </p>
        </SectionMessage>
      )}
      <div style={style as React.CSSProperties}>
        {!isBulkEditOpen &&
          renderPublishersList(
            publishers,
            setSelectedPublishersIds,
            props.repports,
            selectedPublishersIds
          )}
        {isBulkEditOpen && (
          <PublisherModificationView
            publisher={{} as any}
            publishers={publishers.filter((p) =>
              selectedPublishersIds.includes(p.id || '')
            )}
            onHide={() => {
              setIsBulkEditOpen(false);
              setSelectedPublishersIds([]);
            }}
          />
        )}
      </div>
    </div>
  );
};

const makeSelectionAction = (
  onBulkEditPublishers: () => void,
  onBulkDeletePublishers: () => void
) => {
  const user = Users.getCurrent();
  const actions = [
    <SectionMessageAction
      href="javascript:void(0)"
      onClick={onBulkEditPublishers}
    >
      Modifier
    </SectionMessageAction>,
    <SectionMessageAction
      href="javascript:void(0)"
      onClick={onBulkDeletePublishers}
    >
      Supprimer
    </SectionMessageAction>,
  ];

  if (user.admin) {
    return actions;
  }

  return [];
};

const renderPublishersList = (
  publishers: Publisher[],
  setSelectedPublishers: (publishers: string[]) => void,
  repports: Repport[],
  selectedPublishersId: string[]
) => {
  return (
    <ListGroup style={{ width: '100%' }}>
      <h4>Proclamateurs</h4>
      {publishers.map((publisher: Publisher, index: number) => {
        const publisherHasEmittedReport = repports.some(
          (repport) => repport.publisherId === publisher.id
        );

        return (
          <ListGroupItem
            key={index}
            style={{
              cursor: 'pointer',
              backgroundColor: !publisherHasEmittedReport
                ? '#fff8e1'
                : undefined,
            }}
            onClick={() => setSelectedPublishers([])}
          >
            <Link
              to={`/groups/${publisher.groupId}/${publisher.id}`}
              replace={true}
              style={linkStyle}
            >
              <div className="publisher-name-group">
                <Checkbox
                  onClick={(e: any) => e.stopPropagation()}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (event.target.checked) {
                      selectedPublishersId.push(publisher.id || '');
                      setSelectedPublishers(cloneDeep(selectedPublishersId));
                      return;
                    }

                    const index = selectedPublishersId.indexOf(
                      publisher.id || ''
                    );
                    selectedPublishersId.splice(index, 1);
                    setSelectedPublishers(cloneDeep(selectedPublishersId));
                  }}
                />
                <span className="icons">
                  {!publisherHasEmittedReport && (
                    <WarningIcon
                      label=""
                      primaryColor="#f9a825"
                      secondaryColor="#fff"
                    />
                  )}
                  {publisherHasEmittedReport && (
                    <CheckCircleIcon
                      label=""
                      primaryColor="#00bfa5"
                      secondaryColor="#fff"
                    />
                  )}
                </span>
                <span>{getPublisherName(publisher)}</span>
              </div>
            </Link>
          </ListGroupItem>
        );
      })}
    </ListGroup>
  );
};
