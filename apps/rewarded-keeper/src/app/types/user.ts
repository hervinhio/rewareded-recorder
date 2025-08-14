// Role represents the different permission levels in the system
export enum Role {
  ROOT = 'root',
  ADMIN = 'admin', 
  REPORTER = 'reporter',
  GROUP_ADMIN = 'group_admin',
  BASIC = 'basic',
  ATTENDANCE_REPORTER = 'attendance_reporter',
  CONTACT_EDITOR = 'contact_editor',
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
  role?: Role; // New role-based permission system
}

// Helper functions for permission checking
export class UserPermissions {
  // Check if a role has a specific permission
  static roleHasPermission(role: Role, permission: Permission): boolean {
    switch (role) {
      case Role.ROOT:
        return true; // Root has all permissions
      case Role.ADMIN:
        return permission !== Permission.USER_ADMIN; // Admin has all except user administration
      case Role.REPORTER:
        return permission === Permission.REPORT_MANAGE || permission === Permission.VIEW_GROUP_MEMBERS;
      case Role.GROUP_ADMIN:
        return permission === Permission.GROUP_MANAGE || permission === Permission.PUBLISHER_MANAGE;
      case Role.BASIC:
        return permission === Permission.VIEW_OWN_SHEET;
      case Role.ATTENDANCE_REPORTER:
        return permission === Permission.ATTENDANCE_MANAGE;
      case Role.CONTACT_EDITOR:
        return permission === Permission.CONTACT_EDIT;
      default:
        return false;
    }
  }

  // Check if a user has a specific permission
  static userHasPermission(user: User, permission: Permission): boolean {
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
      Role.ATTENDANCE_REPORTER,
      Role.CONTACT_EDITOR,
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
      Role.ATTENDANCE_REPORTER,
      Role.CONTACT_EDITOR,
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
      case Role.ATTENDANCE_REPORTER:
        return 'Attendance Reporter';
      case Role.CONTACT_EDITOR:
        return 'Contact Editor';
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
      case Role.ATTENDANCE_REPORTER:
        return 'Can manage attendance records';
      case Role.CONTACT_EDITOR:
        return 'Can modify publisher contact information';
      default:
        return 'Unknown role';
    }
  }
}
