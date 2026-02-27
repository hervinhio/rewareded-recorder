package entities

// Role represents the different permission levels in the system
type Role string

const (
	// RoleRoot has all accesses (equivalent to IsSuperUser)
	RoleRoot Role = "root"

	// RoleAdmin has admin privileges except user administration
	RoleAdmin Role = "admin"

	// RoleReporter can add/edit/delete reports and view all members of a group
	RoleReporter Role = "reporter"

	// RoleGroupAdmin can add/delete/modify groups and publishers
	RoleGroupAdmin Role = "group_admin"

	// RoleBasic can only see own sheet (most restrictive)
	RoleBasic Role = "basic"
)

// GetAllRoles returns all available roles
func GetAllRoles() []Role {
	return []Role{
		RoleRoot,
		RoleAdmin,
		RoleReporter,
		RoleGroupAdmin,
		RoleBasic,
	}
}

// IsValid checks if the role is valid
func (r Role) IsValid() bool {
	for _, role := range GetAllRoles() {
		if r == role {
			return true
		}
	}
	return false
}

// String returns the string representation of the role
func (r Role) String() string {
	return string(r)
}

// HasPermission checks if the role has a specific permission
func (r Role) HasPermission(permission Permission) bool {
	switch r {
	case RoleRoot:
		return true // Root has all permissions
	case RoleAdmin:
		// Admin has all except user administration
		return permission != PermissionUserAdmin
	case RoleReporter:
		return permission == PermissionReportManage || permission == PermissionViewGroupMembers
	case RoleGroupAdmin:
		return permission == PermissionGroupManage || permission == PermissionPublisherManage
	case RoleBasic:
		return permission == PermissionViewOwnSheet
	default:
		return false
	}
}
