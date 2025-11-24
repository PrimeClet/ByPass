# ByPass Guard Mobile

Application mobile Flutter pour la gestion des demandes de bypass.

## Technologies

- Flutter SDK (>=3.0.0)
- Provider pour la gestion d'état
- Dio pour les appels API
- GoRouter pour la navigation
- SharedPreferences et Flutter Secure Storage pour le stockage local
- Intl pour le formatage des dates

## Configuration

1. Installer Flutter SDK (version 3.0.0 ou supérieure)
2. Exécuter `flutter pub get` pour installer les dépendances
3. Configurer l'URL de l'API dans `lib/config/api_config.dart`
4. Lancer l'application avec `flutter run`

## Structure du projet

```
lib/
├── config/          # Configuration (API, routes, etc.)
│   └── api_config.dart
├── models/          # Modèles de données
│   ├── user.dart
│   ├── request.dart
│   └── equipment.dart
├── services/        # Services (API, storage, etc.)
│   ├── api_service.dart
│   ├── auth_service.dart
│   ├── request_service.dart
│   ├── equipment_service.dart
│   ├── zone_service.dart
│   ├── sensor_service.dart
│   └── user_service.dart
├── providers/       # Providers pour la gestion d'état
│   ├── auth_provider.dart
│   ├── request_provider.dart
│   ├── equipment_provider.dart
│   ├── zone_provider.dart
│   ├── sensor_provider.dart
│   └── user_provider.dart
├── screens/         # Écrans de l'application
│   ├── login_screen.dart
│   ├── dashboard_screen.dart
│   ├── profile_screen.dart
│   ├── requests/
│   │   ├── requests_list_screen.dart
│   │   └── new_request_screen.dart
│   ├── validation_screen.dart
│   ├── history_screen.dart
│   ├── zones_screen.dart
│   ├── equipment_screen.dart
│   ├── sensors_screen.dart
│   ├── users_screen.dart
│   ├── settings_screen.dart
│   └── roles_permissions_screen.dart
├── widgets/         # Widgets réutilisables
│   ├── loading_widget.dart
│   ├── error_widget.dart
│   ├── empty_state_widget.dart
│   └── request_card.dart
├── utils/           # Utilitaires
│   └── permission_helper.dart
└── main.dart        # Point d'entrée
```

## Fonctionnalités

### Authentification
- Connexion avec email et mot de passe
- Gestion du token d'authentification
- Vérification automatique de l'authentification

### Demandes
- Liste des demandes (mes demandes / toutes les demandes)
- Création de nouvelles demandes
- Validation des demandes (pour superviseurs)
- Historique des demandes

### Gestion
- Zones : CRUD complet
- Équipements : CRUD complet
- Capteurs : Consultation et gestion
- Utilisateurs : CRUD complet (administrateurs)

### Profil
- Consultation des informations personnelles
- Modification du téléphone
- Changement de mot de passe

### Paramètres
- Paramètres système
- Gestion des rôles et permissions

## API

L'application se connecte à l'API Laravel située dans `../ByPass_API`.

Base URL par défaut : `http://127.0.0.1:8001/api`

## Rôles et Permissions

- **user** : Peut soumettre des demandes
- **supervisor** : Peut approuver les demandes niveau 1, voir toutes les demandes
- **director** : Peut approuver les demandes niveau 2, gérer les équipements
- **administrator** : Accès complet au système

## Développement

Pour lancer l'application en mode développement :
```bash
flutter run
```

Pour générer les fichiers de build :
```bash
flutter build apk  # Android
flutter build ios  # iOS
```

