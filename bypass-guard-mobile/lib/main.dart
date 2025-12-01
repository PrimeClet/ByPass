import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'providers/auth_provider.dart';
import 'providers/request_provider.dart';
import 'providers/equipment_provider.dart';
import 'providers/zone_provider.dart';
import 'providers/user_provider.dart';
import 'providers/sensor_provider.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/requests/requests_list_screen.dart';
import 'screens/requests/new_request_screen.dart';
import 'screens/validation_screen.dart';
import 'screens/history_screen.dart';
import 'screens/zones_screen.dart';
import 'screens/equipment_screen.dart';
import 'screens/sensors_screen.dart';
import 'screens/users_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/roles_permissions_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => RequestProvider()),
        ChangeNotifierProvider(create: (_) => EquipmentProvider()),
        ChangeNotifierProvider(create: (_) => ZoneProvider()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => SensorProvider()),
      ],
      child: MaterialApp.router(
        title: 'ByPass Guard',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        routerConfig: _router,
      ),
    );
  }
}

final GoRouter _router = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/requests',
      builder: (context, state) => const RequestsListScreen(),
    ),
    GoRoute(
      path: '/requests/new',
      builder: (context, state) => const NewRequestScreen(),
    ),
    GoRoute(
      path: '/validation',
      builder: (context, state) => const ValidationScreen(),
    ),
    GoRoute(
      path: '/history',
      builder: (context, state) => const HistoryScreen(),
    ),
    GoRoute(
      path: '/zones',
      builder: (context, state) => const ZonesScreen(),
    ),
    GoRoute(
      path: '/equipment',
      builder: (context, state) => const EquipmentScreen(),
    ),
    GoRoute(
      path: '/sensors',
      builder: (context, state) => const SensorsScreen(),
    ),
    GoRoute(
      path: '/users',
      builder: (context, state) => const UsersScreen(),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfileScreen(),
    ),
    GoRoute(
      path: '/roles-permissions',
      builder: (context, state) => const RolesPermissionsScreen(),
    ),
  ],
);

