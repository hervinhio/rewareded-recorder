export interface User {
  id: string;
  displayName: string;
  email: string;
  publisherId: string | 'unassociated';
  admin: boolean;
  validated: boolean;
  groupId: string | 'unafiliated';
}
