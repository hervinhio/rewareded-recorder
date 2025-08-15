# Granular Permission System

This document describes the new role-based permission system implemented for the Rewarded Recorder application.

## Overview

The application now uses a granular permission system with 5 distinct base roles, plus additional combinable permissions, replacing the previous simple admin/non-admin model. This system provides fine-grained access control while maintaining backward compatibility.

## Base Roles

### 1. Root
- **Scope**: All accesses
- **Description**: Full administrative access to all features
- **Equivalent to**: Previous `IsSuperUser` flag
- **Permissions**: All permissions granted

### 2. Admin  
- **Scope**: Admin privileges except user administration
- **Description**: Can manage most aspects of the system but cannot create/modify users
- **Permissions**: All except `USER_ADMIN`

### 3. Reporter
- **Scope**: Report management and group viewing
- **Description**: Can add, edit, and delete reports, and view all members of a group
- **Permissions**: `REPORT_MANAGE`, `VIEW_GROUP_MEMBERS`

### 4. Group Admin
- **Scope**: Group and publisher management
- **Description**: Can add, delete, and modify groups and publishers
- **Permissions**: `GROUP_MANAGE`, `PUBLISHER_MANAGE`

### 5. Basic
- **Scope**: Personal access only
- **Description**: Most restrictive role - can only see their own sheet
- **Permissions**: `VIEW_OWN_SHEET`

## Additional Combinable Permissions

These permissions can be combined with any base role:

### Attendance Management
- **Field**: `canManageAttendance`
- **Permission**: `ATTENDANCE_MANAGE`
- **Description**: Can add, delete, and modify attendance records
- **Combinable with**: All base roles

### Contact Editing
- **Field**: `canEditContacts`
- **Permission**: `CONTACT_EDIT`
- **Description**: Can modify contact information of publishers
- **Combinable with**: All base roles

## Available Permissions

| Permission | Description |
|------------|-------------|
| `USER_ADMIN` | User administration (create, modify, delete users) |
| `REPORT_MANAGE` | Manage reports (create, edit, delete) |
| `VIEW_GROUP_MEMBERS` | View all members of a group |
| `GROUP_MANAGE` | Manage groups (create, edit, delete) |
| `PUBLISHER_MANAGE` | Manage publishers (create, edit, delete) |
| `VIEW_OWN_SHEET` | View personal sheet/data |
| `ATTENDANCE_MANAGE` | Manage attendance records |
| `CONTACT_EDIT` | Edit contact information |
| `VIEW_STATS` | View system statistics |
| `CONFIG_MANAGE` | Manage system configuration |

## Implementation

### Backend (Go)

#### Role and Permission Definitions
```go
// In server/entities/role.go
type Role string

const (
    RoleRoot Role = "root"
    RoleAdmin Role = "admin"
    RoleReporter Role = "reporter"
    RoleGroupAdmin Role = "group_admin"
    RoleBasic Role = "basic"
)

// In server/entities/permission.go
type Permission string

const (
    PermissionUserAdmin Permission = "user_admin"
    PermissionReportManage Permission = "report_manage"
    PermissionAttendanceManage Permission = "attendance_manage"
    PermissionContactEdit Permission = "contact_edit"
    // ... other permissions
)
```

#### User Entity
```go
// In server/entities/user.go
type User struct {
    // ... existing fields
    Admin               bool   `json:"admin" bson:"admin,omitempty"`         // Legacy
    IsSuperUser         bool   `json:"isSuperUser" bson:"isSuperUser,omitempty"` // Legacy
    Role                Role   `json:"role" bson:"role,omitempty"`           // Base role
    CanManageAttendance bool   `json:"canManageAttendance" bson:"canManageAttendance,omitempty"` // Additional permission
    CanEditContacts     bool   `json:"canEditContacts" bson:"canEditContacts,omitempty"` // Additional permission
}

// Permission checking
func (u *User) HasPermission(permission Permission) bool {
    // Check additional permissions first
    if permission == PermissionAttendanceManage && u.CanManageAttendance {
        return true
    }
    if permission == PermissionContactEdit && u.CanEditContacts {
        return true
    }
    
    // Then check base role permissions
    return u.GetEffectiveRole().HasPermission(permission)
}
```

#### Middleware Protection
```go
// In server/middlewares/permissions.go
func RequirePermission(permission entities.Permission) func(http.Handler) http.Handler {
    // Implementation that checks user permissions
}

// Usage in routes
router.With(middlewares.RequirePermission(entities.PermissionUserAdmin)).Get("/api/users", api.HandleGetUsers)
```

### Frontend (TypeScript)

#### Type Definitions
```typescript
// In apps/rewarded-keeper/src/app/types/user.ts
export enum Role {
  ROOT = 'root',
  ADMIN = 'admin',
  REPORTER = 'reporter',
  GROUP_ADMIN = 'group_admin',
  BASIC = 'basic',
}

export enum Permission {
  USER_ADMIN = 'user_admin',
  REPORT_MANAGE = 'report_manage',
  ATTENDANCE_MANAGE = 'attendance_manage',
  CONTACT_EDIT = 'contact_edit',
  // ... other permissions
}

export interface User {
  // ... existing fields
  admin: boolean;                     // Legacy
  role?: Role;                        // Base role
  canManageAttendance?: boolean;      // Additional permission
  canEditContacts?: boolean;          // Additional permission
}
```

