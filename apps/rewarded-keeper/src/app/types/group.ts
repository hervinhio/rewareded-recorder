export interface Group {
  id: string | 'unaffiliated' | 'pioneers' | 'inactives' | 'elders' | 'ministerial-servants';
  name: string;
  overseerId: string;
}


export const getGroupName = (groupId: string, groups: Group[]) => {
  const text = 'Non affilié';

  if (groupId === 'unafiliated') return text;
  if (groupId === 'pioneers') return 'Pionniers';
  if (groupId === 'inactives') return 'Inactifs';
  if (groupId === 'elders') return 'Anciens';
  if (groupId === 'ministerial-servants') return 'Assistants ministériels';
  return groups.find((group) => group.id === groupId)?.name || text;
};
