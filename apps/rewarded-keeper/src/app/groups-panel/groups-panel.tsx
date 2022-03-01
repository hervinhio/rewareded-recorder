import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";
import { useEffect, useState } from "react"
import { PublishersList } from "../content-panel";
import { Groups } from "../data/groups";
import { Group } from "../types";

export const GroupsPanel = () => {
    const [ groups, setGroups ] = useState<Group[]>([]);
    const [ selectedGroupId, setSelectedGroupId ] = useState('unafiliated');

    useEffect(() => {
        let mounted = true;
        Groups.get().then((data) => setGroups(data || []), (err) => console.error(err));
        return () => { mounted = false; }
    }, []);

    return (
        <Tabs id="default" onChange={(index: number) => {
            if (index === groups.length) {
                setSelectedGroupId('unafiliated');
            } else {
                setSelectedGroupId(groups[index].id || 'unafiliated');
            }
        }}>
            <TabList>
                {groups.map((group: Group) => {
                    return <Tab>{group.name}</Tab>
                })}
                <Tab>Non affilié</Tab>
            </TabList>
            {groups.map((group: Group) => {
                return <TabPanel><PublishersList group={group}/></TabPanel>
            })}
            <TabPanel><PublishersList group={{id: 'unafiliated'} as Group}/></TabPanel>
        </Tabs>
    );
}
