import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de bord'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.go('/profile'),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await authProvider.logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bienvenue, ${user?.fullName ?? "Utilisateur"}',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 24),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: [
                _buildCard(
                  context,
                  'Mes demandes',
                  Icons.description,
                  Colors.blue,
                  () => context.go('/requests'),
                ),
                _buildCard(
                  context,
                  'Nouvelle demande',
                  Icons.add_circle,
                  Colors.green,
                  () => context.go('/requests/new'),
                ),
                if (user?.role.value == 'supervisor' || user?.role.value == 'administrator')
                  _buildCard(
                    context,
                    'Validation',
                    Icons.check_circle,
                    Colors.orange,
                    () => context.go('/validation'),
                  ),
                if (user?.role.value == 'administrator')
                  _buildCard(
                    context,
                    'Historique',
                    Icons.history,
                    Colors.purple,
                    () => context.go('/history'),
                  ),
                if (user?.role.value == 'administrator')
                  _buildCard(
                    context,
                    'Zones',
                    Icons.location_on,
                    Colors.red,
                    () => context.go('/zones'),
                  ),
                if (user?.role.value == 'administrator')
                  _buildCard(
                    context,
                    'Équipements',
                    Icons.build,
                    Colors.teal,
                    () => context.go('/equipment'),
                  ),
                if (user?.role.value == 'administrator')
                  _buildCard(
                    context,
                    'Capteurs',
                    Icons.sensors,
                    Colors.indigo,
                    () => context.go('/sensors'),
                  ),
                if (user?.role.value == 'administrator')
                  _buildCard(
                    context,
                    'Utilisateurs',
                    Icons.people,
                    Colors.cyan,
                    () => context.go('/users'),
                  ),
                if (user?.role.value == 'administrator')
                  _buildCard(
                    context,
                    'Paramètres',
                    Icons.settings,
                    Colors.grey,
                    () => context.go('/settings'),
                  ),
                if (user?.role.value == 'administrator')
                  _buildCard(
                    context,
                    'Rôles & Permissions',
                    Icons.admin_panel_settings,
                    Colors.amber,
                    () => context.go('/roles-permissions'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 48, color: color),
              const SizedBox(height: 8),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

