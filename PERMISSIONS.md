# Granular Permission System

This document describes the new role-based permission system implemented for the Rewarded Recorder application.

## Overview

The application now uses a granular permission system with 7 distinct roles, replacing the previous simple admin/non-admin model. This system provides fine-grained access control while maintaining backward compatibility.

## Permission Levels

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

### 6. Attendance Reporter
- **Scope**: Attendance record management
- **Description**: Can add, delete, and modify attendance records
- **Permissions**: `ATTENDANCE_MANAGE`

### 7. Contact Editor
- **Scope**: Contact information editing
- **Description**: Can modify contact information of publishers
- **Permissions**: `CONTACT_EDIT`

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
    // ... other roles
)

// In server/entities/permission.go
type Permission string

const (
    PermissionUserAdmin Permission = "user_admin"
    PermissionReportManage Permission = "report_manage"
    // ... other permissions
)
```

#### User Entity
```go
// In server/entities/user.go
type User struct {
    // ... existing fields
    Admin       bool   `json:"admin" bson:"admin,omitempty"`         // Legacy
    IsSuperUser bool   `json:"isSuperUser" bson:"isSuperUser,omitempty"` // Legacy
    Role        Role   `json:"role" bson:"role,omitempty"`           // New role system
}

// Permission checking
func (u *User) HasPermission(permission Permission) bool {
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
  // ... other roles
}

export enum Permission {
  USER_ADMIN = 'user_admin',
  REPORT_MANAGE = 'report_manage',
  // ... other permissions
}

export interface User {
  // ... existing fields
  admin: boolean;      // Legacy
  role?: Role;         // New role system
}
```

#### Permission Checking
```typescript
// Permission utilities
export class UserPermissions {
  static userHasPermission(user: User, permission: Permission): boolean {
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

### Gradual Migration
1. New users automatically get explicit roles
2. Existing users can be updated through the admin interface
3. Legacy fields remain functional until all users are migrated

## API Endpoint Protection

Routes are now protected based on permissions:

```go
// User administration (Root only)
router.With(RequirePermission(PermissionUserAdmin)).Get("/api/users", HandleGetUsers)

// Report management (Reporter and above)
router.With(RequirePermission(PermissionReportManage)).Post("/api/reports", HandleCreateReport)

// Group viewing (Reporter, Group Admin, and above)
router.With(RequireAnyPermission(PermissionGroupManage, PermissionViewGroupMembers)).Get("/api/groups", HandleGetGroups)
```

## Testing

Comprehensive tests cover:
- Role permission mappings
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
2. **Defense in Depth**: Permissions checked at both middleware and application levels
3. **Audit Trail**: User actions and permission changes should be logged
4. **Role Hierarchy**: Root can override any permission check

## Usage Examples

### Checking Permissions in Components
```typescript
const currentUser = Users.getCurrent();

// Simple permission check
if (UserPermissions.userHasPermission(currentUser, Permission.REPORT_MANAGE)) {
  // Show report management UI
}

// Using permission guard
<PermissionGuard user={currentUser} permission={Permission.GROUP_MANAGE}>
  <GroupManagementButton />
</PermissionGuard>
```

### Backend Permission Enforcement
```go
user := getUserFromContext(r.Context())
if !user.HasPermission(entities.PermissionReportManage) {
    w.WriteHeader(http.StatusForbidden)
    return
}
// Proceed with operation
```

## Future Enhancements

1. **Dynamic Permissions**: Runtime permission assignment
2. **Resource-Level Permissions**: Per-group or per-publisher access
3. **Time-Based Permissions**: Temporary role assignments
4. **Permission Delegation**: Allow users to grant subset of their permissions

## Troubleshooting

### Common Issues

1. **User can't access feature**: Check effective role and required permissions
2. **Legacy users not working**: Verify backward compatibility logic
3. **API returns 403**: Ensure proper permission middleware is applied

### Debugging

```typescript
// Check user's effective role and permissions
const user = Users.getCurrent();
console.log('Effective Role:', UserPermissions.getEffectiveRole(user));
console.log('Has Report Permission:', UserPermissions.userHasPermission(user, Permission.REPORT_MANAGE));
```