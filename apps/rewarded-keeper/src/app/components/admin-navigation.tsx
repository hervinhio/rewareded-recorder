import React from 'react';
import { User, Permission } from '../types';
import { PermissionGuard, MultiPermissionGuard } from '../components/permission-guard';

interface AdminNavigationProps {
  currentUser: User;
  onNavigate: (page: string) => void;
}

/**
 * Example admin navigation component demonstrating role-based access control
 */
export const AdminNavigation: React.FC<AdminNavigationProps> = ({
  currentUser,
  onNavigate
}) => {
  return (
    <nav style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>
      <h3>Administration</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        
        {/* User administration - Only for Root role */}
        <PermissionGuard 
          user={currentUser} 
          permission={Permission.USER_ADMIN}
        >
          <li>
            <button onClick={() => onNavigate('users')}>
              👥 Manage Users
            </button>
          </li>
        </PermissionGuard>

        {/* Group management - For Group Admins and above */}
        <PermissionGuard 
          user={currentUser} 
          permission={Permission.GROUP_MANAGE}
        >
          <li>
            <button onClick={() => onNavigate('groups')}>
              🏢 Manage Groups
            </button>
          </li>
        </PermissionGuard>

        {/* Publisher management - For Group Admins and above */}
        <PermissionGuard 
          user={currentUser} 
          permission={Permission.PUBLISHER_MANAGE}
        >
          <li>
            <button onClick={() => onNavigate('publishers')}>
              📇 Manage Publishers
            </button>
          </li>
        </PermissionGuard>

        {/* Report management - For Reporters and above */}
        <PermissionGuard 
          user={currentUser} 
          permission={Permission.REPORT_MANAGE}
        >
          <li>
            <button onClick={() => onNavigate('reports')}>
              📊 Manage Reports
            </button>
          </li>
        </PermissionGuard>

        {/* Attendance management - For Attendance Reporters and above */}
        <PermissionGuard 
          user={currentUser} 
          permission={Permission.ATTENDANCE_MANAGE}
        >
          <li>
            <button onClick={() => onNavigate('attendance')}>
              📅 Manage Attendance
            </button>
          </li>
        </PermissionGuard>

        {/* Contact editing - For Contact Editors and above */}
        <PermissionGuard 
          user={currentUser} 
          permission={Permission.CONTACT_EDIT}
        >
          <li>
            <button onClick={() => onNavigate('contacts')}>
              📞 Edit Contacts
            </button>
          </li>
        </PermissionGuard>

        {/* Stats viewing - For multiple permissions (Reporters can view group members, admins can view stats) */}
        <MultiPermissionGuard 
          user={currentUser} 
          permissions={[Permission.VIEW_STATS, Permission.VIEW_GROUP_MEMBERS]}
          requireAll={false}
        >
          <li>
            <button onClick={() => onNavigate('stats')}>
              📈 View Statistics
            </button>
          </li>
        </MultiPermissionGuard>

        {/* Configuration management - For Admins and above */}
        <PermissionGuard 
          user={currentUser} 
          permission={Permission.CONFIG_MANAGE}
        >
          <li>
            <button onClick={() => onNavigate('config')}>
              ⚙️ System Configuration
            </button>
          </li>
        </PermissionGuard>

        {/* Basic access - Everyone can view their own sheet */}
        <PermissionGuard 
          user={currentUser} 
          permission={Permission.VIEW_OWN_SHEET}
        >
          <li>
            <button onClick={() => onNavigate('my-sheet')}>
              📋 My Sheet
            </button>
          </li>
        </PermissionGuard>
        
      </ul>
    </nav>
  );
};