export interface Publisher {
  id?: string;
  name: string;
  firstName: string;
  lastName: string;
  groupId: string | 'unafiliated';
  isElder?: boolean;
  isMinisterialServant: boolean;
  isRegularPioneer?: boolean;
  isSpecialServant?: boolean;
  auxilaryPionierFor?: string[];
}

export const isPublisherAuxilaryPionierForMonth = (
    publisher: Publisher | undefined,
    monthId: string
) => {
  return publisher?.auxilaryPionierFor?.includes(monthId);
};
