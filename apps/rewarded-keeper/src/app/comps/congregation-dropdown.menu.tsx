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
  onChange: (congregationId: number | null) => void;
  value?: number;
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

  const selectedCong = congregations.find(
    (c) => c.congregationNumber === value,
  );
  const [inputValue, setInputValue] = useState(
    selectedCong
      ? `${selectedCong.name} (${selectedCong.congregationNumber})`
      : '',
  );

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (!newValue) {
      onChange(null);
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
          onChange(Number(data.optionValue) || null);
        }}>
        {filtered
          .filter((c) =>
            `${c.name} ${c.congregationNumber}`
              .toLowerCase()
              .includes(inputValue.toLowerCase()),
          )
          .map((c) => (
            <Option
              key={c.id}
              value={String(c.congregationNumber)}
              text={`${c.name} (${c.congregationNumber})`}>
              {c.name} ({c.congregationNumber})
            </Option>
          ))}
      </Combobox>
    </Field>
  );
}
