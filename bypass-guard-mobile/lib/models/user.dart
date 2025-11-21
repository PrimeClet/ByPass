class User {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final UserRole role;
  final String department;
  final String zone;
  final String? phone;
  final String employeeId;
  final bool isActive;
  final DateTime? lastLogin;

  User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.role,
    required this.department,
    required this.zone,
    this.phone,
    required this.employeeId,
    required this.isActive,
    this.lastLogin,
  });

  String get fullName => '$firstName $lastName';

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'].toString(),
      firstName: json['first_name'] ?? json['firstName'] ?? '',
      lastName: json['last_name'] ?? json['lastName'] ?? '',
      email: json['email'] ?? '',
      role: UserRole.fromString(json['role'] ?? 'user'),
      department: json['department'] ?? '',
      zone: json['zone'] ?? '',
      phone: json['phone'],
      employeeId: json['employee_id'] ?? json['employeeId'] ?? '',
      isActive: json['is_active'] ?? json['isActive'] ?? true,
      lastLogin: json['last_login'] != null
          ? DateTime.parse(json['last_login'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'role': role.value,
      'department': department,
      'zone': zone,
      'phone': phone,
      'employee_id': employeeId,
      'is_active': isActive,
      'last_login': lastLogin?.toIso8601String(),
    };
  }
}

enum UserRole {
  user('user'),
  supervisor('supervisor'),
  director('director'),
  administrator('administrator');

  final String value;
  const UserRole(this.value);

  static UserRole fromString(String value) {
    return UserRole.values.firstWhere(
      (role) => role.value == value,
      orElse: () => UserRole.user,
    );
  }

  String get displayName {
    switch (this) {
      case UserRole.user:
        return 'Demandeur';
      case UserRole.supervisor:
        return 'Approbateur N1';
      case UserRole.director:
        return 'Approbateur N2';
      case UserRole.administrator:
        return 'Administrateur';
    }
  }
}

class UserPermissions {
  final bool canSubmitRequest;
  final bool canApproveLevel1;
  final bool canApproveLevel2;
  final bool canViewAllRequests;
  final bool canExportData;
  final bool canViewAuditLog;
  final bool canReceiveNotifications;
  final bool canManageSettings;
  final bool canRejectRequest;
  final bool canCancelRequest;
  final bool canViewDashboard;
  final bool canManageRoles;
  final bool canViewEquipment;
  final bool canCreateEquipment;
  final bool canUpdateEquipment;
  final bool canDeleteEquipment;
  final bool canViewUser;
  final bool canCreateUser;
  final bool canUpdateUser;
  final bool canDeleteUser;
  final bool canViewZone;
  final bool canCreateZone;
  final bool canUpdateZone;
  final bool canDeleteZone;
  final bool canViewSensor;
  final bool canCreateSensor;
  final bool canUpdateSensor;
  final bool canDeleteSensor;

  UserPermissions({
    this.canSubmitRequest = false,
    this.canApproveLevel1 = false,
    this.canApproveLevel2 = false,
    this.canViewAllRequests = false,
    this.canExportData = false,
    this.canViewAuditLog = false,
    this.canReceiveNotifications = false,
    this.canManageSettings = false,
    this.canRejectRequest = false,
    this.canCancelRequest = false,
    this.canViewDashboard = false,
    this.canManageRoles = false,
    this.canViewEquipment = false,
    this.canCreateEquipment = false,
    this.canUpdateEquipment = false,
    this.canDeleteEquipment = false,
    this.canViewUser = false,
    this.canCreateUser = false,
    this.canUpdateUser = false,
    this.canDeleteUser = false,
    this.canViewZone = false,
    this.canCreateZone = false,
    this.canUpdateZone = false,
    this.canDeleteZone = false,
    this.canViewSensor = false,
    this.canCreateSensor = false,
    this.canUpdateSensor = false,
    this.canDeleteSensor = false,
  });

  factory UserPermissions.fromJson(Map<String, dynamic> json) {
    return UserPermissions(
      canSubmitRequest: json['canSubmitRequest'] ?? false,
      canApproveLevel1: json['canApproveLevel1'] ?? false,
      canApproveLevel2: json['canApproveLevel2'] ?? false,
      canViewAllRequests: json['canViewAllRequests'] ?? false,
      canExportData: json['canExportData'] ?? false,
      canViewAuditLog: json['canViewAuditLog'] ?? false,
      canReceiveNotifications: json['canReceiveNotifications'] ?? false,
      canManageSettings: json['canManageSettings'] ?? false,
      canRejectRequest: json['canRejectRequest'] ?? false,
      canCancelRequest: json['canCancelRequest'] ?? false,
      canViewDashboard: json['canViewDashboard'] ?? false,
      canManageRoles: json['canManageRoles'] ?? false,
      canViewEquipment: json['canViewEquipment'] ?? false,
      canCreateEquipment: json['canCreateEquipment'] ?? false,
      canUpdateEquipment: json['canUpdateEquipment'] ?? false,
      canDeleteEquipment: json['canDeleteEquipment'] ?? false,
      canViewUser: json['canViewUser'] ?? false,
      canCreateUser: json['canCreateUser'] ?? false,
      canUpdateUser: json['canUpdateUser'] ?? false,
      canDeleteUser: json['canDeleteUser'] ?? false,
      canViewZone: json['canViewZone'] ?? false,
      canCreateZone: json['canCreateZone'] ?? false,
      canUpdateZone: json['canUpdateZone'] ?? false,
      canDeleteZone: json['canDeleteZone'] ?? false,
      canViewSensor: json['canViewSensor'] ?? false,
      canCreateSensor: json['canCreateSensor'] ?? false,
      canUpdateSensor: json['canUpdateSensor'] ?? false,
      canDeleteSensor: json['canDeleteSensor'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'canSubmitRequest': canSubmitRequest,
      'canApproveLevel1': canApproveLevel1,
      'canApproveLevel2': canApproveLevel2,
      'canViewAllRequests': canViewAllRequests,
      'canExportData': canExportData,
      'canViewAuditLog': canViewAuditLog,
      'canReceiveNotifications': canReceiveNotifications,
      'canManageSettings': canManageSettings,
      'canRejectRequest': canRejectRequest,
      'canCancelRequest': canCancelRequest,
      'canViewDashboard': canViewDashboard,
      'canManageRoles': canManageRoles,
      'canViewEquipment': canViewEquipment,
      'canCreateEquipment': canCreateEquipment,
      'canUpdateEquipment': canUpdateEquipment,
      'canDeleteEquipment': canDeleteEquipment,
      'canViewUser': canViewUser,
      'canCreateUser': canCreateUser,
      'canUpdateUser': canUpdateUser,
      'canDeleteUser': canDeleteUser,
      'canViewZone': canViewZone,
      'canCreateZone': canCreateZone,
      'canUpdateZone': canUpdateZone,
      'canDeleteZone': canDeleteZone,
      'canViewSensor': canViewSensor,
      'canCreateSensor': canCreateSensor,
      'canUpdateSensor': canUpdateSensor,
      'canDeleteSensor': canDeleteSensor,
    };
  }
}

