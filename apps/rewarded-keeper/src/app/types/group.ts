export interface Group {
  id: string | 'unaffiliated';
  name: string;
  overseerId: string;
}


export const getGroupName = (groupId: string, groups: Group[]) => {
  const text = 'Non affilié';

  if (groupId === 'unafiliated') return text;
  return groups.find((group) => group.id === groupId)?.name || text;
};
