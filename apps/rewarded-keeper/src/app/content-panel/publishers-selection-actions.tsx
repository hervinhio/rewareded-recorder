import { SectionMessageAction } from '@atlaskit/section-message';
import { Users } from '../data';

interface Props {
  onBulkEditPublishers: () => void;
  onBulkDeletePublishers: () => void;
}

export function makePublishersSelectionActions(props: Props) {
  const user = Users.getCurrent();
  return user.admin
    ? [
        <SectionMessageAction
          href="javascript:void(0)"
          onClick={props.onBulkEditPublishers}
        >
          Modifier
        </SectionMessageAction>,
        <SectionMessageAction
          href="javascript:void(0)"
          onClick={props.onBulkDeletePublishers}
        >
          Supprimer
        </SectionMessageAction>,
      ]
    : [];
}
