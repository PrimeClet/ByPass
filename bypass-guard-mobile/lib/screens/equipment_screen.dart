import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/equipment_provider.dart';
import '../models/equipment.dart';
import '../widgets/loading_widget.dart';
import '../widgets/error_widget.dart';
import '../widgets/empty_state_widget.dart';

class EquipmentScreen extends StatefulWidget {
  const EquipmentScreen({super.key});

  @override
  State<EquipmentScreen> createState() => _EquipmentScreenState();
}

class _EquipmentScreenState extends State<EquipmentScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<EquipmentProvider>(context, listen: false).loadEquipment();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Équipements'),
      ),
      body: Consumer<EquipmentProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const LoadingWidget(message: 'Chargement des équipements...');
          }

          if (provider.errorMessage != null) {
            return ErrorWidget(
              message: provider.errorMessage!,
              onRetry: () => provider.loadEquipment(),
            );
          }

          if (provider.equipment.isEmpty) {
            return EmptyStateWidget(
              message: 'Aucun équipement trouvé',
              icon: Icons.build,
              actionLabel: 'Créer un équipement',
              onAction: () => _showCreateEquipmentDialog(context),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadEquipment(),
            child: ListView.builder(
              itemCount: provider.equipment.length,
              itemBuilder: (context, index) {
                final equipment = provider.equipment[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: const Icon(Icons.build, color: Colors.teal),
                    title: Text(equipment.name),
                    subtitle: Text('${equipment.type} - ${equipment.zone}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit),
                          onPressed: () => _showEditEquipmentDialog(context, equipment, provider),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => _showDeleteDialog(context, equipment.id, provider),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateEquipmentDialog(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showCreateEquipmentDialog(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final nameController = TextEditingController();
    final typeController = TextEditingController();
    final zoneController = TextEditingController();
    final fabricantController = TextEditingController();
    final provider = Provider.of<EquipmentProvider>(context, listen: false);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Créer un équipement'),
        content: SingleChildScrollView(
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Nom *',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'Le nom est requis' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: typeController,
                  decoration: const InputDecoration(
                    labelText: 'Type *',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'Le type est requis' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: zoneController,
                  decoration: const InputDecoration(
                    labelText: 'Zone *',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'La zone est requise' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: fabricantController,
                  decoration: const InputDecoration(
                    labelText: 'Fabricant *',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'Le fabricant est requis' : null,
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                final result = await provider.createEquipment({
                  'name': nameController.text,
                  'type': typeController.text,
                  'zone': zoneController.text,
                  'fabricant': fabricantController.text,
                  'status': 'operational',
                  'criticite': 'medium',
                });
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        result['success'] == true
                            ? 'Équipement créé avec succès'
                            : result['message'] ?? 'Erreur',
                      ),
                      backgroundColor:
                          result['success'] == true ? Colors.green : Colors.red,
                    ),
                  );
                }
              }
            },
            child: const Text('Créer'),
          ),
        ],
      ),
    );
  }

  void _showEditEquipmentDialog(
      BuildContext context, Equipment equipment, EquipmentProvider provider) {
    final formKey = GlobalKey<FormState>();
    final nameController = TextEditingController(text: equipment.name);
    final typeController = TextEditingController(text: equipment.type);
    final zoneController = TextEditingController(text: equipment.zone);
    final fabricantController = TextEditingController(text: equipment.fabricant);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Modifier l\'équipement'),
        content: SingleChildScrollView(
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Nom *',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'Le nom est requis' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: typeController,
                  decoration: const InputDecoration(
                    labelText: 'Type *',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'Le type est requis' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: zoneController,
                  decoration: const InputDecoration(
                    labelText: 'Zone *',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'La zone est requise' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: fabricantController,
                  decoration: const InputDecoration(
                    labelText: 'Fabricant *',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) =>
                      value?.isEmpty ?? true ? 'Le fabricant est requis' : null,
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                final result = await provider.updateEquipment(equipment.id, {
                  'name': nameController.text,
                  'type': typeController.text,
                  'zone': zoneController.text,
                  'fabricant': fabricantController.text,
                });
                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        result['success'] == true
                            ? 'Équipement modifié avec succès'
                            : result['message'] ?? 'Erreur',
                      ),
                      backgroundColor:
                          result['success'] == true ? Colors.green : Colors.red,
                    ),
                  );
                }
              }
            },
            child: const Text('Modifier'),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(
      BuildContext context, String id, EquipmentProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer l\'équipement'),
        content: const Text(
            'Êtes-vous sûr de vouloir supprimer cet équipement ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            onPressed: () async {
              final success = await provider.deleteEquipment(id);
              if (context.mounted) {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      success
                          ? 'Équipement supprimé'
                          : 'Erreur lors de la suppression',
                    ),
                    backgroundColor: success ? Colors.green : Colors.red,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
  }
}

