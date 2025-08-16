import { Notification } from '../data/notifications';
import { Report } from './report';

// Role represents the different permission levels in the system
export enum Role {
  ROOT = 'root',
  ADMIN = 'admin', 
  REPORTER = 'reporter',
  GROUP_ADMIN = 'group_admin',
  BASIC = 'basic',
}

// Permission represents specific permissions that can be granted to roles
export enum Permission {
  USER_ADMIN = 'user_admin',
  REPORT_MANAGE = 'report_manage',
  VIEW_GROUP_MEMBERS = 'view_group_members',
  GROUP_MANAGE = 'group_manage',
  PUBLISHER_MANAGE = 'publisher_manage',
  VIEW_OWN_SHEET = 'view_own_sheet',
  ATTENDANCE_MANAGE = 'attendance_manage',
  CONTACT_EDIT = 'contact_edit',
  VIEW_STATS = 'view_stats',
  CONFIG_MANAGE = 'config_manage',
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  publisherId: string | 'unassociated';
  admin: boolean; // Keep for backward compatibility
  validated: boolean;
  groupId: string | 'unafiliated';
  photoURL: string;
  phoneNumber: string;
  notifications?: Notification[];
  role?: Role; // New role-based permission system
  canManageAttendance?: boolean; // Additional permission that can be combined with any role
  canEditContacts?: boolean; // Additional permission that can be combined with any role
  reports?: Report[]; // New array field for migrating reports from separate collection
}

// Helper functions for permission checking
export class UserPermissions {
  // Check if a role has a specific permission
  static roleHasPermission(role: Role, permission: Permission): boolean {
    switch (role) {
      case Role.ROOT:
        return true; // Root has all permissions
      case Role.ADMIN:
        // Admin has all except user administration
        return permission !== Permission.USER_ADMIN;
      case Role.REPORTER:
        return permission === Permission.REPORT_MANAGE || permission === Permission.VIEW_GROUP_MEMBERS || permission === Permission.VIEW_OWN_SHEET;
      case Role.GROUP_ADMIN:
        return permission === Permission.REPORT_MANAGE || permission === Permission.GROUP_MANAGE || permission === Permission.PUBLISHER_MANAGE || permission === Permission.VIEW_GROUP_MEMBERS || permission === Permission.VIEW_OWN_SHEET;
      case Role.BASIC:
        return permission === Permission.VIEW_OWN_SHEET;
      default:
        return false;
    }
  }

  // Check if a user has a specific permission
  static userHasPermission(user: User, permission: Permission): boolean {
    // Check additional permissions that can be combined with any role
    if (permission === Permission.ATTENDANCE_MANAGE && user.canManageAttendance) {
      return true;
    }
    if (permission === Permission.CONTACT_EDIT && user.canEditContacts) {
      return true;
    }
    
    // Get effective role (considering legacy fields)
    const effectiveRole = this.getEffectiveRole(user);
    return this.roleHasPermission(effectiveRole, permission);
  }

  // Get the effective role for a user, considering legacy fields
  static getEffectiveRole(user: User): Role {
    // If role is explicitly set, use it
    if (user.role && this.isValidRole(user.role)) {
      return user.role;
    }
    
    // Fallback to legacy admin field for backward compatibility
    if (user.admin) {
      return Role.ADMIN;
    }
    
    // Default to basic role
    return Role.BASIC;
  }

  // Check if a role is valid
  static isValidRole(role: Role): boolean {
    return [
      Role.ROOT,
      Role.ADMIN,
      Role.REPORTER,
      Role.GROUP_ADMIN,
      Role.BASIC,
    ].includes(role);
  }

  // Get all available roles
  static getAllRoles(): Role[] {
    return [
      Role.ROOT,
      Role.ADMIN,
      Role.REPORTER,
      Role.GROUP_ADMIN,
      Role.BASIC,
    ];
  }

  // Get all available permissions
  static getAllPermissions(): Permission[] {
    return [
      Permission.USER_ADMIN,
      Permission.REPORT_MANAGE,
      Permission.VIEW_GROUP_MEMBERS,
      Permission.GROUP_MANAGE,
      Permission.PUBLISHER_MANAGE,
      Permission.VIEW_OWN_SHEET,
      Permission.ATTENDANCE_MANAGE,
      Permission.CONTACT_EDIT,
      Permission.VIEW_STATS,
      Permission.CONFIG_MANAGE,
    ];
  }

  // Get role display name
  static getRoleDisplayName(role: Role): string {
    switch (role) {
      case Role.ROOT:
        return 'Root';
      case Role.ADMIN:
        return 'Admin';
      case Role.REPORTER:
        return 'Reporter';
      case Role.GROUP_ADMIN:
        return 'Group Admin';
      case Role.BASIC:
        return 'Basic';
      default:
        return 'Unknown';
    }
  }

  // Get role description
  static getRoleDescription(role: Role): string {
    switch (role) {
      case Role.ROOT:
        return 'Full access to all features and administration';
      case Role.ADMIN:
        return 'Admin privileges except user administration';
      case Role.REPORTER:
        return 'Can add/edit/delete reports and view group members';
      case Role.GROUP_ADMIN:
        return 'Can manage groups and publishers';
      case Role.BASIC:
        return 'Can only view own sheet';
      default:
        return 'Unknown role';
    }
  }

  // Get additional permissions for a user
  static getAdditionalPermissions(user: User): Permission[] {
    const permissions: Permission[] = [];
    
    if (user.canManageAttendance) {
      permissions.push(Permission.ATTENDANCE_MANAGE);
    }
    
    if (user.canEditContacts) {
      permissions.push(Permission.CONTACT_EDIT);
    }
    
    return permissions;
  }

  // Get permission display name
  static getPermissionDisplayName(permission: Permission): string {
    switch (permission) {
      case Permission.ATTENDANCE_MANAGE:
        return 'Attendance Management';
      case Permission.CONTACT_EDIT:
        return 'Contact Editing';
      case Permission.USER_ADMIN:
        return 'User Administration';
      case Permission.REPORT_MANAGE:
        return 'Report Management';
      case Permission.VIEW_GROUP_MEMBERS:
        return 'View Group Members';
      case Permission.GROUP_MANAGE:
        return 'Group Management';
      case Permission.PUBLISHER_MANAGE:
        return 'Publisher Management';
      case Permission.VIEW_OWN_SHEET:
        return 'View Own Sheet';
      case Permission.VIEW_STATS:
        return 'View Statistics';
      case Permission.CONFIG_MANAGE:
        return 'Configuration Management';
      default:
        return 'Unknown Permission';
    }
  }

  // Get permission description
  static getPermissionDescription(permission: Permission): string {
    switch (permission) {
      case Permission.ATTENDANCE_MANAGE:
        return 'Can add, edit, and delete attendance records';
      case Permission.CONTACT_EDIT:
        return 'Can modify publisher contact information';
      case Permission.USER_ADMIN:
        return 'Can create, modify, and delete users';
      case Permission.REPORT_MANAGE:
        return 'Can manage reports (create, edit, delete)';
      case Permission.VIEW_GROUP_MEMBERS:
        return 'Can view all members of a group';
      case Permission.GROUP_MANAGE:
        return 'Can manage groups (create, edit, delete)';
      case Permission.PUBLISHER_MANAGE:
        return 'Can manage publishers (create, edit, delete)';
      case Permission.VIEW_OWN_SHEET:
        return 'Can view personal sheet/data';
      case Permission.VIEW_STATS:
        return 'Can view system statistics';
      case Permission.CONFIG_MANAGE:
        return 'Can manage system configuration';
      default:
        return 'Unknown permission';
    }
  }
}
