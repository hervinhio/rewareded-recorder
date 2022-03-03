import { Timestamp } from 'firebase/firestore';

export interface Publisher {
  id?: string;
  name: string;
  firstName: string;
  lastName: string;
  groupId: string | 'unafiliated';
  isElder?: boolean;
  isRegularPioneer?: boolean;
  isAuxylaryPioneer?: boolean;
}
