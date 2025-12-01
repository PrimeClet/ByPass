import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/user_provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isEditing = false;
  final _phoneController = TextEditingController();
  bool _isChangingPassword = false;
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscureCurrentPassword = true;
  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _phoneController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _updateProfile() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userProvider = Provider.of<UserProvider>(context, listen: false);
    final user = authProvider.user;

    if (user == null) return;

    final result = await userProvider.updateUser(user.id, {
      'phone': _phoneController.text,
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result['success'] == true
                ? 'Profil mis à jour'
                : result['message'] ?? 'Erreur',
          ),
          backgroundColor: result['success'] == true ? Colors.green : Colors.red,
        ),
      );
      if (result['success'] == true) {
        setState(() {
          _isEditing = false;
        });
        // Recharger les données utilisateur
        await authProvider.checkAuth();
      }
    }
  }

  Future<void> _changePassword() async {
    if (_newPasswordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Les mots de passe ne correspondent pas'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_newPasswordController.text.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Le mot de passe doit contenir au moins 8 caractères'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // TODO: Implémenter l'appel API pour changer le mot de passe
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Fonctionnalité à implémenter'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    if (user == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (!_isEditing) {
      _phoneController.text = user.phone ?? '';
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Profil'),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () {
                setState(() {
                  _isEditing = true;
                });
              },
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section Informations personnelles
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Informations personnelles',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        if (_isEditing)
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _isEditing = false;
                              });
                            },
                            child: const Text('Annuler'),
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildInfoRow('Nom complet', user.fullName),
                    _buildInfoRow('Email', user.email),
                    _buildInfoRow('Rôle', user.role.displayName),
                    _buildInfoRow('Département', user.department),
                    _buildInfoRow('Zone', user.zone),
                    _buildInfoRow('ID Employé', user.employeeId),
                    if (_isEditing) ...[
                      const SizedBox(height: 16),
                      TextField(
                        controller: _phoneController,
                        decoration: const InputDecoration(
                          labelText: 'Téléphone',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.phone),
                        ),
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _updateProfile,
                        child: const Text('Enregistrer'),
                      ),
                    ] else if (user.phone != null) ...[
                        ListTile(
                          leading: const Icon(Icons.phone),
                          title: const Text('Téléphone'),
                          subtitle: Text(user.phone ?? ''),
                        ),
                      ]
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Section Modification du mot de passe
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Modification du mot de passe',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        IconButton(
                          icon: Icon(
                            _isChangingPassword ? Icons.close : Icons.lock,
                          ),
                          onPressed: () {
                            setState(() {
                              _isChangingPassword = !_isChangingPassword;
                              if (!_isChangingPassword) {
                                _currentPasswordController.clear();
                                _newPasswordController.clear();
                                _confirmPasswordController.clear();
                              }
                            });
                          },
                        ),
                      ],
                    ),
                    if (_isChangingPassword) ...[
                      const SizedBox(height: 16),
                      TextField(
                        controller: _currentPasswordController,
                        decoration: InputDecoration(
                          labelText: 'Mot de passe actuel',
                          border: const OutlineInputBorder(),
                          prefixIcon: const Icon(Icons.lock),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscureCurrentPassword
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscureCurrentPassword = !_obscureCurrentPassword;
                              });
                            },
                          ),
                        ),
                        obscureText: _obscureCurrentPassword,
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _newPasswordController,
                        decoration: InputDecoration(
                          labelText: 'Nouveau mot de passe',
                          border: const OutlineInputBorder(),
                          prefixIcon: const Icon(Icons.lock_outline),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscureNewPassword
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscureNewPassword = !_obscureNewPassword;
                              });
                            },
                          ),
                        ),
                        obscureText: _obscureNewPassword,
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _confirmPasswordController,
                        decoration: InputDecoration(
                          labelText: 'Confirmer le nouveau mot de passe',
                          border: const OutlineInputBorder(),
                          prefixIcon: const Icon(Icons.lock_outline),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscureConfirmPassword
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscureConfirmPassword = !_obscureConfirmPassword;
                              });
                            },
                          ),
                        ),
                        obscureText: _obscureConfirmPassword,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _changePassword,
                        child: const Text('Changer le mot de passe'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }
}

