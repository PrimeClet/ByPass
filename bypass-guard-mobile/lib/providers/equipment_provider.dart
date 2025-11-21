import 'package:flutter/foundation.dart';
import '../models/equipment.dart';
import '../services/equipment_service.dart';

class EquipmentProvider with ChangeNotifier {
  final EquipmentService _equipmentService = EquipmentService();
  
  List<Equipment> _equipment = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Equipment> get equipment => _equipment;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadEquipment() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _equipment = await _equipmentService.getAllEquipment();
    } catch (e) {
      _errorMessage = 'Erreur lors du chargement: ${e.toString()}';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> createEquipment(Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _equipmentService.createEquipment(data);
      if (result['success'] == true) {
        await loadEquipment();
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

  Future<Map<String, dynamic>> updateEquipment(String id, Map<String, dynamic> data) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _equipmentService.updateEquipment(id, data);
      if (result['success'] == true) {
        await loadEquipment();
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

  Future<bool> deleteEquipment(String id) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final success = await _equipmentService.deleteEquipment(id);
      if (success) {
        await loadEquipment();
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

