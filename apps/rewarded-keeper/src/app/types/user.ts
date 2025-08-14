import { Notification } from '../data/notifications';

export interface User {
  id: string;
  displayName: string;
  email: string;
  publisherId: string | 'unassociated';
  admin: boolean;
  validated: boolean;
  groupId: string | 'unafiliated';
  photoURL: string;
  phoneNumber: string;
  notifications?: Notification[];
}
