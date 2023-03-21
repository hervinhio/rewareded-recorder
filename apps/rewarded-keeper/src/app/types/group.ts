export interface Group {
  id: string;
  name: string;
  overseerId: string;
}


export const getGroupName = (groupId: string, groups: Group[]) => {
  return groups.find((group) => group.id === groupId)?.name || 'Non affilié';
};
