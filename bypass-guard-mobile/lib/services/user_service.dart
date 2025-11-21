import '../models/user.dart';
import '../services/api_service.dart';
import '../config/api_config.dart';

class UserService {
  final ApiService _apiService = ApiService();

  Future<List<User>> getAllUsers() async {
    try {
      final response = await _apiService.get(ApiConfig.users);
      if (response.statusCode == 200 && response.data['data'] != null) {
        return (response.data['data'] as List)
            .map((json) => User.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  Future<User?> getUserById(String id) async {
    try {
      final response = await _apiService.get('${ApiConfig.users}/$id');
      if (response.statusCode == 200 && response.data != null) {
        return User.fromJson(response.data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<Map<String, dynamic>> createUser(Map<String, dynamic> data) async {
    try {
      final response = await _apiService.post(ApiConfig.users, data: data);
      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'user': User.fromJson(response.data['data'] ?? response.data),
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

  Future<Map<String, dynamic>> updateUser(String id, Map<String, dynamic> data) async {
    try {
      final response = await _apiService.put('${ApiConfig.users}/$id', data: data);
      if (response.statusCode == 200) {
        return {
          'success': true,
          'user': User.fromJson(response.data['data'] ?? response.data),
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

  Future<bool> deleteUser(String id) async {
    try {
      final response = await _apiService.delete('${ApiConfig.users}/$id');
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (e) {
      return false;
    }
  }
}

