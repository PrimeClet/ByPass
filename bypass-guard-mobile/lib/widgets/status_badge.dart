import 'package:flutter/material.dart';
import '../config/theme.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color? backgroundColor;
  final Color? textColor;
  final IconData? icon;
  final bool isSmall;

  const StatusBadge({
    super.key,
    required this.label,
    this.backgroundColor,
    this.textColor,
    this.icon,
    this.isSmall = false,
  });

  factory StatusBadge.fromStatus(String status) {
    Color bgColor;
    Color txtColor;
    IconData? statusIcon;

    switch (status.toLowerCase()) {
      case 'pending':
      case 'en attente':
        bgColor = AppColors.warning.withValues(alpha: 0.15);
        txtColor = AppColors.warning;
        statusIcon = Icons.schedule;
        break;
      case 'approved':
      case 'approuvée':
        bgColor = AppColors.success.withValues(alpha: 0.15);
        txtColor = AppColors.success;
        statusIcon = Icons.check_circle_outline;
        break;
      case 'rejected':
      case 'rejetée':
        bgColor = AppColors.error.withValues(alpha: 0.15);
        txtColor = AppColors.error;
        statusIcon = Icons.cancel_outlined;
        break;
      case 'in_progress':
      case 'en cours':
        bgColor = AppColors.info.withValues(alpha: 0.15);
        txtColor = AppColors.info;
        statusIcon = Icons.sync;
        break;
      case 'completed':
      case 'terminée':
        bgColor = AppColors.textSecondary.withValues(alpha: 0.15);
        txtColor = AppColors.textSecondary;
        statusIcon = Icons.done_all;
        break;
      case 'cancelled':
      case 'annulée':
        bgColor = AppColors.textSecondary.withValues(alpha: 0.15);
        txtColor = AppColors.textSecondary;
        statusIcon = Icons.block;
        break;
      default:
        bgColor = AppColors.muted;
        txtColor = AppColors.textSecondary;
        statusIcon = Icons.info_outline;
    }

    return StatusBadge(
      label: _getStatusLabel(status),
      backgroundColor: bgColor,
      textColor: txtColor,
      icon: statusIcon,
    );
  }

  factory StatusBadge.fromPriority(String priority) {
    Color bgColor;
    Color txtColor;
    IconData? priorityIcon;

    switch (priority.toLowerCase()) {
      case 'low':
      case 'faible':
        bgColor = AppColors.success.withValues(alpha: 0.15);
        txtColor = AppColors.success;
        priorityIcon = Icons.arrow_downward;
        break;
      case 'normal':
      case 'normale':
        bgColor = AppColors.info.withValues(alpha: 0.15);
        txtColor = AppColors.info;
        priorityIcon = Icons.remove;
        break;
      case 'high':
      case 'élevée':
        bgColor = AppColors.warning.withValues(alpha: 0.15);
        txtColor = AppColors.warning;
        priorityIcon = Icons.arrow_upward;
        break;
      case 'critical':
      case 'critique':
        bgColor = AppColors.error.withValues(alpha: 0.15);
        txtColor = AppColors.error;
        priorityIcon = Icons.priority_high;
        break;
      case 'emergency':
      case 'urgence':
        bgColor = AppColors.priorityEmergency.withValues(alpha: 0.15);
        txtColor = AppColors.priorityEmergency;
        priorityIcon = Icons.warning_amber;
        break;
      default:
        bgColor = AppColors.muted;
        txtColor = AppColors.textSecondary;
        priorityIcon = Icons.info_outline;
    }

    return StatusBadge(
      label: _getPriorityLabel(priority),
      backgroundColor: bgColor,
      textColor: txtColor,
      icon: priorityIcon,
    );
  }

  static String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvée';
      case 'rejected':
        return 'Rejetée';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  }

  static String _getPriorityLabel(String priority) {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'Faible';
      case 'normal':
        return 'Normale';
      case 'high':
        return 'Élevée';
      case 'critical':
        return 'Critique';
      case 'emergency':
        return 'Urgence';
      default:
        return priority;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 12,
        vertical: isSmall ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.muted,
        borderRadius: BorderRadius.circular(isSmall ? 6 : 8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: isSmall ? 12 : 14,
              color: textColor ?? AppColors.textSecondary,
            ),
            SizedBox(width: isSmall ? 4 : 6),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: isSmall ? 10 : 12,
              fontWeight: FontWeight.w600,
              color: textColor ?? AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class RoleBadge extends StatelessWidget {
  final String role;

  const RoleBadge({super.key, required this.role});

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color txtColor;
    String displayRole;

    switch (role.toLowerCase()) {
      case 'administrator':
        bgColor = AppColors.primary.withValues(alpha: 0.15);
        txtColor = AppColors.primary;
        displayRole = 'Administrateur';
        break;
      case 'director':
        bgColor = AppColors.success.withValues(alpha: 0.15);
        txtColor = AppColors.success;
        displayRole = 'Directeur';
        break;
      case 'supervisor':
        bgColor = AppColors.warning.withValues(alpha: 0.15);
        txtColor = AppColors.warning;
        displayRole = 'Superviseur';
        break;
      case 'user':
      default:
        bgColor = AppColors.textSecondary.withValues(alpha: 0.15);
        txtColor = AppColors.textSecondary;
        displayRole = 'Utilisateur';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        displayRole,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: txtColor,
        ),
      ),
    );
  }
}
