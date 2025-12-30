class ApiConfig {
  // URL de base de l'API Laravel
  static const String baseUrl = 'http://127.0.0.1:8000/api';
  
  // Endpoints
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
  
  static const String requests = '/requests';
  static const String requestsMine = '/requests/mine';
  static const String requestsPending = '/requests/pending';
  
  static const String equipment = '/equipment';
  static const String zones = '/zones';
  static const String sensors = '/sensors';
  static const String users = '/users';
  
  static const String dashboard = '/dashboard/summary';
  static const String history = '/history';
  
  // Timeout
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}

