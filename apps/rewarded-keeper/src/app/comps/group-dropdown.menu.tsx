import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../data';
import { Dropdown, Field, Option } from '@fluentui/react-components';

export function GroupDropdownMenu({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value?: string;
}) {
  const groups = useSelector(
    (state: GlobalState) => state.groups.groups,
    shallowEqual,
  );

  return (
    <Field label="Groupe de prédication">
      <Dropdown
        name="group"
        placeholder="Non affilié"
        defaultValue={value === 'unafiliated' ? 'Non affilié' : groups.find(g => g.id === value)?.name || 'Aucun'}
        defaultSelectedOptions={value ? [value] : []}>
        {groups.map((g) => (
          <Option
            value={g.id}
            onClick={() => {
              onChange?.(g.id || 'unafiliated');
            }}>
            {g.name}
          </Option>
        ))}
      </Dropdown>
    </Field>
  );
}
