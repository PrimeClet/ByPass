import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/request_provider.dart';
import '../../widgets/loading_widget.dart';
import '../../widgets/error_widget.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/request_card.dart';

class RequestsListScreen extends StatefulWidget {
  const RequestsListScreen({super.key});

  @override
  State<RequestsListScreen> createState() => _RequestsListScreenState();
}

class _RequestsListScreenState extends State<RequestsListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<RequestProvider>(context, listen: false);
      provider.loadMyRequests();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes demandes'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Mes demandes'),
            Tab(text: 'Toutes les demandes'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildMyRequestsTab(),
          _buildAllRequestsTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/requests/new'),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildMyRequestsTab() {
    return Consumer<RequestProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading) {
          return const LoadingWidget(message: 'Chargement des demandes...');
        }

        if (provider.errorMessage != null) {
          return ErrorWidget(
            message: provider.errorMessage!,
            onRetry: () => provider.loadMyRequests(),
          );
        }

        if (provider.myRequests.isEmpty) {
          return EmptyStateWidget(
            message: 'Aucune demande trouvée',
            icon: Icons.description,
            actionLabel: 'Créer une demande',
            onAction: () => context.go('/requests/new'),
          );
        }

        return RefreshIndicator(
          onRefresh: () => provider.loadMyRequests(),
          child: ListView.builder(
            itemCount: provider.myRequests.length,
            itemBuilder: (context, index) {
              final request = provider.myRequests[index];
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
    );
  }

  Widget _buildAllRequestsTab() {
    return Consumer<RequestProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading) {
          return const LoadingWidget(message: 'Chargement des demandes...');
        }

        if (provider.errorMessage != null) {
          return ErrorWidget(
            message: provider.errorMessage!,
            onRetry: () => provider.loadAllRequests(),
          );
        }

        if (provider.requests.isEmpty) {
          return const EmptyStateWidget(
            message: 'Aucune demande trouvée',
            icon: Icons.description,
          );
        }

        return RefreshIndicator(
          onRefresh: () => provider.loadAllRequests(),
          child: ListView.builder(
            itemCount: provider.requests.length,
            itemBuilder: (context, index) {
              final request = provider.requests[index];
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
    );
  }
}

