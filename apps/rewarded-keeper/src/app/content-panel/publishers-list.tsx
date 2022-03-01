import { useEffect, useState } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Publishers } from '../data/publishers';
import { Group, Publisher } from '../types';
import {
    borderRadius as getBorderRadius,
    gridSize as getGridSize,
} from '@atlaskit/theme/constants';
import { token } from '@atlaskit/tokens';
import { N20, N200 } from '@atlaskit/theme/colors';
import { PublisherView } from './publisher-view';
import { getPublisherName } from './util';
import Breadcrumbs, { BreadcrumbsItem } from '@atlaskit/breadcrumbs';

interface Props {
    group: Group;
};

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
}

export const PublishersList = (props: Props) => {
    const [ publishers, setPublishers ] = useState<Publisher[]>([]);
    const [ selectedPublisher, setSelectedPublisher ] = useState<Publisher | null>(null);

    useEffect(() => {
        Publishers.byGroupId(props.group.id)
            .then((pubs) => setPublishers(pubs), (err) => {
                console.error(err);
            });
    }, [props.group.id]);

    return (
        <div style={{ width: '100%' }}>
            <Breadcrumbs>
                <BreadcrumbsItem text={props.group.name || 'Non affilié'} key={props.group.id} onClick={() => setSelectedPublisher(null)}/>
                {selectedPublisher && <BreadcrumbsItem text={getPublisherName(selectedPublisher)} key={selectedPublisher.id} />}
            </Breadcrumbs>
            <div style={style as React.CSSProperties}>
                {selectedPublisher ? renderPublisherView(selectedPublisher) : renderPublishersList(publishers, setSelectedPublisher)}
            </div>
        </div>
    );
}

const renderPublisherView = (publisher: Publisher) => {
    return <PublisherView publisher={publisher}/>
};

const renderPublishersList = (publishers: Publisher[], setSelectedPublisher: (publisher: Publisher) => void) => {
    return (
        <ListGroup style={{width: '100%'}}>
            <h4>Proclamateurs</h4>
            {publishers.map((publisher: Publisher) => {
                return (
                    <ListGroupItem style={{cursor: 'pointer'}} onClick={() => setSelectedPublisher(publisher)}>
                        {getPublisherName(publisher)}
                    </ListGroupItem>
                );
            })}
        </ListGroup>
    );
};
