class BypassRequest {
  final String id;
  final String requestNumber;
  final String equipmentId;
  final String equipmentName;
  final String sensorId;
  final String sensorName;
  final String sensorType;
  final String zone;
  final String initiatorId;
  final String initiatorName;
  final String initiatorDepartment;
  final DateTime requestedDate;
  final DateTime plannedStartDate;
  final int estimatedDuration;
  final DateTime plannedEndDate;
  final String reason;
  final String detailedJustification;
  final String? maintenanceWorkOrder;
  final String urgencyLevel;
  final RiskAssessment riskAssessment;
  final String currentStatus;
  final int approvalLevel;
  final List<Approval> approvals;
  final List<RequestComment> comments;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? submittedAt;
  final DateTime? completedAt;

  BypassRequest({
    required this.id,
    required this.requestNumber,
    required this.equipmentId,
    required this.equipmentName,
    required this.sensorId,
    required this.sensorName,
    required this.sensorType,
    required this.zone,
    required this.initiatorId,
    required this.initiatorName,
    required this.initiatorDepartment,
    required this.requestedDate,
    required this.plannedStartDate,
    required this.estimatedDuration,
    required this.plannedEndDate,
    required this.reason,
    required this.detailedJustification,
    this.maintenanceWorkOrder,
    required this.urgencyLevel,
    required this.riskAssessment,
    required this.currentStatus,
    required this.approvalLevel,
    required this.approvals,
    required this.comments,
    required this.createdAt,
    required this.updatedAt,
    this.submittedAt,
    this.completedAt,
  });

  factory BypassRequest.fromJson(Map<String, dynamic> json) {
    return BypassRequest(
      id: json['id'].toString(),
      requestNumber: json['request_number'] ?? json['requestNumber'] ?? '',
      equipmentId: json['equipment_id'] ?? json['equipmentId'] ?? '',
      equipmentName: json['equipment_name'] ?? json['equipmentName'] ?? '',
      sensorId: json['sensor_id'] ?? json['sensorId'] ?? '',
      sensorName: json['sensor_name'] ?? json['sensorName'] ?? '',
      sensorType: json['sensor_type'] ?? json['sensorType'] ?? '',
      zone: json['zone'] ?? '',
      initiatorId: json['initiator_id'] ?? json['initiatorId'] ?? '',
      initiatorName: json['initiator_name'] ?? json['initiatorName'] ?? '',
      initiatorDepartment: json['initiator_department'] ?? json['initiatorDepartment'] ?? '',
      requestedDate: DateTime.parse(json['requested_date'] ?? json['requestedDate']),
      plannedStartDate: DateTime.parse(json['planned_start_date'] ?? json['plannedStartDate']),
      estimatedDuration: json['estimated_duration'] ?? json['estimatedDuration'] ?? 0,
      plannedEndDate: DateTime.parse(json['planned_end_date'] ?? json['plannedEndDate']),
      reason: json['reason'] ?? '',
      detailedJustification: json['detailed_justification'] ?? json['detailedJustification'] ?? '',
      maintenanceWorkOrder: json['maintenance_work_order'] ?? json['maintenanceWorkOrder'],
      urgencyLevel: json['urgency_level'] ?? json['urgencyLevel'] ?? 'normal',
      riskAssessment: RiskAssessment.fromJson(json['risk_assessment'] ?? json['riskAssessment'] ?? {}),
      currentStatus: json['current_status'] ?? json['currentStatus'] ?? 'draft',
      approvalLevel: json['approval_level'] ?? json['approvalLevel'] ?? 1,
      approvals: (json['approvals'] as List<dynamic>?)
          ?.map((e) => Approval.fromJson(e))
          .toList() ?? [],
      comments: (json['comments'] as List<dynamic>?)
          ?.map((e) => RequestComment.fromJson(e))
          .toList() ?? [],
      createdAt: DateTime.parse(json['created_at'] ?? json['createdAt']),
      updatedAt: DateTime.parse(json['updated_at'] ?? json['updatedAt']),
      submittedAt: json['submitted_at'] != null
          ? DateTime.parse(json['submitted_at'])
          : null,
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'request_number': requestNumber,
      'equipment_id': equipmentId,
      'sensor_id': sensorId,
      'reason': reason,
      'detailed_justification': detailedJustification,
      'urgency_level': urgencyLevel,
      'planned_start_date': plannedStartDate.toIso8601String(),
      'estimated_duration': estimatedDuration,
    };
  }
}

class Approval {
  final String id;
  final String requestId;
  final String approverId;
  final String approverName;
  final String approverRole;
  final int level;
  final String decision;
  final String? comments;
  final String? conditions;
  final DateTime timestamp;

  Approval({
    required this.id,
    required this.requestId,
    required this.approverId,
    required this.approverName,
    required this.approverRole,
    required this.level,
    required this.decision,
    this.comments,
    this.conditions,
    required this.timestamp,
  });

  factory Approval.fromJson(Map<String, dynamic> json) {
    return Approval(
      id: json['id'].toString(),
      requestId: json['request_id'] ?? json['requestId'] ?? '',
      approverId: json['approver_id'] ?? json['approverId'] ?? '',
      approverName: json['approver_name'] ?? json['approverName'] ?? '',
      approverRole: json['approver_role'] ?? json['approverRole'] ?? '',
      level: json['level'] ?? 1,
      decision: json['decision'] ?? 'pending',
      comments: json['comments'],
      conditions: json['conditions'],
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
}

class RequestComment {
  final String id;
  final String requestId;
  final String userId;
  final String userName;
  final String userRole;
  final String content;
  final bool isInternal;
  final DateTime timestamp;

  RequestComment({
    required this.id,
    required this.requestId,
    required this.userId,
    required this.userName,
    required this.userRole,
    required this.content,
    required this.isInternal,
    required this.timestamp,
  });

  factory RequestComment.fromJson(Map<String, dynamic> json) {
    return RequestComment(
      id: json['id'].toString(),
      requestId: json['request_id'] ?? json['requestId'] ?? '',
      userId: json['user_id'] ?? json['userId'] ?? '',
      userName: json['user_name'] ?? json['userName'] ?? '',
      userRole: json['user_role'] ?? json['userRole'] ?? '',
      content: json['content'] ?? '',
      isInternal: json['is_internal'] ?? json['isInternal'] ?? false,
      timestamp: DateTime.parse(json['timestamp']),
    );
  }
}

class RiskAssessment {
  final String safetyImpact;
  final String operationalImpact;
  final String environmentalImpact;
  final String overallRisk;
  final List<String> mitigationMeasures;
  final String? contingencyPlan;

  RiskAssessment({
    required this.safetyImpact,
    required this.operationalImpact,
    required this.environmentalImpact,
    required this.overallRisk,
    required this.mitigationMeasures,
    this.contingencyPlan,
  });

  factory RiskAssessment.fromJson(Map<String, dynamic> json) {
    return RiskAssessment(
      safetyImpact: json['safety_impact'] ?? json['safetyImpact'] ?? 'low',
      operationalImpact: json['operational_impact'] ?? json['operationalImpact'] ?? 'low',
      environmentalImpact: json['environmental_impact'] ?? json['environmentalImpact'] ?? 'low',
      overallRisk: json['overall_risk'] ?? json['overallRisk'] ?? 'low',
      mitigationMeasures: (json['mitigation_measures'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ?? [],
      contingencyPlan: json['contingency_plan'] ?? json['contingencyPlan'],
    );
  }
}

