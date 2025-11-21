import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../providers/request_provider.dart';
import '../../providers/equipment_provider.dart';
import '../../widgets/loading_widget.dart';

class NewRequestScreen extends StatefulWidget {
  const NewRequestScreen({super.key});

  @override
  State<NewRequestScreen> createState() => _NewRequestScreenState();
}

class _NewRequestScreenState extends State<NewRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedEquipmentId;
  String? _selectedSensorId;
  final _reasonController = TextEditingController();
  final _justificationController = TextEditingController();
  final _durationController = TextEditingController();
  String _urgencyLevel = 'normal';
  DateTime? _plannedStartDate;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<EquipmentProvider>(context, listen: false).loadEquipment();
    });
  }

  @override
  void dispose() {
    _reasonController.dispose();
    _justificationController.dispose();
    _durationController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        _plannedStartDate = picked;
      });
    }
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedEquipmentId == null || _selectedSensorId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez sélectionner un équipement et un capteur'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_plannedStartDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez sélectionner une date de début'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final provider = Provider.of<RequestProvider>(context, listen: false);
    final duration = int.tryParse(_durationController.text) ?? 0;

    final result = await provider.createRequest({
      'equipment_id': _selectedEquipmentId,
      'sensor_id': _selectedSensorId,
      'reason': _reasonController.text,
      'detailed_justification': _justificationController.text,
      'urgency_level': _urgencyLevel,
      'planned_start_date': _plannedStartDate!.toIso8601String(),
      'estimated_duration': duration,
    });

    if (context.mounted) {
      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Demande créée avec succès'),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/requests');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Erreur lors de la création'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nouvelle demande'),
      ),
      body: Consumer<EquipmentProvider>(
        builder: (context, equipmentProvider, _) {
          if (equipmentProvider.isLoading) {
            return const LoadingWidget(message: 'Chargement des équipements...');
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  DropdownButtonFormField<String>(
                    value: _selectedEquipmentId,
                    decoration: const InputDecoration(
                      labelText: 'Équipement *',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.build),
                    ),
                    items: equipmentProvider.equipment.map((equipment) {
                      return DropdownMenuItem(
                        value: equipment.id,
                        child: Text(equipment.name),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedEquipmentId = value;
                        _selectedSensorId = null;
                      });
                    },
                    validator: (value) =>
                        value == null ? 'Veuillez sélectionner un équipement' : null,
                  ),
                  const SizedBox(height: 16),
                  if (_selectedEquipmentId != null)
                    DropdownButtonFormField<String>(
                      value: _selectedSensorId,
                      decoration: const InputDecoration(
                        labelText: 'Capteur *',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.sensors),
                      ),
                      items: equipmentProvider.equipment
                          .firstWhere((e) => e.id == _selectedEquipmentId)
                          .sensors
                          .map((sensor) {
                        return DropdownMenuItem(
                          value: sensor.id,
                          child: Text('${sensor.name} (${sensor.type})'),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedSensorId = value;
                        });
                      },
                      validator: (value) =>
                          value == null ? 'Veuillez sélectionner un capteur' : null,
                    ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _reasonController,
                    decoration: const InputDecoration(
                      labelText: 'Raison *',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.description),
                    ),
                    maxLines: 2,
                    validator: (value) =>
                        value?.isEmpty ?? true ? 'La raison est requise' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _justificationController,
                    decoration: const InputDecoration(
                      labelText: 'Justification détaillée *',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.article),
                    ),
                    maxLines: 5,
                    validator: (value) =>
                        value?.isEmpty ?? true ? 'La justification est requise' : null,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _urgencyLevel,
                    decoration: const InputDecoration(
                      labelText: 'Niveau d\'urgence *',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.priority_high),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'low', child: Text('Faible')),
                      DropdownMenuItem(value: 'normal', child: Text('Normal')),
                      DropdownMenuItem(value: 'high', child: Text('Élevé')),
                      DropdownMenuItem(value: 'critical', child: Text('Critique')),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _urgencyLevel = value ?? 'normal';
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _durationController,
                    decoration: const InputDecoration(
                      labelText: 'Durée estimée (heures) *',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.access_time),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value?.isEmpty ?? true) {
                        return 'La durée est requise';
                      }
                      if (int.tryParse(value!) == null || int.parse(value) <= 0) {
                        return 'Veuillez entrer un nombre valide';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  InkWell(
                    onTap: _selectDate,
                    child: InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Date de début prévue *',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      child: Text(
                        _plannedStartDate != null
                            ? '${_plannedStartDate!.day}/${_plannedStartDate!.month}/${_plannedStartDate!.year}'
                            : 'Sélectionner une date',
                        style: TextStyle(
                          color: _plannedStartDate != null
                              ? Colors.black
                              : Colors.grey,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  Consumer<RequestProvider>(
                    builder: (context, requestProvider, _) {
                      return ElevatedButton(
                        onPressed: requestProvider.isLoading ? null : _submitRequest,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: requestProvider.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Text('Soumettre la demande'),
                      );
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
