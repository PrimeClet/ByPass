import '../models/user.dart';

class PermissionHelper {
  static UserPermissions getUserPermissions(UserRole role) {
    switch (role) {
      case UserRole.user:
        return UserPermissions(
          canSubmitRequest: true,
          canReceiveNotifications: true,
        );
      case UserRole.supervisor:
        return UserPermissions(
          canSubmitRequest: true,
          canApproveLevel1: true,
          canViewAllRequests: true,
          canExportData: true,
          canViewAuditLog: true,
          canReceiveNotifications: true,
          canRejectRequest: true,
          canViewDashboard: true,
          canViewEquipment: true,
          canViewUser: true,
          canViewZone: true,
          canViewSensor: true,
        );
      case UserRole.director:
        return UserPermissions(
          canSubmitRequest: true,
          canApproveLevel1: true,
          canApproveLevel2: true,
          canViewAllRequests: true,
          canExportData: true,
          canViewAuditLog: true,
          canReceiveNotifications: true,
          canRejectRequest: true,
          canCancelRequest: true,
          canViewDashboard: true,
          canViewEquipment: true,
          canCreateEquipment: true,
          canUpdateEquipment: true,
          canViewUser: true,
          canViewZone: true,
          canViewSensor: true,
          canCreateSensor: true,
          canUpdateSensor: true,
        );
      case UserRole.administrator:
        return UserPermissions(
          canViewAllRequests: true,
          canExportData: true,
          canViewAuditLog: true,
          canReceiveNotifications: true,
          canManageSettings: true,
          canRejectRequest: true,
          canCancelRequest: true,
          canViewDashboard: true,
          canManageRoles: true,
          canViewEquipment: true,
          canCreateEquipment: true,
          canUpdateEquipment: true,
          canDeleteEquipment: true,
          canViewUser: true,
          canCreateUser: true,
          canUpdateUser: true,
          canDeleteUser: true,
          canViewZone: true,
          canCreateZone: true,
          canUpdateZone: true,
          canDeleteZone: true,
          canViewSensor: true,
          canCreateSensor: true,
          canUpdateSensor: true,
          canDeleteSensor: true,
        );
    }
  }
}

