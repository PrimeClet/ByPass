import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/request_provider.dart';

class AppDrawer extends StatelessWidget {
  final String currentRoute;

  const AppDrawer({
    super.key,
    required this.currentRoute,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer2<AuthProvider, RequestProvider>(
      builder: (context, authProvider, requestProvider, _) {
        final user = authProvider.user;

        if (user == null) {
          return const Drawer(
            child: Center(child: CircularProgressIndicator()),
          );
        }

        // Calculate pending counts for badges
        final pendingRequests = requestProvider.requests
            .where((r) => r.status == 'pending')
            .length;

        final pendingValidations = requestProvider.requests.where((r) {
          if (r.status != 'pending') return false;
          if (r.requiresDualValidation) {
            if (r.validationStatusLevel1 != 'approved' && user.canValidateLevel1) {
              return true;
            }
            if (r.validationStatusLevel1 == 'approved' &&
                r.validationStatusLevel2 != 'approved' &&
                user.canValidateLevel2) {
              return true;
            }
            return false;
          }
          return user.canValidateLevel1;
        }).length;

        return Drawer(
          backgroundColor: Colors.white,
          child: Column(
            children: [
              // Header with gradient
              _buildDrawerHeader(context, user),

              // Menu items
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  children: [
                    // Main navigation
                    if (user.canViewDashboard)
                      _buildMenuItem(
                        context: context,
                        icon: Icons.dashboard_outlined,
                        selectedIcon: Icons.dashboard,
                        label: 'Tableau de bord',
                        route: '/dashboard',
                        isSelected: currentRoute == '/dashboard',
                      ),

                    _buildMenuItem(
                      context: context,
                      icon: Icons.assignment_outlined,
                      selectedIcon: Icons.assignment,
                      label: 'Mes demandes',
                      route: '/requests',
                      isSelected: currentRoute == '/requests',
                      badge: pendingRequests > 0 ? pendingRequests : null,
                    ),

                    _buildMenuItem(
                      context: context,
                      icon: Icons.add_circle_outline,
                      selectedIcon: Icons.add_circle,
                      label: 'Nouvelle demande',
                      route: '/requests/new',
                      isSelected: currentRoute == '/requests/new',
                    ),

                    if (user.canValidateLevel1 || user.canValidateLevel2)
                      _buildMenuItem(
                        context: context,
                        icon: Icons.fact_check_outlined,
                        selectedIcon: Icons.fact_check,
                        label: 'Validation',
                        route: '/validation',
                        isSelected: currentRoute == '/validation',
                        badge: pendingValidations > 0 ? pendingValidations : null,
                        badgeColor: AppColors.warning,
                      ),

                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Divider(),
                    ),

                    // Section label
                    if (user.canManageEquipment || user.canViewDashboard)
                      _buildSectionLabel('Gestion'),

                    if (user.canViewDashboard)
                      _buildMenuItem(
                        context: context,
                        icon: Icons.location_on_outlined,
                        selectedIcon: Icons.location_on,
                        label: 'Zones',
                        route: '/zones',
                        isSelected: currentRoute == '/zones',
                      ),

                    if (user.canManageEquipment)
                      _buildMenuItem(
                        context: context,
                        icon: Icons.precision_manufacturing_outlined,
                        selectedIcon: Icons.precision_manufacturing,
                        label: 'Équipements',
                        route: '/equipment',
                        isSelected: currentRoute == '/equipment',
                      ),

                    if (user.canManageEquipment)
                      _buildMenuItem(
                        context: context,
                        icon: Icons.sensors_outlined,
                        selectedIcon: Icons.sensors,
                        label: 'Capteurs',
                        route: '/sensors',
                        isSelected: currentRoute == '/sensors',
                      ),

                    if (user.canManageUsers) ...[
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Divider(),
                      ),
                      _buildSectionLabel('Administration'),
                      _buildMenuItem(
                        context: context,
                        icon: Icons.people_outline,
                        selectedIcon: Icons.people,
                        label: 'Utilisateurs',
                        route: '/users',
                        isSelected: currentRoute == '/users',
                      ),
                      _buildMenuItem(
                        context: context,
                        icon: Icons.admin_panel_settings_outlined,
                        selectedIcon: Icons.admin_panel_settings,
                        label: 'Rôles & Permissions',
                        route: '/roles-permissions',
                        isSelected: currentRoute == '/roles-permissions',
                      ),
                    ],

                    if (user.canViewHistory) ...[
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Divider(),
                      ),
                      _buildSectionLabel('Historique'),
                      _buildMenuItem(
                        context: context,
                        icon: Icons.history_outlined,
                        selectedIcon: Icons.history,
                        label: 'Historique',
                        route: '/history',
                        isSelected: currentRoute == '/history',
                      ),
                    ],
                  ],
                ),
              ),

              // Bottom section
              Container(
                decoration: BoxDecoration(
                  color: AppColors.muted,
                  border: Border(
                    top: BorderSide(
                      color: AppColors.border,
                      width: 1,
                    ),
                  ),
                ),
                child: Column(
                  children: [
                    _buildMenuItem(
                      context: context,
                      icon: Icons.settings_outlined,
                      selectedIcon: Icons.settings,
                      label: 'Paramètres',
                      route: '/settings',
                      isSelected: currentRoute == '/settings',
                    ),
                    _buildMenuItem(
                      context: context,
                      icon: Icons.person_outline,
                      selectedIcon: Icons.person,
                      label: 'Mon Profil',
                      route: '/profile',
                      isSelected: currentRoute == '/profile',
                    ),
                    const SizedBox(height: 8),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: _buildLogoutButton(context, authProvider),
                    ),
                    const SizedBox(height: 16),
                    // Version
                    Text(
                      'ByPass Guard v1.0.0',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary.withValues(alpha: 0.6),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDrawerHeader(BuildContext context, user) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 20,
        bottom: 20,
        left: 20,
        right: 20,
      ),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1E3A8A),
            Color(0xFF3B82F6),
            Color(0xFF60A5FA),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Logo and app name
          Row(
            children: [
              Container(
                width: 45,
                height: 45,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Center(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      const Icon(
                        Icons.shield_outlined,
                        size: 26,
                        color: AppColors.primary,
                      ),
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.swap_horiz,
                            size: 8,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ByPass Guard',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    'Gestion des bypass',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 20),

          // User info
          Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.3),
                    width: 2,
                  ),
                ),
                child: Center(
                  child: Text(
                    user.initials,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.fullName,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        user.roleDisplayName,
                        style: const TextStyle(
                          fontSize: 11,
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 16, 4),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: AppColors.textSecondary.withValues(alpha: 0.7),
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required BuildContext context,
    required IconData icon,
    required IconData selectedIcon,
    required String label,
    required String route,
    required bool isSelected,
    int? badge,
    Color? badgeColor,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: Material(
        color: isSelected
            ? AppColors.primary.withValues(alpha: 0.1)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: () {
            Navigator.pop(context); // Close drawer
            if (!isSelected) {
              context.go(route);
            }
          },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Icon(
                  isSelected ? selectedIcon : icon,
                  size: 22,
                  color: isSelected ? AppColors.primary : AppColors.textSecondary,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                      color: isSelected
                          ? AppColors.primary
                          : AppColors.textPrimary,
                    ),
                  ),
                ),
                if (badge != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: badgeColor ?? AppColors.error,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      badge > 99 ? '99+' : badge.toString(),
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                if (isSelected && badge == null)
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context, AuthProvider authProvider) {
    return Material(
      color: AppColors.error.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: () async {
          final confirmed = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              title: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.logout,
                      color: AppColors.error,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text('Déconnexion'),
                ],
              ),
              content: const Text(
                'Êtes-vous sûr de vouloir vous déconnecter ?',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Annuler'),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context, true),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.error,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Déconnexion'),
                ),
              ],
            ),
          );

          if (confirmed == true && context.mounted) {
            await authProvider.logout();
            if (context.mounted) {
              context.go('/login');
            }
          }
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.logout, color: AppColors.error, size: 20),
              SizedBox(width: 8),
              Text(
                'Déconnexion',
                style: TextStyle(
                  color: AppColors.error,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Bottom Navigation Bar Widget
class AppBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const AppBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer2<AuthProvider, RequestProvider>(
      builder: (context, authProvider, requestProvider, _) {
        final user = authProvider.user;

        // Count pending validations for badge
        int pendingValidations = 0;
        if (user != null && (user.canValidateLevel1 || user.canValidateLevel2)) {
          pendingValidations = requestProvider.requests.where((r) {
            if (r.status != 'pending') return false;
            if (r.requiresDualValidation) {
              if (r.validationStatusLevel1 != 'approved' && user.canValidateLevel1) {
                return true;
              }
              if (r.validationStatusLevel1 == 'approved' &&
                  r.validationStatusLevel2 != 'approved' &&
                  user.canValidateLevel2) {
                return true;
              }
              return false;
            }
            return user.canValidateLevel1;
          }).length;
        }

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 10,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  if (user?.canViewDashboard ?? false)
                    _buildNavItem(
                      icon: Icons.dashboard_outlined,
                      selectedIcon: Icons.dashboard,
                      label: 'Accueil',
                      index: 0,
                      isSelected: currentIndex == 0,
                      onTap: () => onTap(0),
                    ),
                  _buildNavItem(
                    icon: Icons.assignment_outlined,
                    selectedIcon: Icons.assignment,
                    label: 'Demandes',
                    index: 1,
                    isSelected: currentIndex == 1,
                    onTap: () => onTap(1),
                  ),
                  _buildNavItem(
                    icon: Icons.add_circle_outline,
                    selectedIcon: Icons.add_circle,
                    label: 'Nouveau',
                    index: 2,
                    isSelected: currentIndex == 2,
                    onTap: () => onTap(2),
                    isCenter: true,
                  ),
                  if (user?.canValidateLevel1 ?? false)
                    _buildNavItem(
                      icon: Icons.fact_check_outlined,
                      selectedIcon: Icons.fact_check,
                      label: 'Validation',
                      index: 3,
                      isSelected: currentIndex == 3,
                      onTap: () => onTap(3),
                      badge: pendingValidations > 0 ? pendingValidations : null,
                    ),
                  _buildNavItem(
                    icon: Icons.person_outline,
                    selectedIcon: Icons.person,
                    label: 'Profil',
                    index: 4,
                    isSelected: currentIndex == 4,
                    onTap: () => onTap(4),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required IconData selectedIcon,
    required String label,
    required int index,
    required bool isSelected,
    required VoidCallback onTap,
    bool isCenter = false,
    int? badge,
  }) {
    if (isCenter) {
      return GestureDetector(
        onTap: onTap,
        child: Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.4),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(
            Icons.add,
            color: Colors.white,
            size: 28,
          ),
        ),
      );
    }

    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(
                    isSelected ? selectedIcon : icon,
                    size: 24,
                    color: isSelected
                        ? AppColors.primary
                        : AppColors.textSecondary,
                  ),
                  if (badge != null)
                    Positioned(
                      right: -8,
                      top: -4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 5,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.error,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          badge > 9 ? '9+' : badge.toString(),
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  color: isSelected
                      ? AppColors.primary
                      : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
