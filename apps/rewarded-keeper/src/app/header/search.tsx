import { useDispatch } from 'react-redux';
import { Dialogs } from '../data';
import { ToolbarButton } from '@fluentui/react-components';
import { SearchFilled } from '@fluentui/react-icons';

export default function EntitySearch() {
  const dispatch = useDispatch();

  return (
    <ToolbarButton
      icon={<SearchFilled />}
      title="Rechercher un proclamateur ou un groupe"
      onClick={() => {
        dispatch(Dialogs.slice.actions.toggleSearchDialog());
      }}
    />
  );
}
