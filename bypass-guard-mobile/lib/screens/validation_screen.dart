import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/request_provider.dart';
import '../widgets/loading_widget.dart';
import '../widgets/custom_error_widget.dart';
import '../widgets/empty_state_widget.dart';
import '../widgets/request_card.dart';

class ValidationScreen extends StatefulWidget {
  const ValidationScreen({super.key});

  @override
  State<ValidationScreen> createState() => _ValidationScreenState();
}

class _ValidationScreenState extends State<ValidationScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<RequestProvider>(context, listen: false).loadPendingRequests();
    });
  }

  Future<void> _handleValidation(
    BuildContext context,
    String requestId,
    String decision,
  ) async {
    final provider = Provider.of<RequestProvider>(context, listen: false);
    
    String? comment;
    if (decision == 'rejected') {
      comment = await _showCommentDialog(context);
      if (comment == null) return;
    }

    final result = await provider.validateRequest(requestId, decision, comment: comment);
    
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result['success'] == true
                ? 'Demande ${decision == 'approved' ? 'approuvée' : 'rejetée'}'
                : result['message'] ?? 'Erreur',
          ),
          backgroundColor: result['success'] == true ? Colors.green : Colors.red,
        ),
      );
    }
  }

  Future<String?> _showCommentDialog(BuildContext context) async {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Commentaire de rejet'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'Raison du rejet',
            border: OutlineInputBorder(),
          ),
          maxLines: 3,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, controller.text),
            child: const Text('Valider'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Validation'),
      ),
      body: Consumer<RequestProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const LoadingWidget(message: 'Chargement des demandes...');
          }

          if (provider.errorMessage != null) {
            return CustomErrorWidget(
              message: provider.errorMessage!,
              onRetry: () => provider.loadPendingRequests(),
            );
          }

          if (provider.pendingRequests.isEmpty) {
            return const EmptyStateWidget(
              message: 'Aucune demande en attente de validation',
              icon: Icons.check_circle,
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadPendingRequests(),
            child: ListView.builder(
              itemCount: provider.pendingRequests.length,
              itemBuilder: (context, index) {
                final request = provider.pendingRequests[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Column(
                    children: [
                      RequestCard(request: request),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            OutlinedButton(
                              onPressed: () => _handleValidation(
                                context,
                                request.id,
                                'rejected',
                              ),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.red,
                              ),
                              child: const Text('Rejeter'),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: () => _handleValidation(
                                context,
                                request.id,
                                'approved',
                              ),
                              child: const Text('Approuver'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

