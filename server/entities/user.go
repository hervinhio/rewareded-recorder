package entities

type User struct {
	Id                   interface{}    `json:"id" bson:"_id,omitempty"`
	DisplayName          string         `json:"displayName" bson:"displayName,omitempty"`
	Email                string         `json:"email" bson:"email,omitempty"`
	PublisherId          string         `json:"publisherId" bson:"publisherId,omitempty"`
	Admin                bool           `json:"admin" bson:"admin,omitempty"` // Keep for backward compatibility
	Validated            bool           `json:"validated" bson:"validated,omitempty"`
	GroupId              string         `json:"groupId" bson:"groupId,omitempty"`
	PhotoURL             string         `json:"photoUrl" bson:"photoUrl,omitempty"`
	PhoneNumber          string         `json:"phoneNumber" bson:"phoneNumber,omitempty"`
	RealmId              string         `json:"realmId" bson:"realmId,omitempty"`
	IsSuperUser          bool           `json:"isSuperUser" bson:"isSuperUser,omitempty"` // Keep for backward compatibility
	Role                 Role           `json:"role" bson:"role,omitempty"` // New role-based permission system
	CanManageAttendance  bool           `json:"canManageAttendance" bson:"canManageAttendance,omitempty"` // Additional permission that can be combined with any role
	CanEditContacts      bool           `json:"canEditContacts" bson:"canEditContacts,omitempty"` // Additional permission that can be combined with any role
	Notifications        []Notification `json:"notifications" bson:"notifications,omitempty"`
}

// HasPermission checks if the user has a specific permission
func (u *User) HasPermission(permission Permission) bool {
	// For backward compatibility, check legacy fields first
	if u.IsSuperUser {
		return true
	}
	
	// Check additional permissions that can be combined with any role
	if permission == PermissionAttendanceManage && u.CanManageAttendance {
		return true
	}
	if permission == PermissionContactEdit && u.CanEditContacts {
		return true
	}
	
	// If role is not set, fallback to legacy admin field
	if u.Role == "" {
		if u.Admin {
			return RoleAdmin.HasPermission(permission)
		}
		return RoleBasic.HasPermission(permission)
	}
	
	// Use the new role-based system
	return u.Role.HasPermission(permission)
}

// GetEffectiveRole returns the effective role for the user, considering legacy fields
func (u *User) GetEffectiveRole() Role {
	// If role is explicitly set, use it
	if u.Role != "" && u.Role.IsValid() {
		return u.Role
	}
	
	// Fallback to legacy fields for backward compatibility
	if u.IsSuperUser {
		return RoleRoot
	}
	if u.Admin {
		return RoleAdmin
	}
	
	// Default to basic role
	return RoleBasic
}

// GetAdditionalPermissions returns the additional permissions for the user
func (u *User) GetAdditionalPermissions() []Permission {
	var permissions []Permission
	
	if u.CanManageAttendance {
		permissions = append(permissions, PermissionAttendanceManage)
	}
	
	if u.CanEditContacts {
		permissions = append(permissions, PermissionContactEdit)
	}
	
	return permissions
}
