import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/request.dart';

class RequestCard extends StatelessWidget {
  final BypassRequest request;
  final VoidCallback? onTap;

  const RequestCard({
    super.key,
    required this.request,
    this.onTap,
  });

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved':
        return Colors.green;
      case 'rejected':
        return Colors.red;
      case 'pending':
      case 'under_review_l1':
      case 'under_review_l2':
        return Colors.orange;
      case 'active':
        return Colors.blue;
      case 'completed':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'Brouillon';
      case 'submitted':
        return 'Soumis';
      case 'under_review_l1':
        return 'En révision N1';
      case 'under_review_l2':
        return 'En révision N2';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'active':
        return 'Actif';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      request.requestNumber,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(request.currentStatus).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      _getStatusLabel(request.currentStatus),
                      style: TextStyle(
                        color: _getStatusColor(request.currentStatus),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Équipement: ${request.equipmentName}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              Text(
                'Capteur: ${request.sensorName}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat('dd/MM/yyyy').format(request.plannedStartDate),
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.access_time, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    '${request.estimatedDuration}h',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

