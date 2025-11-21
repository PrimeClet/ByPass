import 'package:flutter/foundation.dart';
import '../models/equipment.dart';
import '../services/zone_service.dart';

class ZoneProvider with ChangeNotifier {
  final ZoneService _zoneService = ZoneService();
  
  List<Zone> _zones = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Zone> get zones => _zones;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadZones() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _zones = await _zoneService.getAllZones();
    } catch (e) {
      _errorMessage = 'Erreur lors du chargement: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> createZone(Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _zoneService.createZone(data);
      if (result['success'] == true) {
        await loadZones();
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

  Future<Map<String, dynamic>> updateZone(String id, Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _zoneService.updateZone(id, data);
      if (result['success'] == true) {
        await loadZones();
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

  Future<bool> deleteZone(String id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final success = await _zoneService.deleteZone(id);
      if (success) {
        await loadZones();
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

