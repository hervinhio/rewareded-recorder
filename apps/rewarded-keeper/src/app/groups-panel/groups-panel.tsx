import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs';
import { useEffect, useState } from 'react';
import { PublishersList } from '../content-panel';
import { Groups } from '../data/groups';
import { Group } from '../types';

const storageGroupProperty = 'selectedGroup';
export const GroupsPanel = () => {
  const storedSelectedGroup = window.localStorage.getItem(storageGroupProperty) || 'unafiliated';
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(storedSelectedGroup);

  useEffect(() => {
    let mounted = true;
    Groups.get().then(
      (data) => setGroups(data || []),
      (err) => console.error(err)
    );
    return () => {
      mounted = false;
    };
  }, []);

  const selectedGroupIndex = groups.findIndex(group => group.id === selectedGroupId);

  return (
    <Tabs
      id="default"
      onChange={(index: number) => {
        const groupId = index === groups.length ? 'unafiliated' : groups[index].id || 'unafiliated';
        setSelectedGroupId(groupId);
        window.localStorage.setItem(storageGroupProperty, groupId);
      }}
      selected={selectedGroupIndex === -1 ? groups.length : selectedGroupIndex}
    >
      <TabList>
        {groups.map((group: Group) => {
          return <Tab>{group.name}</Tab>;
        })}
        <Tab>Non affilié</Tab>
      </TabList>
      {groups.map((group: Group) => {
        return (
          <TabPanel>
            <PublishersList group={group} />
          </TabPanel>
        );
      })}
      <TabPanel>
        <PublishersList group={{ id: 'unafiliated' } as Group} />
      </TabPanel>
    </Tabs>
  );
};
