import '../models/equipment.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class ZoneService {
  final ApiService _apiService = ApiService();

  Future<List<Zone>> getAllZones() async {
    try {
      final response = await _apiService.get(ApiConfig.zones);
      if (response.statusCode == 200 && response.data['data'] != null) {
        return (response.data['data'] as List)
            .map((json) => Zone.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<Zone?> getZoneById(String id) async {
    try {
      final response = await _apiService.get('${ApiConfig.zones}/$id');
      if (response.statusCode == 200 && response.data != null) {
        return Zone.fromJson(response.data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<Map<String, dynamic>> createZone(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post(ApiConfig.zones, data: data);
      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'zone': Zone.fromJson(response.data['data'] ?? response.data),
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

  Future<Map<String, dynamic>> updateZone(String id, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.put('${ApiConfig.zones}/$id', data: data);
      if (response.statusCode == 200) {
        return {
          'success': true,
          'zone': Zone.fromJson(response.data['data'] ?? response.data),
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

  Future<bool> deleteZone(String id) async {
    try {
      final response = await _apiService.delete('${ApiConfig.zones}/$id');
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      return false;
    }
  }
}

