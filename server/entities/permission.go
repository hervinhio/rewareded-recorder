package entities

// Permission represents specific permissions that can be granted to roles
type Permission string

const (
	// User administration
	PermissionUserAdmin Permission = "user_admin"
	
	// Report management
	PermissionReportManage Permission = "report_manage"
	
	// View group members
	PermissionViewGroupMembers Permission = "view_group_members"
	
	// Group management
	PermissionGroupManage Permission = "group_manage"
	
	// Publisher management
	PermissionPublisherManage Permission = "publisher_manage"
	
	// View own sheet only
	PermissionViewOwnSheet Permission = "view_own_sheet"
	
	// Attendance management
	PermissionAttendanceManage Permission = "attendance_manage"
	
	// Contact editing
	PermissionContactEdit Permission = "contact_edit"
	
	// Stats viewing
	PermissionViewStats Permission = "view_stats"
	
	// Configuration management
	PermissionConfigManage Permission = "config_manage"
)

// GetAllPermissions returns all available permissions
func GetAllPermissions() []Permission {
	return []Permission{
		PermissionUserAdmin,
		PermissionReportManage,
		PermissionViewGroupMembers,
		PermissionGroupManage,
		PermissionPublisherManage,
		PermissionViewOwnSheet,
		PermissionAttendanceManage,
		PermissionContactEdit,
		PermissionViewStats,
		PermissionConfigManage,
	}
}

// IsValid checks if the permission is valid
func (p Permission) IsValid() bool {
	for _, permission := range GetAllPermissions() {
		if p == permission {
			return true
		}
	}
	return false
}

// String returns the string representation of the permission
func (p Permission) String() string {
	return string(p)
}