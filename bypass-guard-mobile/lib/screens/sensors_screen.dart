import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/equipment_provider.dart';
import '../models/equipment.dart';
import '../widgets/loading_widget.dart';
import '../widgets/error_widget.dart';
import '../widgets/empty_state_widget.dart';

class SensorsScreen extends StatefulWidget {
  const SensorsScreen({super.key});

  @override
  State<SensorsScreen> createState() => _SensorsScreenState();
}

class _SensorsScreenState extends State<SensorsScreen> {
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
        title: const Text('Capteurs'),
      ),
      body: Consumer<EquipmentProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const LoadingWidget(message: 'Chargement des capteurs...');
          }

          if (provider.errorMessage != null) {
            return ErrorWidget(
              message: provider.errorMessage!,
              onRetry: () => provider.loadEquipment(),
            );
          }

          // Récupérer tous les capteurs de tous les équipements
          final allSensors = <Map<String, dynamic>>[];
          for (final equipment in provider.equipment) {
            for (final sensor in equipment.sensors) {
              allSensors.add({
                'sensor': sensor,
                'equipment': equipment,
              });
            }
          }

          if (allSensors.isEmpty) {
            return const EmptyStateWidget(
              message: 'Aucun capteur trouvé',
              icon: Icons.sensors,
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadEquipment(),
            child: ListView.builder(
              itemCount: allSensors.length,
              itemBuilder: (context, index) {
                final sensor = allSensors[index]['sensor'] as dynamic;
                final equipment = allSensors[index]['equipment'] as dynamic;
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: const Icon(Icons.sensors, color: Colors.indigo),
                    title: Text(sensor.name),
                    subtitle: Text('${sensor.type} - ${equipment.name}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          sensor.status,
                          style: TextStyle(
                            color: sensor.isActive ? Colors.green : Colors.grey,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.edit),
                          onPressed: () {
                            // TODO: Implémenter l'édition
                          },
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
    );
  }
}

