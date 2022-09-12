import { Search } from '@atlaskit/atlassian-navigation';
import { useState } from 'react';
import { Groups, Publishers } from '../data';
import { Group, Publisher } from '../types';
import { SearchPopup } from './search-popup';

export default function EntitySearch() {
  const [value, setValue] = useState('');
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const onChange = (event: any) => {
    setValue(event.target.value);
    setIsPopupOpen(!!event.target.value);

    if (!!event.target.value) {
      searchEntitities(event.target.value, setPublishers, setGroups);
    }
  };

  return (
    <SearchPopup
      publishers={publishers}
      groups={groups}
      isOpen={isPopupOpen}
      onClose={() => setIsPopupOpen(false)}
    >
      <Search
        onClick={onChange}
        placeholder="Rechercher..."
        tooltip="Rechercher"
        label="Rechercher"
        value={value}
      />
    </SearchPopup>
  );
}

function searchEntitities(
  namePart: string,
  setPublishers: (pubs: Publisher[]) => void,
  setGroups: (groups: Group[]) => void
) {
  Promise.all([
    Groups.findByName(namePart),
    Publishers.findByName(namePart),
  ]).then(([groups, publishers]) => {
    setGroups(groups);
    setPublishers(publishers);
  });
}
