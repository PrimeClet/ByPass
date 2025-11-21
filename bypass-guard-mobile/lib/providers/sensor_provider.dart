import 'package:flutter/foundation.dart';
import '../models/equipment.dart';
import '../services/sensor_service.dart';

class SensorProvider with ChangeNotifier {
  final SensorService _sensorService = SensorService();
  
  List<Sensor> _sensors = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Sensor> get sensors => _sensors;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadSensors() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _sensors = await _sensorService.getAllSensors();
    } catch (e) {
      _errorMessage = 'Erreur lors du chargement: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<Sensor>> loadSensorsByEquipment(String equipmentId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final sensors = await _sensorService.getSensorsByEquipment(equipmentId);
      return sensors;
    } catch (e) {
      _errorMessage = 'Erreur lors du chargement: ${e.toString()}';
      return [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> createSensor(
    String equipmentId,
    Map<String, dynamic> data,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _sensorService.createSensor(equipmentId, data);
      if (result['success'] == true) {
        await loadSensors();
        return result;
      } else {
        _errorMessage = result['message'] ?? 'Erreur lors de la création';
        return result;
      }
    } catch (e) {
      _errorMessage = 'Erreur: ${e.toString()}';
      return {'success': false, 'message': _errorMessage};
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> updateSensor(
    String id,
    Map<String, dynamic> data,
  ) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _sensorService.updateSensor(id, data);
      if (result['success'] == true) {
        await loadSensors();
        return result;
      } else {
        _errorMessage = result['message'] ?? 'Erreur lors de la mise à jour';
        return result;
      }
    } catch (e) {
      _errorMessage = 'Erreur: ${e.toString()}';
      return {'success': false, 'message': _errorMessage};
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> deleteSensor(String id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final success = await _sensorService.deleteSensor(id);
      if (success) {
        await loadSensors();
      }
      return success;
    } catch (e) {
      _errorMessage = 'Erreur: ${e.toString()}';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}

