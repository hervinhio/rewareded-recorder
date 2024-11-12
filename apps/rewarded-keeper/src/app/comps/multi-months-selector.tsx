import { useMemo, useState } from 'react';
import { getLastTwelveMonths } from '../utils';
import { Dropdown, makeStyles, Option } from '@fluentui/react-components';
import { Month } from '../types';

interface Props {
  value: string[];
  disabled: boolean;
  onValueChange: (value: string[]) => void;
}

const useStyles = makeStyles({
  root: {
    // Stack the label above the field with a gap
    display: 'grid',
    gridTemplateRows: 'repeat(1fr)',
    justifyItems: 'start',
    gap: '2px',
    maxWidth: '100%',
  },
});

export function MultiMonthsSelector(props: Props) {
  const months = useMemo(getLastTwelveMonths, []);
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Dropdown
        multiselect={true}
        defaultSelectedOptions={props.value}
        defaultValue={props.value
          .map((key) => Month.fromKey(key).toLocaleFullMonth())
          .join(', ')}
        placeholder="Mois pour pionnier auxiliaire"
        onOptionSelect={(evt, data) => {
          props.onValueChange(data.selectedOptions);
        }}>
        {months.map((month) => {
          return (
            <Option value={month.getKey()} key={month.getKey()}>
              {month.toLocaleFullMonth()}
            </Option>
          );
        })}
      </Dropdown>
    </div>
  );
}
