import '../models/equipment.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class EquipmentService {
  final ApiService _apiService = ApiService();

  Future<List<Equipment>> getAllEquipment() async {
    try {
      final response = await _apiService.get(ApiConfig.equipment);
      if (response.statusCode == 200 && response.data['data'] != null) {
        return (response.data['data'] as List)
            .map((json) => Equipment.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<Equipment?> getEquipmentById(String id) async {
    try {
      final response = await _apiService.get('${ApiConfig.equipment}/$id');
      if (response.statusCode == 200 && response.data != null) {
        return Equipment.fromJson(response.data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<Map<String, dynamic>> createEquipment(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post(ApiConfig.equipment, data: data);
      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'equipment': Equipment.fromJson(response.data['data'] ?? response.data),
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

  Future<Map<String, dynamic>> updateEquipment(String id, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.put('${ApiConfig.equipment}/$id', data: data);
      if (response.statusCode == 200) {
        return {
          'success': true,
          'equipment': Equipment.fromJson(response.data['data'] ?? response.data),
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

  Future<bool> deleteEquipment(String id) async {
    try {
      final response = await _apiService.delete('${ApiConfig.equipment}/$id');
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      return false;
    }
  }
}

