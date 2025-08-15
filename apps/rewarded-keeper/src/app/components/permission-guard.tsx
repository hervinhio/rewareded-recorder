import React from 'react';
import { User, Permission, UserPermissions } from '../types';

interface PermissionGuardProps {
  user: User;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard component that conditionally renders children based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  user,
  permission,
  children,
  fallback = null,
}) => {
  const hasPermission = UserPermissions.userHasPermission(user, permission);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

interface RoleGuardProps {
  user: User;
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RoleGuard component that conditionally renders children based on user role
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  user,
  allowedRoles,
  children,
  fallback = null,
}) => {
  const userRole = UserPermissions.getEffectiveRole(user);
  const hasRole = allowedRoles.includes(userRole);

  return hasRole ? <>{children}</> : <>{fallback}</>;
};

interface MultiPermissionGuardProps {
  user: User;
  permissions: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission.
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * MultiPermissionGuard component that checks multiple permissions
 */
export const MultiPermissionGuard: React.FC<MultiPermissionGuardProps> = ({
  user,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const hasPermission = requireAll
    ? permissions.every((permission) =>
        UserPermissions.userHasPermission(user, permission),
      )
    : permissions.some((permission) =>
        UserPermissions.userHasPermission(user, permission),
      );

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};
