class AppNotification {
  final String id;
  final String type;
  final String notifiableType;
  final int notifiableId;
  final Map<String, dynamic> data;
  final DateTime? readAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  AppNotification({
    required this.id,
    required this.type,
    required this.notifiableType,
    required this.notifiableId,
    required this.data,
    this.readAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id']?.toString() ?? '',
      type: json['type'] ?? '',
      notifiableType: json['notifiable_type'] ?? '',
      notifiableId: json['notifiable_id'] is int
          ? json['notifiable_id']
          : int.tryParse(json['notifiable_id']?.toString() ?? '0') ?? 0,
      data: json['data'] is Map<String, dynamic>
          ? json['data']
          : {},
      readAt: json['read_at'] != null
          ? DateTime.tryParse(json['read_at'])
          : null,
      createdAt: DateTime.tryParse(json['created_at'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updated_at'] ?? '') ?? DateTime.now(),
    );
  }

  bool get isRead => readAt != null;

  String get title => data['title'] ?? 'Notification';
  String get message => data['message'] ?? '';
  String? get requestCode => data['request_code'];
  int? get requestId => data['request_id'];

  String get typeDisplayName {
    if (type.contains('RequestCreate')) {
      return 'Nouvelle demande';
    } else if (type.contains('RequestValidated')) {
      return 'Demande validée';
    } else if (type.contains('RequestLevel1Approved')) {
      return 'Validation niveau 1';
    } else if (type.contains('RequestUpdate')) {
      return 'Demande mise à jour';
    }
    return 'Notification';
  }
}

class DashboardSummary {
  final int activeRequests;
  final int pendingValidation;
  final int approvedToday;
  final int connectedUsers;

  DashboardSummary({
    required this.activeRequests,
    required this.pendingValidation,
    required this.approvedToday,
    required this.connectedUsers,
  });

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    return DashboardSummary(
      activeRequests: json['active_requests'] ?? json['activeRequests'] ?? 0,
      pendingValidation: json['pending_validation'] ?? json['pendingValidation'] ?? 0,
      approvedToday: json['approved_today'] ?? json['approvedToday'] ?? 0,
      connectedUsers: json['connected_users'] ?? json['connectedUsers'] ?? 0,
    );
  }
}

class SystemStatus {
  final int monitoredEquipment;
  final int onlineSensors;
  final int activeAlerts;
  final double systemPerformance;

  SystemStatus({
    required this.monitoredEquipment,
    required this.onlineSensors,
    required this.activeAlerts,
    required this.systemPerformance,
  });

  factory SystemStatus.fromJson(Map<String, dynamic> json) {
    return SystemStatus(
      monitoredEquipment: json['monitored_equipment'] ?? json['monitoredEquipment'] ?? 0,
      onlineSensors: json['online_sensors'] ?? json['onlineSensors'] ?? 0,
      activeAlerts: json['active_alerts'] ?? json['activeAlerts'] ?? 0,
      systemPerformance: (json['system_performance'] ?? json['systemPerformance'] ?? 0).toDouble(),
    );
  }
}

class RequestStatistics {
  final String date;
  final int total;
  final int approved;
  final int rejected;

  RequestStatistics({
    required this.date,
    required this.total,
    required this.approved,
    required this.rejected,
  });

  factory RequestStatistics.fromJson(Map<String, dynamic> json) {
    return RequestStatistics(
      date: json['date'] ?? '',
      total: json['total'] ?? 0,
      approved: json['approved'] ?? 0,
      rejected: json['rejected'] ?? 0,
    );
  }
}

class TopSensor {
  final int sensorId;
  final String sensorName;
  final String? equipmentName;
  final int requestCount;

  TopSensor({
    required this.sensorId,
    required this.sensorName,
    this.equipmentName,
    required this.requestCount,
  });

  factory TopSensor.fromJson(Map<String, dynamic> json) {
    return TopSensor(
      sensorId: json['sensor_id'] is int
          ? json['sensor_id']
          : int.tryParse(json['sensor_id']?.toString() ?? '0') ?? 0,
      sensorName: json['sensor_name'] ?? '',
      equipmentName: json['equipment_name'],
      requestCount: json['request_count'] ?? json['count'] ?? 0,
    );
  }
}
