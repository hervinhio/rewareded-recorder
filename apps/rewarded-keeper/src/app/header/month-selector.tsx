import { Dropdown, DropdownButton } from 'react-bootstrap';
import { getLastSixMonths } from '../utils';
import { Month } from '../types';
import { useState } from 'react';

export interface MonthSelectorProps {
  selectedMonth?: Month | undefined;
  disabled?: boolean | undefined;
  onMonthSelected: (month: Month | undefined) => void;
}

export function MonthSelector(props: MonthSelectorProps) {
  const months = getLastSixMonths();
  const defaultMonth = props.selectedMonth || months[0];
  const [month, setMonth] = useState(defaultMonth);

  if (!props.selectedMonth) {
    props.onMonthSelected(defaultMonth);
  }

  return (
    <DropdownButton
      title={month.toLocaleFullMonth()}
      disabled={props.disabled}
      onSelect={(v) => {
        if (v) {
          setMonth(months[Number(v)]);
          props.onMonthSelected(months[Number(v)]);
        }
      }}
    >
      {months.map((month: Month, index: number) => (
        <Dropdown.Item key={index} eventKey={index}>
          {' '}
          {month.toLocaleFullMonth()}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
}
