import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Paramètres'),
      ),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.admin_panel_settings),
            title: const Text('Rôles et Permissions'),
            subtitle: const Text('Gérer les rôles et leurs permissions'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.go('/roles-permissions'),
          ),
          const Divider(),
          const ListTile(
            leading: Icon(Icons.info),
            title: Text('À propos'),
            subtitle: Text('Version 1.0.0'),
          ),
        ],
      ),
    );
  }
}

