import { ChangeEvent, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../data';
import { Combobox, Field, Option } from '@fluentui/react-components';

export function CongregationDropdown({
  onChange,
  value,
  label = 'Congrégation',
  excludeId,
}: {
  onChange: (congregationId: string) => void;
  value?: string;
  label?: string;
  excludeId?: string;
}) {
  const congregations = useSelector(
    (state: GlobalState) => state.congregations.congregations,
    shallowEqual,
  );

  const filtered = excludeId
    ? congregations.filter((c) => c.id !== excludeId)
    : congregations;

  const selectedCong = congregations.find((c) => c.id === value);
  const [inputValue, setInputValue] = useState(
    selectedCong ? `${selectedCong.name} (${selectedCong.number})` : '',
  );

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (!newValue) {
      onChange('');
    }
  };

  return (
    <Field label={label}>
      <Combobox
        freeform
        placeholder="Rechercher une congrégation..."
        value={inputValue}
        onChange={handleInput}
        onOptionSelect={(_, data) => {
          setInputValue(data.optionText || '');
          onChange(data.optionValue || '');
        }}>
        {filtered
          .filter((c) =>
            `${c.name} ${c.number}`
              .toLowerCase()
              .includes(inputValue.toLowerCase()),
          )
          .map((c) => (
            <Option key={c.id} value={c.id} text={`${c.name} (${c.number})`}>
              {c.name} ({c.number})
            </Option>
          ))}
      </Combobox>
    </Field>
  );
}
