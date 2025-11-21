import 'package:flutter/foundation.dart';
import '../models/request.dart';
import '../services/request_service.dart';

class RequestProvider with ChangeNotifier {
  final RequestService _requestService = RequestService();
  
  List<BypassRequest> _requests = [];
  List<BypassRequest> _myRequests = [];
  List<BypassRequest> _pendingRequests = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<BypassRequest> get requests => _requests;
  List<BypassRequest> get myRequests => _myRequests;
  List<BypassRequest> get pendingRequests => _pendingRequests;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadAllRequests() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _requests = await _requestService.getAllRequests();
    } catch (e) {
      _errorMessage = 'Erreur lors du chargement: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMyRequests() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _myRequests = await _requestService.getMyRequests();
    } catch (e) {
      _errorMessage = 'Erreur lors du chargement: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadPendingRequests() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _pendingRequests = await _requestService.getPendingRequests();
    } catch (e) {
      _errorMessage = 'Erreur lors du chargement: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> createRequest(Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _requestService.createRequest(data);
      if (result['success'] == true) {
        await loadMyRequests();
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

  Future<Map<String, dynamic>> validateRequest(
    String id,
    String decision, {
    String? comment,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _requestService.validateRequest(id, decision, comment: comment);
      if (result['success'] == true) {
        await loadPendingRequests();
        await loadAllRequests();
        return result;
      } else {
        _errorMessage = result['message'] ?? 'Erreur lors de la validation';
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

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}

