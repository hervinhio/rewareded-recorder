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
		{RoleRoot, PermissionAttendanceManage, true, "Root should have attendance manage permission"},
		{RoleRoot, PermissionContactEdit, true, "Root should have contact edit permission"},
		
		// Admin should have all except user administration
		{RoleAdmin, PermissionReportManage, true, "Admin should have report manage permission"},
		{RoleAdmin, PermissionUserAdmin, false, "Admin should NOT have user admin permission"},
		{RoleAdmin, PermissionViewStats, true, "Admin should have view stats permission"},
		{RoleAdmin, PermissionAttendanceManage, true, "Admin should have attendance manage permission"},
		{RoleAdmin, PermissionContactEdit, true, "Admin should have contact edit permission"},
		
		// Reporter should only have report permissions
		{RoleReporter, PermissionReportManage, true, "Reporter should have report manage permission"},
		{RoleReporter, PermissionViewGroupMembers, true, "Reporter should have view group members permission"},
		{RoleReporter, PermissionUserAdmin, false, "Reporter should NOT have user admin permission"},
		{RoleReporter, PermissionGroupManage, false, "Reporter should NOT have group manage permission"},
		{RoleReporter, PermissionAttendanceManage, false, "Reporter should NOT have attendance manage permission (unless additional permission is granted)"},
		{RoleReporter, PermissionContactEdit, false, "Reporter should NOT have contact edit permission (unless additional permission is granted)"},
		
		// Group admin should only have group/publisher permissions
		{RoleGroupAdmin, PermissionGroupManage, true, "Group admin should have group manage permission"},
		{RoleGroupAdmin, PermissionPublisherManage, true, "Group admin should have publisher manage permission"},
		{RoleGroupAdmin, PermissionReportManage, false, "Group admin should NOT have report manage permission"},
		{RoleGroupAdmin, PermissionUserAdmin, false, "Group admin should NOT have user admin permission"},
		{RoleGroupAdmin, PermissionAttendanceManage, false, "Group admin should NOT have attendance manage permission (unless additional permission is granted)"},
		{RoleGroupAdmin, PermissionContactEdit, false, "Group admin should NOT have contact edit permission (unless additional permission is granted)"},
		
		// Basic should only view own sheet
		{RoleBasic, PermissionViewOwnSheet, true, "Basic should have view own sheet permission"},
		{RoleBasic, PermissionReportManage, false, "Basic should NOT have report manage permission"},
		{RoleBasic, PermissionUserAdmin, false, "Basic should NOT have user admin permission"},
		{RoleBasic, PermissionAttendanceManage, false, "Basic should NOT have attendance manage permission (unless additional permission is granted)"},
		{RoleBasic, PermissionContactEdit, false, "Basic should NOT have contact edit permission (unless additional permission is granted)"},
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
	
	// Test additional permissions combined with base role
	userWithAdditionalPerms := User{
		Role: RoleReporter,
		Admin: false,
		IsSuperUser: false,
		CanManageAttendance: true,
		CanEditContacts: true,
	}
	
	if !userWithAdditionalPerms.HasPermission(PermissionReportManage) {
		t.Error("User with Reporter role should have report manage permission")
	}
	
	if !userWithAdditionalPerms.HasPermission(PermissionAttendanceManage) {
		t.Error("User with attendance permission should have attendance manage permission")
	}
	
	if !userWithAdditionalPerms.HasPermission(PermissionContactEdit) {
		t.Error("User with contact permission should have contact edit permission")
	}
	
	// Test basic user with only additional permissions
	basicUserWithPerms := User{
		Role: RoleBasic,
		CanManageAttendance: true,
	}
	
	if !basicUserWithPerms.HasPermission(PermissionViewOwnSheet) {
		t.Error("Basic user should have view own sheet permission")
	}
	
	if !basicUserWithPerms.HasPermission(PermissionAttendanceManage) {
		t.Error("Basic user with attendance permission should have attendance manage permission")
	}
	
	if basicUserWithPerms.HasPermission(PermissionReportManage) {
		t.Error("Basic user should NOT have report manage permission")
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
	validRoles := []Role{RoleRoot, RoleAdmin, RoleReporter, RoleGroupAdmin, RoleBasic}
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
	
	// Test that old attendance_reporter and contact_editor roles are no longer valid
	oldAttendanceRole := Role("attendance_reporter")
	if oldAttendanceRole.IsValid() {
		t.Error("attendance_reporter role should no longer be valid")
	}
	
	oldContactRole := Role("contact_editor")
	if oldContactRole.IsValid() {
		t.Error("contact_editor role should no longer be valid")
	}
}

func TestAdditionalPermissions(t *testing.T) {
	// Test user with no additional permissions
	user := User{
		Role: RoleBasic,
	}
	
	perms := user.GetAdditionalPermissions()
	if len(perms) != 0 {
		t.Error("User with no additional permissions should return empty slice")
	}
	
	// Test user with attendance permission
	userWithAttendance := User{
		Role: RoleBasic,
		CanManageAttendance: true,
	}
	
	perms = userWithAttendance.GetAdditionalPermissions()
	if len(perms) != 1 || perms[0] != PermissionAttendanceManage {
		t.Error("User with attendance permission should return attendance manage permission")
	}
	
	// Test user with contact permission
	userWithContact := User{
		Role: RoleBasic,
		CanEditContacts: true,
	}
	
	perms = userWithContact.GetAdditionalPermissions()
	if len(perms) != 1 || perms[0] != PermissionContactEdit {
		t.Error("User with contact permission should return contact edit permission")
	}
	
	// Test user with both additional permissions
	userWithBoth := User{
		Role: RoleBasic,
		CanManageAttendance: true,
		CanEditContacts: true,
	}
	
	perms = userWithBoth.GetAdditionalPermissions()
	if len(perms) != 2 {
		t.Error("User with both additional permissions should return 2 permissions")
	}
	
	// Check that both permissions are present
	hasAttendance := false
	hasContact := false
	for _, perm := range perms {
		if perm == PermissionAttendanceManage {
			hasAttendance = true
		}
		if perm == PermissionContactEdit {
			hasContact = true
		}
	}
	
	if !hasAttendance {
		t.Error("User should have attendance manage permission")
	}
	if !hasContact {
		t.Error("User should have contact edit permission")
	}
}