import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import '../../config/theme.dart';
import '../../providers/request_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/request.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/custom_button.dart';

class RequestDetailScreen extends StatefulWidget {
  final int requestId;

  const RequestDetailScreen({super.key, required this.requestId});

  @override
  State<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends State<RequestDetailScreen> {
  BypassRequest? _request;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRequest();
  }

  Future<void> _loadRequest() async {
    setState(() => _isLoading = true);

    final provider = Provider.of<RequestProvider>(context, listen: false);

    // Try to get from existing data first
    _request = provider.getRequestById(widget.requestId);

    if (_request == null) {
      // Load from API if not found
      await provider.loadAllRequests();
      _request = provider.getRequestById(widget.requestId);
    }

    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _request == null
              ? _buildNotFoundState()
              : _buildContent(),
    );
  }

  Widget _buildNotFoundState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.error.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.search_off,
              size: 48,
              color: AppColors.error,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Demande introuvable',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Cette demande n\'existe pas ou a été supprimée',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => context.go('/requests'),
            icon: const Icon(Icons.arrow_back),
            label: const Text('Retour aux demandes'),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return CustomScrollView(
      slivers: [
        _buildAppBar(),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                FadeInUp(
                  duration: const Duration(milliseconds: 300),
                  child: _buildHeaderCard(),
                ),
                const SizedBox(height: 16),
                FadeInUp(
                  duration: const Duration(milliseconds: 300),
                  delay: const Duration(milliseconds: 100),
                  child: _buildDescriptionCard(),
                ),
                const SizedBox(height: 16),
                FadeInUp(
                  duration: const Duration(milliseconds: 300),
                  delay: const Duration(milliseconds: 150),
                  child: _buildEquipmentCard(),
                ),
                const SizedBox(height: 16),
                FadeInUp(
                  duration: const Duration(milliseconds: 300),
                  delay: const Duration(milliseconds: 200),
                  child: _buildTimingCard(),
                ),
                const SizedBox(height: 16),
                FadeInUp(
                  duration: const Duration(milliseconds: 300),
                  delay: const Duration(milliseconds: 250),
                  child: _buildImpactCard(),
                ),
                if (_request!.requiresDualValidation) ...[
                  const SizedBox(height: 16),
                  FadeInUp(
                    duration: const Duration(milliseconds: 300),
                    delay: const Duration(milliseconds: 300),
                    child: _buildValidationProgressCard(),
                  ),
                ],
                const SizedBox(height: 24),
                _buildActionButtons(),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      expandedHeight: 120,
      floating: false,
      pinned: true,
      backgroundColor: AppColors.primary,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => context.go('/requests'),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.refresh, color: Colors.white),
          onPressed: _loadRequest,
        ),
        PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert, color: Colors.white),
          onSelected: (value) {
            // Handle menu actions
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'share',
              child: Row(
                children: [
                  Icon(Icons.share, size: 20),
                  SizedBox(width: 12),
                  Text('Partager'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'print',
              child: Row(
                children: [
                  Icon(Icons.print, size: 20),
                  SizedBox(width: 12),
                  Text('Imprimer'),
                ],
              ),
            ),
          ],
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          _request!.requestCode,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        background: Container(
          decoration: const BoxDecoration(
            gradient: AppColors.primaryGradient,
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  _request!.reasonDisplayName,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              StatusBadge.fromStatus(_request!.status),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildInfoChip(
                icon: Icons.flag_outlined,
                label: _request!.priorityDisplayName,
                color: _getPriorityColor(_request!.priority),
              ),
              const SizedBox(width: 12),
              if (_request!.requiresDualValidation)
                _buildInfoChip(
                  icon: Icons.verified_user_outlined,
                  label: 'Double validation',
                  color: AppColors.warning,
                ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.person_outline, size: 18, color: AppColors.textSecondary),
              const SizedBox(width: 8),
              Text(
                'Demandeur: ',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              Text(
                _request!.requesterName ?? _request!.requester?.fullName ?? 'N/A',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.calendar_today_outlined, size: 18, color: AppColors.textSecondary),
              const SizedBox(width: 8),
              Text(
                'Créée le: ',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              Text(
                _formatDateTime(_request!.createdAt),
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip({
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDescriptionCard() {
    return _buildSectionCard(
      title: 'Description',
      icon: Icons.description_outlined,
      child: Text(
        _request!.description,
        style: const TextStyle(
          fontSize: 14,
          color: AppColors.textPrimary,
          height: 1.5,
        ),
      ),
    );
  }

  Widget _buildEquipmentCard() {
    return _buildSectionCard(
      title: 'Équipement & Capteur',
      icon: Icons.precision_manufacturing_outlined,
      child: Column(
        children: [
          if (_request!.equipment != null) ...[
            _buildDetailRow(
              icon: Icons.precision_manufacturing_outlined,
              label: 'Équipement',
              value: _request!.equipment!.name,
            ),
            if (_request!.equipment!.zone != null)
              _buildDetailRow(
                icon: Icons.location_on_outlined,
                label: 'Zone',
                value: _request!.equipment!.zone!.name,
              ),
          ],
          if (_request!.sensor != null) ...[
            if (_request!.equipment != null) const Divider(height: 24),
            _buildDetailRow(
              icon: Icons.sensors_outlined,
              label: 'Capteur',
              value: _request!.sensor!.name,
            ),
            _buildDetailRow(
              icon: Icons.category_outlined,
              label: 'Type',
              value: _request!.sensor!.typeDisplayName,
            ),
          ],
          if (_request!.equipment == null && _request!.sensor == null)
            const Text(
              'Aucun équipement ou capteur associé',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                fontStyle: FontStyle.italic,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTimingCard() {
    return _buildSectionCard(
      title: 'Période du Bypass',
      icon: Icons.schedule_outlined,
      child: Column(
        children: [
          _buildDetailRow(
            icon: Icons.play_arrow_outlined,
            label: 'Début prévu',
            value: _request!.startTime != null
                ? _formatDateTime(_request!.startTime!)
                : 'Non spécifié',
          ),
          _buildDetailRow(
            icon: Icons.stop_outlined,
            label: 'Fin prévue',
            value: _request!.endTime != null
                ? _formatDateTime(_request!.endTime!)
                : 'Non spécifié',
          ),
          if (_request!.startTime != null && _request!.endTime != null)
            _buildDetailRow(
              icon: Icons.timelapse_outlined,
              label: 'Durée',
              value: _calculateDuration(_request!.startTime!, _request!.endTime!),
            ),
        ],
      ),
    );
  }

  Widget _buildImpactCard() {
    return _buildSectionCard(
      title: 'Analyse d\'impact',
      icon: Icons.assessment_outlined,
      child: Column(
        children: [
          _buildImpactRow(
            label: 'Impact Sécurité',
            value: _request!.impactSecurite,
          ),
          _buildImpactRow(
            label: 'Impact Opérationnel',
            value: _request!.impactOperationnel,
          ),
          _buildImpactRow(
            label: 'Impact Environnemental',
            value: _request!.impactEnvironnemental,
          ),
          if (_request!.mesureAttenuation != null) ...[
            const Divider(height: 24),
            _buildDetailRow(
              icon: Icons.shield_outlined,
              label: 'Mesures d\'atténuation',
              value: _request!.mesureAttenuation!,
              isMultiLine: true,
            ),
          ],
          if (_request!.planContingence != null) ...[
            const SizedBox(height: 12),
            _buildDetailRow(
              icon: Icons.emergency_outlined,
              label: 'Plan de contingence',
              value: _request!.planContingence!,
              isMultiLine: true,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildImpactRow({required String label, String? value}) {
    final displayValue = BypassRequest.getImpactDisplayName(value);
    final color = _getImpactColor(value);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              displayValue,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildValidationProgressCard() {
    return _buildSectionCard(
      title: 'Progression de la validation',
      icon: Icons.verified_outlined,
      child: Column(
        children: [
          _buildValidationStep(
            level: 1,
            title: 'Validation Niveau 1',
            subtitle: 'Superviseur',
            status: _request!.validationStatusLevel1,
            validator: _request!.validatorLevel1,
            validatedAt: _request!.validatedAtLevel1,
            rejectionReason: _request!.rejectionReasonLevel1,
          ),
          const SizedBox(height: 16),
          _buildValidationStep(
            level: 2,
            title: 'Validation Niveau 2',
            subtitle: 'Directeur / Admin',
            status: _request!.validationStatusLevel2,
            validator: _request!.validatorLevel2,
            validatedAt: _request!.validatedAtLevel2,
            rejectionReason: _request!.rejectionReasonLevel2,
          ),
        ],
      ),
    );
  }

  Widget _buildValidationStep({
    required int level,
    required String title,
    required String subtitle,
    String? status,
    User? validator,
    DateTime? validatedAt,
    String? rejectionReason,
  }) {
    final isApproved = status == 'approved';
    final isRejected = status == 'rejected';
    final isPending = status == 'pending' || status == null;

    Color statusColor;
    IconData statusIcon;
    if (isApproved) {
      statusColor = AppColors.success;
      statusIcon = Icons.check_circle;
    } else if (isRejected) {
      statusColor = AppColors.error;
      statusIcon = Icons.cancel;
    } else {
      statusColor = AppColors.warning;
      statusIcon = Icons.hourglass_empty;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: statusColor.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: statusColor.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: statusColor,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Icon(statusIcon, color: Colors.white, size: 18),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  isPending ? 'En attente' : isApproved ? 'Approuvé' : 'Rejeté',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          if (validator != null || validatedAt != null) ...[
            const SizedBox(height: 12),
            if (validator != null)
              Text(
                'Par: ${validator.fullName}',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
            if (validatedAt != null)
              Text(
                'Le: ${_formatDateTime(validatedAt)}',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
          ],
          if (rejectionReason != null && isRejected) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline, size: 16, color: AppColors.error),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      rejectionReason,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.error,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: AppColors.primary, size: 20),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
    bool isMultiLine = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: isMultiLine
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(icon, size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 8),
                    Text(
                      label,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Padding(
                  padding: const EdgeInsets.only(left: 24),
                  child: Text(
                    value,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ],
            )
          : Row(
              children: [
                Icon(icon, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 8),
                Text(
                  '$label: ',
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
                Expanded(
                  child: Text(
                    value,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildActionButtons() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;
    final canValidate = user?.canValidateLevel1 == true || user?.canValidateLevel2 == true;
    final isPending = _request!.status == 'pending';

    if (!canValidate || !isPending) return const SizedBox();

    return FadeInUp(
      duration: const Duration(milliseconds: 300),
      delay: const Duration(milliseconds: 350),
      child: Row(
        children: [
          Expanded(
            child: CustomButton(
              label: 'Rejeter',
              icon: Icons.close,
              onPressed: () => _showValidationDialog(false),
              isDestructive: true,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: GradientButton(
              label: 'Approuver',
              icon: Icons.check,
              onPressed: () => _showValidationDialog(true),
              width: double.infinity,
            ),
          ),
        ],
      ),
    );
  }

  void _showValidationDialog(bool isApproval) {
    final commentController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(isApproval ? 'Approuver la demande' : 'Rejeter la demande'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              isApproval
                  ? 'Êtes-vous sûr de vouloir approuver cette demande ?'
                  : 'Veuillez indiquer la raison du rejet :',
            ),
            if (!isApproval) ...[
              const SizedBox(height: 16),
              TextField(
                controller: commentController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Raison du rejet...',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _handleValidation(
                isApproval ? 'approve' : 'reject',
                commentController.text,
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: isApproval ? AppColors.success : AppColors.error,
            ),
            child: Text(isApproval ? 'Approuver' : 'Rejeter'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleValidation(String decision, String comment) async {
    final provider = Provider.of<RequestProvider>(context, listen: false);
    final result = await provider.validateRequest(
      _request!.id.toString(),
      decision,
      comment: comment.isNotEmpty ? comment : null,
    );

    if (mounted) {
      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              decision == 'approve'
                  ? 'Demande approuvée avec succès'
                  : 'Demande rejetée',
            ),
            backgroundColor: decision == 'approve' ? AppColors.success : AppColors.error,
          ),
        );
        await _loadRequest();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Erreur lors de la validation'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'low':
        return AppColors.success;
      case 'normal':
        return AppColors.info;
      case 'high':
        return AppColors.warning;
      case 'critical':
        return AppColors.error;
      case 'emergency':
        return AppColors.priorityEmergency;
      default:
        return AppColors.textSecondary;
    }
  }

  Color _getImpactColor(String? impact) {
    switch (impact) {
      case 'very_low':
      case 'low':
        return AppColors.success;
      case 'medium':
        return AppColors.warning;
      case 'high':
      case 'very_high':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}/${dateTime.month.toString().padLeft(2, '0')}/${dateTime.year} à ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  String _calculateDuration(DateTime start, DateTime end) {
    final duration = end.difference(start);
    if (duration.inDays > 0) {
      return '${duration.inDays} jour(s) ${duration.inHours % 24}h';
    } else if (duration.inHours > 0) {
      return '${duration.inHours}h ${duration.inMinutes % 60}min';
    } else {
      return '${duration.inMinutes} minutes';
    }
  }
}
