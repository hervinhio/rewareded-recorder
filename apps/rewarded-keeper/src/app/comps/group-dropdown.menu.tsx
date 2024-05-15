import Button from '@atlaskit/button';
import DropdownMenu, { DropdownItem } from '@atlaskit/dropdown-menu';
import { useState } from 'react';
import { getGroupName } from '../types';
import { shallowEqual, useSelector } from 'react-redux';
import { GlobalState } from '../data';
import { token } from '@atlaskit/tokens';

export function GroupDropdownMenu(fieldProps: any) {
  const [isOpen, setIsOpen] = useState(false);
  const groups = useSelector(
    (state: GlobalState) => state.groups.groups,
    shallowEqual,
  );
  const [groupId, setGroupId] = useState<string>(
    fieldProps.value || 'unafiliated',
  );

  return (
    <div {...fieldProps}>
      <DropdownMenu
        isOpen={isOpen}
        trigger={({ triggerRef, ...props }) => (
          <Button
            {...props}
            ref={triggerRef}
            onClick={() => setIsOpen(!isOpen)}
          >
            {getGroupName(groupId, groups)}
          </Button>
        )}
      >
        {groups.map((g) => (
          <DropdownItem
            onClick={() => {
              setGroupId(g.id || 'unafiliated');
              fieldProps.onChange(g.id || 'unafiliated');
              setIsOpen(false);
            }}
          >
            <span style={{ color: token('color.text') }}>{g.name}</span>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </div>
  );
}
