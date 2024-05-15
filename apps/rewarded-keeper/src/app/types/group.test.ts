import { getGroupName, Group } from './group';
import { describe, expect, test } from '@jest/globals';

describe('getGroupName function', () => {
  const mockGroups: Group[] = [
    { id: 'group1', name: 'Group 1', overseerId: 'overseer1' },
    { id: 'group2', name: 'Group 2', overseerId: 'overseer2' },
    { id: 'unaffiliated', name: 'Non affilié', overseerId: 'overseer3' },
    { id: 'pioneers', name: 'Pionniers', overseerId: 'overseer4' },
    { id: 'inactives', name: 'Inactifs', overseerId: 'overseer5' },
  ];

  it('returns "Non affilié" when groupId is "unaffiliated"', () => {
    const groupId = 'unaffiliated';
    expect(getGroupName(groupId, mockGroups)).toBe('Non affilié');
  });

  it('returns "Pionniers" when groupId is "pioneers"', () => {
    const groupId = 'pioneers';
    expect(getGroupName(groupId, mockGroups)).toBe('Pionniers');
  });

  it('returns "Inactifs" when groupId is "inactives"', () => {
    const groupId = 'inactives';
    expect(getGroupName(groupId, mockGroups)).toBe('Inactifs');
  });

  it('returns group name when group id is found in groups', () => {
    const groupId = 'group1';
    expect(getGroupName(groupId, mockGroups)).toBe('Group 1');
  });

  it('returns "Non affilié" when groupId is not found in groups', () => {
    const groupId = 'groupX';
    expect(getGroupName(groupId, mockGroups)).toBe('Non affilié');
  });
});
