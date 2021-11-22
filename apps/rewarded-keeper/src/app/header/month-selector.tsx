import { Dropdown, DropdownButton } from "react-bootstrap";
import { getLastSixMonths } from "../utils";
import { Month } from "../types";
import { useState } from "react";

export interface MonthSelectorProps {
  onMonthSelected: (month: Month | undefined) => void;
}

export function MonthSelector(props: MonthSelectorProps) {
  const months = getLastSixMonths();
  const defaultValue = months[0].getKey();
  const [ value, setValue ] = useState(defaultValue);

  return (
    <DropdownButton
      title={findMonthByKey(value, months)?.toLocaleFullMonth()}
      onSelect={(v) => {
        setValue(v || defaultValue);
        props.onMonthSelected(findMonthByKey(v || defaultValue, months));
      }}
    >
      { months.map((month: Month) => <Dropdown.Item key={month.getKey()} eventKey={month.getKey()}> { month.toLocaleFullMonth() }</Dropdown.Item>) }
    </DropdownButton>
  );
}

const findMonthByKey = (key: string, months: Month[]) => {
  return months.find(month => month.getKey() === key);
}
