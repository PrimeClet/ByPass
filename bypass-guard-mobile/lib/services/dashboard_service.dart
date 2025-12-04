import '../config/api_config.dart';
import '../models/notification.dart';
import '../models/request.dart';
import 'api_service.dart';

class DashboardService {
  final ApiService _apiService;

  DashboardService(this._apiService);

  Future<DashboardSummary> getSummary() async {
    try {
      final response = await _apiService.get(ApiConfig.dashboardSummary);
      return DashboardSummary.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<List<BypassRequest>> getRecentRequests() async {
    try {
      final response = await _apiService.get(ApiConfig.dashboardRecentRequests);
      final List<dynamic> data = response.data is List ? response.data : [];
      return data.map((json) => BypassRequest.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<SystemStatus> getSystemStatus() async {
    try {
      final response = await _apiService.get(ApiConfig.dashboardSystemStatus);
      return SystemStatus.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<List<RequestStatistics>> getRequestStatistics({int days = 30}) async {
    try {
      final response = await _apiService.get(
        ApiConfig.dashboardRequestStatistics,
        queryParameters: {'days': days},
      );
      final List<dynamic> data = response.data is List ? response.data : [];
      return data.map((json) => RequestStatistics.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<TopSensor>> getTopSensors() async {
    try {
      final response = await _apiService.get(ApiConfig.dashboardTopSensors);
      final List<dynamic> data = response.data is List ? response.data : [];
      return data.map((json) => TopSensor.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }
}
