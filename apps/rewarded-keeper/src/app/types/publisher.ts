import { Timestamp } from 'firebase/firestore';

export interface Publisher {
  id?: string;
  name: string;
  firstName: string;
  lastName: string;
  birthDate: Timestamp;
  baptismDate: Timestamp;
  isElder?: boolean;
  isRegularPioneer?: boolean;
  isAuxylaryPioneer?: boolean;
  groupId: string | 'unafiliated';
}