#### Permission Checking
```typescript
// Permission utilities
export class UserPermissions {
  static userHasPermission(user: User, permission: Permission): boolean {
    // Check additional permissions first
    if (permission === Permission.ATTENDANCE_MANAGE && user.canManageAttendance) {
      return true;
    }
    if (permission === Permission.CONTACT_EDIT && user.canEditContacts) {
      return true;
    }
    
    // Then check base role permissions
    const effectiveRole = this.getEffectiveRole(user);
    return this.roleHasPermission(effectiveRole, permission);
  }

  static getEffectiveRole(user: User): Role {
    // Priority: explicit role > legacy admin > basic
    if (user.role && this.isValidRole(user.role)) {
      return user.role;
    }
    return user.admin ? Role.ADMIN : Role.BASIC;
  }
}
```

#### UI Components
```typescript
// Permission-based rendering
import { PermissionGuard } from '../components/permission-guard';

<PermissionGuard 
  user={currentUser} 
  permission={Permission.USER_ADMIN}
>
  <AdminPanel />
</PermissionGuard>
```

## Migration Strategy

### Backward Compatibility
- Existing `admin` and `isSuperUser` boolean fields are preserved
- Users without explicit roles fall back to legacy fields:
  - `isSuperUser: true` → `Role.ROOT`
  - `admin: true` → `Role.ADMIN`  
  - Default → `Role.BASIC`

### Migrating from Previous System
Users who previously had:
- `role: "attendance_reporter"` → should be migrated to `role: "basic"` + `canManageAttendance: true`
- `role: "contact_editor"` → should be migrated to `role: "basic"` + `canEditContacts: true`

### Gradual Migration
1. New users automatically get explicit roles
2. Existing users can be updated through the admin interface
3. Legacy fields remain functional until all users are migrated

## Example Use Cases

### User with Combined Permissions
```typescript
const user: User = {
  role: Role.REPORTER,           // Can manage reports and view group members
  canManageAttendance: true,     // Can also manage attendance
  canEditContacts: true,         // Can also edit contacts
  // ... other fields
};

// This user can:
// - Manage reports (from Reporter role)
// - View group members (from Reporter role)
// - Manage attendance (additional permission)
// - Edit contacts (additional permission)
```

### Basic User with Specific Additional Permissions
```typescript
const user: User = {
  role: Role.BASIC,              // Can only view own sheet
  canManageAttendance: true,     // But can manage attendance
  // ... other fields
};

// This user can:
// - View own sheet (from Basic role)
// - Manage attendance (additional permission)
// - NOT manage reports, groups, etc.
```

## API Endpoint Protection

Routes are now protected based on permissions:

```go
// User administration (Root only)
router.With(RequirePermission(PermissionUserAdmin)).Get("/api/users", HandleGetUsers)

// Report management (Reporter and above)
router.With(RequirePermission(PermissionReportManage)).Post("/api/reports", HandleCreateReport)

// Attendance management (Anyone with attendance permission)
router.With(RequirePermission(PermissionAttendanceManage)).Post("/api/attendance", HandleCreateAttendance)

// Contact editing (Anyone with contact edit permission)
router.With(RequirePermission(PermissionContactEdit)).Put("/api/publishers/{id}/contact", HandleUpdateContact)
```

## Testing

Comprehensive tests cover:
- Base role permission mappings
- Additional permission combinations
- User permission checking
- Backward compatibility scenarios
- Permission inheritance

### Running Tests

**Backend:**
```bash
cd server
go test ./entities -v
```

**Frontend:**
```bash
cd apps/rewarded-keeper
npm test -- user.test.ts
```

## Security Considerations

1. **Principle of Least Privilege**: Each role has minimal required permissions
2. **Combinable Permissions**: Additional permissions can be granted without escalating base role
3. **Defense in Depth**: Permissions checked at both middleware and application levels
4. **Audit Trail**: User actions and permission changes should be logged
5. **Role Hierarchy**: Root can override any permission check

## Usage Examples

### Checking Permissions in Components
```typescript
const currentUser = Users.getCurrent();

// Check base role permission
if (UserPermissions.userHasPermission(currentUser, Permission.REPORT_MANAGE)) {
  // Show report management UI
}

// Check additional permissions
if (UserPermissions.userHasPermission(currentUser, Permission.ATTENDANCE_MANAGE)) {
  // Show attendance management UI
}

// Using permission guard
<PermissionGuard user={currentUser} permission={Permission.CONTACT_EDIT}>
  <ContactEditButton />
</PermissionGuard>
```

### Backend Permission Enforcement
```go
user := getUserFromContext(r.Context())
if !user.HasPermission(entities.PermissionAttendanceManage) {
    w.WriteHeader(http.StatusForbidden)
    return
}
// Proceed with attendance operation
```

## Future Enhancements

1. **Dynamic Permissions**: Runtime permission assignment
2. **Resource-Level Permissions**: Per-group or per-publisher access
3. **Time-Based Permissions**: Temporary permission assignments
4. **Permission Delegation**: Allow users to grant subset of their permissions

## Troubleshooting

### Common Issues

1. **User can't access feature**: Check both base role and additional permissions
2. **Legacy users not working**: Verify backward compatibility logic
3. **API returns 403**: Ensure proper permission middleware is applied

### Debugging

```typescript
// Check user's effective role and permissions
const user = Users.getCurrent();
console.log('Effective Role:', UserPermissions.getEffectiveRole(user));
console.log('Additional Permissions:', UserPermissions.getAdditionalPermissions(user));
console.log('Has Report Permission:', UserPermissions.userHasPermission(user, Permission.REPORT_MANAGE));
console.log('Has Attendance Permission:', UserPermissions.userHasPermission(user, Permission.ATTENDANCE_MANAGE));
```