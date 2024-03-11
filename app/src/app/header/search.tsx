import { IconButton } from '@atlaskit/atlassian-navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Dialogs, GlobalState } from '../data';
import SearchIcon from '@atlaskit/icon/glyph/search';

export default function EntitySearch() {
  const dialogs = useSelector((state: GlobalState) => state.dialogs);
  const dispatch = useDispatch();

  return (
    <IconButton
      icon={<SearchIcon label="Rechercher" />}
      tooltip="Rechercher un proclamateur ou un groupe"
      onClick={() => {
        dispatch(Dialogs.slice.actions.toggleSearchDialog());
      }}
      isSelected={dialogs.showSearchDialog}
    />
  );
}
