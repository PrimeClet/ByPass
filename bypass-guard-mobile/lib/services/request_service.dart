import '../models/request.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class RequestService {
  final ApiService _apiService = ApiService();

  Future<List<BypassRequest>> getAllRequests() async {
    try {
      final response = await _apiService.get(ApiConfig.requests);
      if (response.statusCode == 200 && response.data['data'] != null) {
        return (response.data['data'] as List)
            .map((json) => BypassRequest.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<List<BypassRequest>> getMyRequests() async {
    try {
      final response = await _apiService.get(ApiConfig.requestsMine);
      if (response.statusCode == 200 && response.data['data'] != null) {
        return (response.data['data'] as List)
            .map((json) => BypassRequest.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<List<BypassRequest>> getPendingRequests() async {
    try {
      final response = await _apiService.get(ApiConfig.requestsPending);
      if (response.statusCode == 200 && response.data['data'] != null) {
        return (response.data['data'] as List)
            .map((json) => BypassRequest.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<BypassRequest?> getRequestById(String id) async {
    try {
      final response = await _apiService.get('${ApiConfig.requests}/$id');
      if (response.statusCode == 200 && response.data != null) {
        return BypassRequest.fromJson(response.data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<Map<String, dynamic>> createRequest(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post(ApiConfig.requests, data: data);
      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'request': BypassRequest.fromJson(response.data['data'] ?? response.data),
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

  Future<Map<String, dynamic>> validateRequest(String id, String decision, {String? comment}) async {
    try {
      final response = await _apiService.put(
        '${ApiConfig.requests}/$id/validate',
        data: {
          'decision': decision,
          'comment': comment,
        },
      );
      if (response.statusCode == 200) {
        return {
          'success': true,
          'request': BypassRequest.fromJson(response.data['data'] ?? response.data),
        };
      }
      return {
        'success': false,
        'message': response.data['message'] ?? 'Erreur lors de la validation',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Erreur: ${e.toString()}',
      };
    }
  }

  Future<bool> deleteRequest(String id) async {
    try {
      final response = await _apiService.delete('${ApiConfig.requests}/$id');
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      return false;
    }
  }
}

