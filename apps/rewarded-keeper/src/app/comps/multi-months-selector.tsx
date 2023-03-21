import Popup from '@atlaskit/popup';
import { useState } from 'react';
import { ButtonItem, MenuGroup, Section } from '@atlaskit/menu';
import { getMonthsToAYear } from '../utils';
import { cloneDeep } from 'lodash';
import Button from '@atlaskit/button';
import CalendarFilledIcon from '@atlaskit/icon/glyph/calendar-filled';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';

interface Props {
  value: string[];
  disabled: boolean;
  onValueChange: (value: string[]) => void;
}

export function MultiMonthsSelector(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(cloneDeep(props.value));
  const onClick = () => {
    setIsOpen(!isOpen);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Popup
      placement="bottom-start"
      content={() => (
        <PopupContent
          value={props.value}
          disabled={props.disabled}
          onValueChange={(value) => {
            setValue(value);
            props.onValueChange(value);
          }}
        />
      )}
      isOpen={isOpen}
      onClose={onClose}
      trigger={(triggerProps) => {
        return (
          <Button
            {...triggerProps}
            isDisabled={props.disabled}
            onClick={onClick}
            iconBefore={<CalendarFilledIcon label="" />}
            iconAfter={<ChevronDownIcon label="" />}
          >
            {value.length > 0 ? 'Plusieurs' : 'Aucun'}
          </Button>
        );
      }}
    ></Popup>
  );
}

function PopupContent(props: Props) {
  const months = getMonthsToAYear();
  const [value, setValue] = useState(cloneDeep(props.value));

  return (
    <MenuGroup>
      <Section title={'Mois pour pionnier auxiliaire'}>
        {months.map((month) => {
          const isActiveMonth = value.some((m) => m === month.getKey());
          return (
            <ButtonItem
              iconAfter={
                isActiveMonth ? <CheckCircleIcon label="" /> : undefined
              }
              onClick={() => {
                let newValue;
                if (value.includes(month.getKey())) {
                  newValue = value.filter((m) => m !== month.getKey());
                } else {
                  newValue = [...value, month.getKey()];
                }

                setValue(newValue);
                props.onValueChange(newValue);
              }}
            >
              {month.toLocaleFullMonth()}
            </ButtonItem>
          );
        })}
      </Section>
    </MenuGroup>
  );
}
