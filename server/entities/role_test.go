package entities

import "testing"

func TestRolePermissions(t *testing.T) {
	tests := []struct {
		role       Role
		permission Permission
		expected   bool
		desc       string
	}{
		// Root should have all permissions
		{RoleRoot, PermissionUserAdmin, true, "Root should have user admin permission"},
		{RoleRoot, PermissionReportManage, true, "Root should have report manage permission"},
		{RoleRoot, PermissionViewStats, true, "Root should have view stats permission"},
		
		// Admin should have all except user administration
		{RoleAdmin, PermissionReportManage, true, "Admin should have report manage permission"},
		{RoleAdmin, PermissionUserAdmin, false, "Admin should NOT have user admin permission"},
		{RoleAdmin, PermissionViewStats, true, "Admin should have view stats permission"},
		
		// Reporter should only have report permissions
		{RoleReporter, PermissionReportManage, true, "Reporter should have report manage permission"},
		{RoleReporter, PermissionViewGroupMembers, true, "Reporter should have view group members permission"},
		{RoleReporter, PermissionUserAdmin, false, "Reporter should NOT have user admin permission"},
		{RoleReporter, PermissionGroupManage, false, "Reporter should NOT have group manage permission"},
		
		// Group admin should only have group/publisher permissions
		{RoleGroupAdmin, PermissionGroupManage, true, "Group admin should have group manage permission"},
		{RoleGroupAdmin, PermissionPublisherManage, true, "Group admin should have publisher manage permission"},
		{RoleGroupAdmin, PermissionReportManage, false, "Group admin should NOT have report manage permission"},
		{RoleGroupAdmin, PermissionUserAdmin, false, "Group admin should NOT have user admin permission"},
		
		// Basic should only view own sheet
		{RoleBasic, PermissionViewOwnSheet, true, "Basic should have view own sheet permission"},
		{RoleBasic, PermissionReportManage, false, "Basic should NOT have report manage permission"},
		{RoleBasic, PermissionUserAdmin, false, "Basic should NOT have user admin permission"},
		
		// Attendance reporter should only manage attendance
		{RoleAttendanceReporter, PermissionAttendanceManage, true, "Attendance reporter should have attendance manage permission"},
		{RoleAttendanceReporter, PermissionReportManage, false, "Attendance reporter should NOT have report manage permission"},
		{RoleAttendanceReporter, PermissionUserAdmin, false, "Attendance reporter should NOT have user admin permission"},
		
		// Contact editor should only edit contacts
		{RoleContactEditor, PermissionContactEdit, true, "Contact editor should have contact edit permission"},
		{RoleContactEditor, PermissionReportManage, false, "Contact editor should NOT have report manage permission"},
		{RoleContactEditor, PermissionUserAdmin, false, "Contact editor should NOT have user admin permission"},
	}

	for _, test := range tests {
		result := test.role.HasPermission(test.permission)
		if result != test.expected {
			t.Errorf("%s: expected %v, got %v", test.desc, test.expected, result)
		}
	}
}

func TestUserPermissions(t *testing.T) {
	// Test user with explicit role
	userWithRole := User{
		Role: RoleReporter,
		Admin: false,
		IsSuperUser: false,
	}
	
	if !userWithRole.HasPermission(PermissionReportManage) {
		t.Error("User with Reporter role should have report manage permission")
	}
	
	if userWithRole.HasPermission(PermissionUserAdmin) {
		t.Error("User with Reporter role should NOT have user admin permission")
	}
	
	// Test backward compatibility with admin field
	adminUser := User{
		Role: "", // No role set
		Admin: true,
		IsSuperUser: false,
	}
	
	if !adminUser.HasPermission(PermissionReportManage) {
		t.Error("Legacy admin user should have report manage permission")
	}
	
	if adminUser.HasPermission(PermissionUserAdmin) {
		t.Error("Legacy admin user should NOT have user admin permission")
	}
	
	// Test backward compatibility with superuser field
	superUser := User{
		Role: "", // No role set
		Admin: false,
		IsSuperUser: true,
	}
	
	if !superUser.HasPermission(PermissionUserAdmin) {
		t.Error("Legacy superuser should have user admin permission")
	}
	
	// Test basic user (no flags set)
	basicUser := User{
		Role: "", // No role set
		Admin: false,
		IsSuperUser: false,
	}
	
	if !basicUser.HasPermission(PermissionViewOwnSheet) {
		t.Error("Basic user should have view own sheet permission")
	}
	
	if basicUser.HasPermission(PermissionReportManage) {
		t.Error("Basic user should NOT have report manage permission")
	}
}

func TestGetEffectiveRole(t *testing.T) {
	// Test explicit role
	userWithRole := User{Role: RoleReporter}
	if userWithRole.GetEffectiveRole() != RoleReporter {
		t.Error("User with explicit role should return that role")
	}
	
	// Test superuser fallback
	superUser := User{IsSuperUser: true}
	if superUser.GetEffectiveRole() != RoleRoot {
		t.Error("Superuser should have root role")
	}
	
	// Test admin fallback
	adminUser := User{Admin: true}
	if adminUser.GetEffectiveRole() != RoleAdmin {
		t.Error("Admin user should have admin role")
	}
	
	// Test basic fallback
	basicUser := User{}
	if basicUser.GetEffectiveRole() != RoleBasic {
		t.Error("User with no flags should have basic role")
	}
}

func TestRoleValidation(t *testing.T) {
	// Test valid roles
	validRoles := []Role{RoleRoot, RoleAdmin, RoleReporter, RoleGroupAdmin, RoleBasic, RoleAttendanceReporter, RoleContactEditor}
	for _, role := range validRoles {
		if !role.IsValid() {
			t.Errorf("Role %s should be valid", role)
		}
	}
	
	// Test invalid role
	invalidRole := Role("invalid_role")
	if invalidRole.IsValid() {
		t.Error("Invalid role should not be valid")
	}
}