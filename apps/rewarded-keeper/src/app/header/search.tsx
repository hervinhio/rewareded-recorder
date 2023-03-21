import { Search } from '@atlaskit/atlassian-navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getPublisherName } from '../content-panel/util';
import { GlobalState } from '../data';
import { Group, Publisher } from '../types';
import { SearchPopup } from './search-popup';

export default function EntitySearch() {
  const [value, setValue] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { publishers, groups } = useSelector((state: GlobalState) => ({
    publishers: filterPublishers(state.publishers.publishers, value),
    groups: filterGroups(state.groups.groups, value),
  }));

  const onChange = (event: any) => {
    setValue(event.target.value);
    setIsPopupOpen(!!event.target.value);
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

function filterPublishers(
  publishers: Publisher[],
  searchValue: string
): Publisher[] {
  if (!searchValue) return [];

  return publishers.filter((p) =>
    getPublisherName(p)
      .toLocaleLowerCase()
      .includes(searchValue.toLocaleLowerCase())
  );
}

function filterGroups(groups: Group[], searchValue: string): Group[] {
  if (!searchValue) return [];

  return groups.filter((g) =>
    g.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
  );
}
