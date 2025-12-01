import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/request_provider.dart';
import '../widgets/loading_widget.dart';
import '../widgets/custom_error_widget.dart';
import '../widgets/empty_state_widget.dart';
import '../widgets/request_card.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<RequestProvider>(context, listen: false).loadAllRequests();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Historique'),
      ),
      body: Consumer<RequestProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const LoadingWidget(message: 'Chargement de l\'historique...');
          }

          if (provider.errorMessage != null) {
            return CustomErrorWidget(
              message: provider.errorMessage!,
              onRetry: () => provider.loadAllRequests(),
            );
          }

          // Filtrer les demandes terminées
          final completedRequests = provider.requests.where((request) {
            return request.currentStatus == 'completed' ||
                request.currentStatus == 'approved' ||
                request.currentStatus == 'rejected';
          }).toList();

          if (completedRequests.isEmpty) {
            return const EmptyStateWidget(
              message: 'Aucun historique disponible',
              icon: Icons.history,
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadAllRequests(),
            child: ListView.builder(
              itemCount: completedRequests.length,
              itemBuilder: (context, index) {
                final request = completedRequests[index];
                return RequestCard(
                  request: request,
                  onTap: () {
                    // TODO: Naviguer vers les détails
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}

