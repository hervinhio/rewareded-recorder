import Popup, { TriggerProps } from '@atlaskit/popup';
import { Publisher } from "../types";
import { useState } from "react";
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { useSelector } from "react-redux";
import { GlobalState } from "../data";
import { getPublisherName } from "./util";
import { nanoid } from "@reduxjs/toolkit";
import { IconButton, Search } from "@atlaskit/atlassian-navigation";
import AddCircleIcon from '@atlaskit/icon/glyph/add-circle';
import EmptyState from "@atlaskit/empty-state";

interface Props {
    onAdd: (publisher: Publisher) => void;
};

export function SearchAndAddPublisher(props: Props) {
    const [value, setValue] = useState('');

    return (
        <Popup
            placement="bottom-start"
            content={() => <SearchAndAddPublishercontents onAdd={props.onAdd} value={value}/>}
            isOpen={!!value}
            autoFocus={false}
            shouldFlip={true}
            trigger={(props: any) => {
                return (
                    <div {...props}>
                        <Search
                            {...props}
                            tooltip="Rechercher un proclamateur"
                            label=""
                            value={value}
                            placeholder='John Doe'
                            onClick={(event: any) => setValue(event.target.value)}
                        />
                    </div>
                );
            }}
        />
    )
}

function SearchAndAddPublishercontents({ onAdd, value }: { value: string; onAdd: (publisher: Publisher) => void; }) {
    const { publishers, groupId } = useSelector((state: GlobalState) => ({
        publishers: state.publishers.publishers,
        groupId: state.groups.active?.id || 'unafiliated',
    }));

    const nonMatchedPublishers = publishers.filter(p => p.groupId !== groupId && getPublisherName(p).toLocaleLowerCase().includes(value.toLocaleLowerCase()));

    if (nonMatchedPublishers.length === 0) {
        return <EmptyState header="Aucun résultat" />
    }

    return (
        <div style={{width: 400, padding: 16}}>
            <ListGroup style={{ width: '100%' }}>
                <h6>Résultats</h6>
                {nonMatchedPublishers.map(publisher => {
                    return (
                        <ListGroupItem key={publisher.id || nanoid()}>
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <span>{getPublisherName(publisher)}</span>
                                <span className="flex-expand"></span>
                                <IconButton 
                                    icon={<AddCircleIcon label=""/>}
                                    onClick={() => onAdd({...publisher, groupId})}
                                    tooltip="Ajouter ce proclamateur au groupe"
                                />
                            </div>
                        </ListGroupItem>
                    );
                })}
            </ListGroup>
        </div>
    );
}
