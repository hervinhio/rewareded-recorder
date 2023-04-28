import { getLastSixMonths } from '../utils';
import { Month } from '../types';
import { useEffect, useState } from 'react';
import DropdownMenu, { DropdownItem } from '@atlaskit/dropdown-menu';
import Button from '@atlaskit/button';
import { token } from '@atlaskit/tokens';

interface MonthSelectorProps {
  selectedMonth?: Month | undefined;
  disabled?: boolean | undefined;
  onMonthSelected: (month: Month | undefined) => void;
}

export function MonthSelector(props: MonthSelectorProps) {
  const months = getLastSixMonths();
  const defaultMonth = props.selectedMonth || months[0];
  const [month, setMonth] = useState(defaultMonth);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    props.onMonthSelected(defaultMonth);
  }, []);

  return (
    <DropdownMenu
      isOpen={isOpen}
      trigger={({ triggerRef, ...props }) => (
        <Button ref={triggerRef} {...props} onClick={() => setIsOpen(!isOpen)}>
          {month.toLocaleFullMonth()}
        </Button>
      )}
    >
      {months.map((month: Month, index: number) => (
        <DropdownItem
          key={month.getKey()}
          onClick={() => {
            setMonth(month);
            props.onMonthSelected(month);
            setIsOpen(false);
          }}
        >
          <span style={{ color: token('color.text') }}>
            {month.toLocaleFullMonth()}
          </span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  );
}
