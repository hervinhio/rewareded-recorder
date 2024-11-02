import { getLastSixMonths } from '../utils';
import { Month } from '../types';
import { useEffect } from 'react';
import { Dropdown, Option } from '@fluentui/react-components';

interface MonthSelectorProps {
  selectedMonth?: Month | undefined;
  disabled?: boolean | undefined;
  onMonthSelected: (month: Month | undefined) => void;
}

export function MonthSelector(props: MonthSelectorProps) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() + 6);

  const months = getLastSixMonths();
  const defaultMonth = props.selectedMonth || months[0];

  useEffect(() => {
    props.onMonthSelected(defaultMonth);
  }, []);

  return (
    <Dropdown
      placeholder="Sélectionnez un mois"
      defaultValue={defaultMonth.toLocaleFullMonth()}
    >
      {months.map((month: Month, index: number) => (
        <Option
          key={month.getKey()}
          onClick={() => {
            props.onMonthSelected(month);
          }}
          value={month.getKey()}
        >
          {month.toLocaleFullMonth()}
        </Option>
      ))}
    </Dropdown>
  );
}
