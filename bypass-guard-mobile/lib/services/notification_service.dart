import '../config/api_config.dart';
import '../models/notification.dart';
import 'api_service.dart';

class NotificationService {
  final ApiService _apiService;

  NotificationService(this._apiService);

  Future<List<AppNotification>> getNotifications() async {
    try {
      final response = await _apiService.get(ApiConfig.notifications);
      final List<dynamic> data = response.data is List ? response.data : [];
      return data.map((json) => AppNotification.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await _apiService.get('${ApiConfig.notifications}/$notificationId/mark-as-read');
    } catch (e) {
      rethrow;
    }
  }

  Future<int> getUnreadCount() async {
    try {
      final notifications = await getNotifications();
      return notifications.where((n) => !n.isRead).length;
    } catch (e) {
      return 0;
    }
  }
}
