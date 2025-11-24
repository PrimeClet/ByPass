import 'package:flutter/material.dart';
import '../models/user.dart';

class RolesPermissionsScreen extends StatelessWidget {
  const RolesPermissionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rôles et Permissions'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildRoleCard(
            context,
            'Demandeur',
            'user',
            'Utilisateur standard pouvant soumettre des demandes',
            [
              'Soumettre des demandes',
              'Recevoir les notifications',
            ],
          ),
          const SizedBox(height: 16),
          _buildRoleCard(
            context,
            'Approbateur N1',
            'supervisor',
            'Superviseur pouvant approuver les demandes de niveau 1',
            [
              'Soumettre des demandes',
              'Approbation niveau 1',
              'Consulter toutes les demandes',
              'Exporter les données',
              'Journal d\'audit',
              'Rejeter des demandes',
              'Voir le tableau de bord',
            ],
          ),
          const SizedBox(height: 16),
          _buildRoleCard(
            context,
            'Approbateur N2',
            'director',
            'Directeur pouvant approuver les demandes de niveau 2',
            [
              'Soumettre des demandes',
              'Approbation niveau 1 et 2',
              'Consulter toutes les demandes',
              'Exporter les données',
              'Gérer les équipements',
              'Journal d\'audit',
              'Rejeter/Annuler des demandes',
              'Voir le tableau de bord',
            ],
          ),
          const SizedBox(height: 16),
          _buildRoleCard(
            context,
            'Administrateur',
            'administrator',
            'Administrateur avec tous les droits',
            [
              'Toutes les permissions',
              'Gestion complète du système',
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRoleCard(
    BuildContext context,
    String name,
    String code,
    String description,
    List<String> permissions,
  ) {
    return Card(
      child: ExpansionTile(
        leading: const Icon(Icons.shield),
        title: Text(name),
        subtitle: Text(description),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Permissions:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: permissions.map((permission) {
                    return Chip(
                      label: Text(permission),
                      labelStyle: const TextStyle(fontSize: 12),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      // TODO: Ouvrir le dialog de modification des permissions
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Fonctionnalité à implémenter'),
                        ),
                      );
                    },
                    icon: const Icon(Icons.edit),
                    label: const Text('Modifier les permissions'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

