import '../models/equipment.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class SensorService {
  final ApiService _apiService = ApiService();

  Future<List<Sensor>> getAllSensors() async {
    try {
      final response = await _apiService.get(ApiConfig.sensors);
      if (response.statusCode == 200 && response.data['data'] != null) {
        return (response.data['data'] as List)
            .map((json) => Sensor.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<List<Sensor>> getSensorsByEquipment(String equipmentId) async {
    try {
      final response = await _apiService.get('${ApiConfig.equipment}/$equipmentId/sensors');
      if (response.statusCode == 200 && response.data['data'] != null) {
        return (response.data['data'] as List)
            .map((json) => Sensor.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<Sensor?> getSensorById(String id) async {
    try {
      final response = await _apiService.get('${ApiConfig.sensors}/$id');
      if (response.statusCode == 200 && response.data != null) {
        return Sensor.fromJson(response.data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<Map<String, dynamic>> createSensor(String equipmentId, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post(
        '${ApiConfig.equipment}/$equipmentId/sensors',
        data: data,
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'sensor': Sensor.fromJson(response.data['data'] ?? response.data),
        };
      }
      return {
        'success': false,
        'message': response.data['message'] ?? 'Erreur lors de la création',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Erreur: ${e.toString()}',
      };
    }
  }

  Future<Map<String, dynamic>> updateSensor(String id, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.put('${ApiConfig.sensors}/$id', data: data);
      if (response.statusCode == 200) {
        return {
          'success': true,
          'sensor': Sensor.fromJson(response.data['data'] ?? response.data),
        };
      }
      return {
        'success': false,
        'message': response.data['message'] ?? 'Erreur lors de la mise à jour',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Erreur: ${e.toString()}',
      };
    }
  }

  Future<bool> deleteSensor(String id) async {
    try {
      final response = await _apiService.delete('${ApiConfig.sensors}/$id');
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      return false;
    }
  }
}

