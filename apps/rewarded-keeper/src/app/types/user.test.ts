import { Role, Permission, UserPermissions, User } from './user';

describe('UserPermissions', () => {
  describe('roleHasPermission', () => {
    it('should grant all permissions to ROOT role', () => {
      expect(UserPermissions.roleHasPermission(Role.ROOT, Permission.USER_ADMIN)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.ROOT, Permission.REPORT_MANAGE)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.ROOT, Permission.VIEW_STATS)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.ROOT, Permission.ATTENDANCE_MANAGE)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.ROOT, Permission.CONTACT_EDIT)).toBe(true);
    });

    it('should grant all permissions except user admin to ADMIN role', () => {
      expect(UserPermissions.roleHasPermission(Role.ADMIN, Permission.REPORT_MANAGE)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.ADMIN, Permission.VIEW_STATS)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.ADMIN, Permission.ATTENDANCE_MANAGE)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.ADMIN, Permission.CONTACT_EDIT)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.ADMIN, Permission.USER_ADMIN)).toBe(false);
    });

    it('should grant only report permissions to REPORTER role', () => {
      expect(UserPermissions.roleHasPermission(Role.REPORTER, Permission.REPORT_MANAGE)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.REPORTER, Permission.VIEW_GROUP_MEMBERS)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.REPORTER, Permission.USER_ADMIN)).toBe(false);
      expect(UserPermissions.roleHasPermission(Role.REPORTER, Permission.GROUP_MANAGE)).toBe(false);
      expect(UserPermissions.roleHasPermission(Role.REPORTER, Permission.ATTENDANCE_MANAGE)).toBe(false);
      expect(UserPermissions.roleHasPermission(Role.REPORTER, Permission.CONTACT_EDIT)).toBe(false);
    });

    it('should grant only group/publisher permissions to GROUP_ADMIN role', () => {
      expect(UserPermissions.roleHasPermission(Role.GROUP_ADMIN, Permission.GROUP_MANAGE)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.GROUP_ADMIN, Permission.PUBLISHER_MANAGE)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.GROUP_ADMIN, Permission.REPORT_MANAGE)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.GROUP_ADMIN, Permission.USER_ADMIN)).toBe(false);
      expect(UserPermissions.roleHasPermission(Role.GROUP_ADMIN, Permission.ATTENDANCE_MANAGE)).toBe(false);
      expect(UserPermissions.roleHasPermission(Role.GROUP_ADMIN, Permission.CONTACT_EDIT)).toBe(false);
    });

    it('should grant only view own sheet permission to BASIC role', () => {
      expect(UserPermissions.roleHasPermission(Role.BASIC, Permission.VIEW_OWN_SHEET)).toBe(true);
      expect(UserPermissions.roleHasPermission(Role.BASIC, Permission.REPORT_MANAGE)).toBe(false);
      expect(UserPermissions.roleHasPermission(Role.BASIC, Permission.USER_ADMIN)).toBe(false);
      expect(UserPermissions.roleHasPermission(Role.BASIC, Permission.ATTENDANCE_MANAGE)).toBe(false);
      expect(UserPermissions.roleHasPermission(Role.BASIC, Permission.CONTACT_EDIT)).toBe(false);
    });
  });

  describe('userHasPermission', () => {
    it('should check permissions for user with explicit role', () => {
      const user: User = {
        id: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        publisherId: 'pub1',
        admin: false,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
        role: Role.REPORTER,
      };

      expect(UserPermissions.userHasPermission(user, Permission.REPORT_MANAGE)).toBe(true);
      expect(UserPermissions.userHasPermission(user, Permission.USER_ADMIN)).toBe(false);
      expect(UserPermissions.userHasPermission(user, Permission.ATTENDANCE_MANAGE)).toBe(false);
      expect(UserPermissions.userHasPermission(user, Permission.CONTACT_EDIT)).toBe(false);
    });

    it('should check additional permissions combined with base role', () => {
      const user: User = {
        id: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        publisherId: 'pub1',
        admin: false,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
        role: Role.REPORTER,
        canManageAttendance: true,
        canEditContacts: true,
      };

      // Base role permissions
      expect(UserPermissions.userHasPermission(user, Permission.REPORT_MANAGE)).toBe(true);
      expect(UserPermissions.userHasPermission(user, Permission.VIEW_GROUP_MEMBERS)).toBe(true);
      expect(UserPermissions.userHasPermission(user, Permission.USER_ADMIN)).toBe(false);

      // Additional permissions
      expect(UserPermissions.userHasPermission(user, Permission.ATTENDANCE_MANAGE)).toBe(true);
      expect(UserPermissions.userHasPermission(user, Permission.CONTACT_EDIT)).toBe(true);
    });

    it('should allow BASIC user to have additional permissions', () => {
      const user: User = {
        id: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        publisherId: 'pub1',
        admin: false,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
        role: Role.BASIC,
        canManageAttendance: true,
      };

      // Base role permissions
      expect(UserPermissions.userHasPermission(user, Permission.VIEW_OWN_SHEET)).toBe(true);
      expect(UserPermissions.userHasPermission(user, Permission.REPORT_MANAGE)).toBe(false);

      // Additional permissions
      expect(UserPermissions.userHasPermission(user, Permission.ATTENDANCE_MANAGE)).toBe(true);
      expect(UserPermissions.userHasPermission(user, Permission.CONTACT_EDIT)).toBe(false);
    });

    it('should fall back to admin field when role is not set', () => {
      const adminUser: User = {
        id: '1',
        displayName: 'Admin User',
        email: 'admin@example.com',
        publisherId: 'pub1',
        admin: true,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
        // No role set
      };

      expect(UserPermissions.userHasPermission(adminUser, Permission.REPORT_MANAGE)).toBe(true);
      expect(UserPermissions.userHasPermission(adminUser, Permission.USER_ADMIN)).toBe(false);
    });

    it('should default to basic permissions for non-admin users', () => {
      const basicUser: User = {
        id: '1',
        displayName: 'Basic User',
        email: 'basic@example.com',
        publisherId: 'pub1',
        admin: false,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
        // No role set
      };

      expect(UserPermissions.userHasPermission(basicUser, Permission.VIEW_OWN_SHEET)).toBe(true);
      expect(UserPermissions.userHasPermission(basicUser, Permission.REPORT_MANAGE)).toBe(false);
    });
  });

  describe('getEffectiveRole', () => {
    it('should return explicit role when set', () => {
      const user: User = {
        id: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        publisherId: 'pub1',
        admin: false,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
        role: Role.REPORTER,
      };

      expect(UserPermissions.getEffectiveRole(user)).toBe(Role.REPORTER);
    });

    it('should fall back to admin role for admin users', () => {
      const adminUser: User = {
        id: '1',
        displayName: 'Admin User',
        email: 'admin@example.com',
        publisherId: 'pub1',
        admin: true,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
      };

      expect(UserPermissions.getEffectiveRole(adminUser)).toBe(Role.ADMIN);
    });

    it('should default to basic role for regular users', () => {
      const basicUser: User = {
        id: '1',
        displayName: 'Basic User',
        email: 'basic@example.com',
        publisherId: 'pub1',
        admin: false,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
      };

      expect(UserPermissions.getEffectiveRole(basicUser)).toBe(Role.BASIC);
    });
  });

  describe('getAdditionalPermissions', () => {
    it('should return empty array for user with no additional permissions', () => {
      const user: User = {
        id: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        publisherId: 'pub1',
        admin: false,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
        role: Role.BASIC,
      };

      expect(UserPermissions.getAdditionalPermissions(user)).toEqual([]);
    });

    it('should return attendance permission when canManageAttendance is true', () => {
      const user: User = {
        id: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        publisherId: 'pub1',
        admin: false,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
        role: Role.BASIC,
        canManageAttendance: true,
      };

      expect(UserPermissions.getAdditionalPermissions(user)).toEqual([Permission.ATTENDANCE_MANAGE]);
    });

    it('should return contact permission when canEditContacts is true', () => {
      const user: User = {
        id: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        publisherId: 'pub1',
        admin: false,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
        role: Role.BASIC,
        canEditContacts: true,
      };

      expect(UserPermissions.getAdditionalPermissions(user)).toEqual([Permission.CONTACT_EDIT]);
    });

    it('should return both permissions when both are true', () => {
      const user: User = {
        id: '1',
        displayName: 'Test User',
        email: 'test@example.com',
        publisherId: 'pub1',
        admin: false,
        validated: true,
        groupId: 'group1',
        photoURL: '',
        phoneNumber: '',
        role: Role.BASIC,
        canManageAttendance: true,
        canEditContacts: true,
      };

      const permissions = UserPermissions.getAdditionalPermissions(user);
      expect(permissions).toHaveLength(2);
      expect(permissions).toContain(Permission.ATTENDANCE_MANAGE);
      expect(permissions).toContain(Permission.CONTACT_EDIT);
    });
  });

  describe('getRoleDisplayName', () => {
    it('should return correct display names for all roles', () => {
      expect(UserPermissions.getRoleDisplayName(Role.ROOT)).toBe('Root');
      expect(UserPermissions.getRoleDisplayName(Role.ADMIN)).toBe('Admin');
      expect(UserPermissions.getRoleDisplayName(Role.REPORTER)).toBe('Reporter');
      expect(UserPermissions.getRoleDisplayName(Role.GROUP_ADMIN)).toBe('Group Admin');
      expect(UserPermissions.getRoleDisplayName(Role.BASIC)).toBe('Basic');
    });
  });

  describe('getRoleDescription', () => {
    it('should return meaningful descriptions for all roles', () => {
      expect(UserPermissions.getRoleDescription(Role.ROOT)).toContain('Full access');
      expect(UserPermissions.getRoleDescription(Role.ADMIN)).toContain('Admin privileges except user administration');
      expect(UserPermissions.getRoleDescription(Role.REPORTER)).toContain('add/edit/delete reports');
      expect(UserPermissions.getRoleDescription(Role.GROUP_ADMIN)).toContain('manage groups and publishers');
      expect(UserPermissions.getRoleDescription(Role.BASIC)).toContain('view own sheet');
    });
  });

  describe('getPermissionDisplayName', () => {
    it('should return correct display names for permissions', () => {
      expect(UserPermissions.getPermissionDisplayName(Permission.ATTENDANCE_MANAGE)).toBe('Attendance Management');
      expect(UserPermissions.getPermissionDisplayName(Permission.CONTACT_EDIT)).toBe('Contact Editing');
      expect(UserPermissions.getPermissionDisplayName(Permission.USER_ADMIN)).toBe('User Administration');
    });
  });

  describe('getPermissionDescription', () => {
    it('should return meaningful descriptions for permissions', () => {
      expect(UserPermissions.getPermissionDescription(Permission.ATTENDANCE_MANAGE)).toContain('attendance records');
      expect(UserPermissions.getPermissionDescription(Permission.CONTACT_EDIT)).toContain('contact information');
      expect(UserPermissions.getPermissionDescription(Permission.USER_ADMIN)).toContain('create, modify, and delete users');
    });
  });
});
