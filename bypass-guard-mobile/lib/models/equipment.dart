class Equipment {
  final String id;
  final String name;
  final String? code;
  final String type;
  final String zone;
  final String? location;
  final String fabricant;
  final String? model;
  final String? serialNumber;
  final DateTime? installationDate;
  final DateTime? lastMaintenance;
  final String status;
  final String criticite;
  final List<Sensor> sensors;

  Equipment({
    required this.id,
    required this.name,
    this.code,
    required this.type,
    required this.zone,
    this.location,
    required this.fabricant,
    this.model,
    this.serialNumber,
    this.installationDate,
    this.lastMaintenance,
    required this.status,
    required this.criticite,
    required this.sensors,
  });

  factory Equipment.fromJson(Map<String, dynamic> json) {
    return Equipment(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      code: json['code'],
      type: json['type'] ?? '',
      zone: json['zone'] ?? '',
      location: json['location'],
      fabricant: json['fabricant'] ?? '',
      model: json['model'],
      serialNumber: json['serial_number'] ?? json['serialNumber'],
      installationDate: json['installation_date'] != null
          ? DateTime.parse(json['installation_date'])
          : null,
      lastMaintenance: json['last_maintenance'] != null
          ? DateTime.parse(json['last_maintenance'])
          : null,
      status: json['status'] ?? 'operational',
      criticite: json['criticite'] ?? json['criticality'] ?? 'medium',
      sensors: (json['sensors'] as List<dynamic>?)
          ?.map((e) => Sensor.fromJson(e))
          .toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'type': type,
      'zone': zone,
      'location': location,
      'fabricant': fabricant,
      'model': model,
      'serial_number': serialNumber,
      'installation_date': installationDate?.toIso8601String(),
      'last_maintenance': lastMaintenance?.toIso8601String(),
      'status': status,
      'criticite': criticite,
    };
  }
}

class Zone {
  final String id;
  final String name;
  final String description;
  final int equipmentCount;

  Zone({
    required this.id,
    required this.name,
    required this.description,
    this.equipmentCount = 0,
  });

  factory Zone.fromJson(Map<String, dynamic> json) {
    return Zone(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      equipmentCount: json['equipment_count'] ?? json['equipmentCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
    };
  }
}

class Sensor {
  final String id;
  final String equipmentId;
  final String name;
  final String code;
  final String type;
  final String unit;
  final double? minValue;
  final double? maxValue;
  final double? criticalThreshold;
  final double? warningThreshold;
  final String status;
  final DateTime? lastCalibration;
  final DateTime? nextCalibration;
  final bool isActive;

  Sensor({
    required this.id,
    required this.equipmentId,
    required this.name,
    required this.code,
    required this.type,
    required this.unit,
    this.minValue,
    this.maxValue,
    this.criticalThreshold,
    this.warningThreshold,
    required this.status,
    this.lastCalibration,
    this.nextCalibration,
    required this.isActive,
  });

  factory Sensor.fromJson(Map<String, dynamic> json) {
    return Sensor(
      id: json['id'].toString(),
      equipmentId: json['equipment_id'] ?? json['equipmentId'] ?? '',
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      type: json['type'] ?? '',
      unit: json['unit'] ?? '',
      minValue: json['min_value'] != null
          ? (json['min_value'] as num).toDouble()
          : null,
      maxValue: json['max_value'] != null
          ? (json['max_value'] as num).toDouble()
          : null,
      criticalThreshold: json['critical_threshold'] != null
          ? (json['critical_threshold'] as num).toDouble()
          : null,
      warningThreshold: json['warning_threshold'] != null
          ? (json['warning_threshold'] as num).toDouble()
          : null,
      status: json['status'] ?? 'active',
      lastCalibration: json['last_calibration'] != null
          ? DateTime.parse(json['last_calibration'])
          : null,
      nextCalibration: json['next_calibration'] != null
          ? DateTime.parse(json['next_calibration'])
          : null,
      isActive: json['is_active'] ?? json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'equipment_id': equipmentId,
      'name': name,
      'code': code,
      'type': type,
      'unit': unit,
      'min_value': minValue,
      'max_value': maxValue,
      'critical_threshold': criticalThreshold,
      'warning_threshold': warningThreshold,
      'status': status,
      'last_calibration': lastCalibration?.toIso8601String(),
      'next_calibration': nextCalibration?.toIso8601String(),
      'is_active': isActive,
    };
  }
}

