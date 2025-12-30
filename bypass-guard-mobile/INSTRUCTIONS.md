# Instructions pour lancer l'application mobile

## Prérequis

1. **Installer Flutter SDK**
   - Télécharger Flutter depuis : https://flutter.dev/docs/get-started/install
   - Ajouter Flutter au PATH système
   - Vérifier l'installation : `flutter doctor`

2. **Installer les dépendances**
   ```bash
   cd bypass-guard-mobile
   flutter pub get
   ```

3. **Configurer l'émulateur ou connecter un appareil**
   - Pour Android : Lancer un émulateur Android ou connecter un appareil physique
   - Pour iOS (Mac uniquement) : Lancer le simulateur iOS ou connecter un iPhone

## Lancer l'application

```bash
# Depuis le dossier bypass-guard-mobile
flutter run
```

## Commandes utiles

```bash
# Vérifier l'état de Flutter
flutter doctor

# Lister les appareils disponibles
flutter devices

# Lancer sur un appareil spécifique
flutter run -d <device-id>

# Construire l'APK pour Android
flutter build apk

# Construire l'application pour iOS
flutter build ios
```

## Configuration de l'API

L'URL de l'API est configurée dans `lib/config/api_config.dart`.
Par défaut : `http://127.0.0.1:8001/api`

Pour tester sur un appareil physique, vous devrez peut-être changer l'URL par l'adresse IP de votre machine au lieu de `127.0.0.1`.

## Notes importantes

- Assurez-vous que l'API Laravel est en cours d'exécution avant de lancer l'application mobile
- Pour tester sur un appareil physique, l'appareil et l'ordinateur doivent être sur le même réseau
- Les permissions réseau doivent être configurées dans `AndroidManifest.xml` et `Info.plist` pour iOS


