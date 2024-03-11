export interface Group {
  id: string | 'unaffiliated' | 'pioneers' | 'inactives';
  name: string;
  overseerId: string;
}


export const getGroupName = (groupId: string, groups: Group[]) => {
  const text = 'Non affilié';

  if (groupId === 'unafiliated') return text;
  if (groupId === 'pioneers') return 'Pionniers';
  if (groupId === 'inactives') return 'Inactifs';
  return groups.find((group) => group.id === groupId)?.name || text;
};
