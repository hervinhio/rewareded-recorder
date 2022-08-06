export interface Publisher {
  id?: string;
  name: string;
  firstName: string;
  lastName: string;
  groupId: string | 'unafiliated';
  isElder?: boolean;
  isRegularPioneer?: boolean;
  auxilaryPionierFor?: string[];
}

export const isPublisherAuxilaryPionierForMonth = (
  publisher: Publisher | undefined,
  monthId: string
) => {
  return publisher?.auxilaryPionierFor?.includes(monthId);
};
