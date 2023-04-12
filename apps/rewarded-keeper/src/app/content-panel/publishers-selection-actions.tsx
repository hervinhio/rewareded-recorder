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
          // eslint-disable-next-line no-script-url
          href="javascript:void(0)"
          onClick={props.onBulkEditPublishers}
        >
          Modifier
        </SectionMessageAction>,
        <SectionMessageAction
          // eslint-disable-next-line no-script-url
          href="javascript:void(0)"
          onClick={props.onBulkDeletePublishers}
        >
          Supprimer
        </SectionMessageAction>,
      ]
    : [];
}
