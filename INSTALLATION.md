# 🚀 Installation et Déploiement - Pimms Médiation

## 📋 Prérequis

### Pour le développement local :
- **XAMPP** ou **WAMP** (Apache + MySQL + PHP)
- **Navigateur web** moderne

### Pour l'hébergement web :
- **Hébergement web** avec support PHP 7.4+
- **Base de données MySQL** 5.7+
- **Accès FTP/SFTP** ou panneau de contrôle

## 🛠️ Installation Locale (XAMPP/WAMP)

### 1. Préparer l'environnement
```bash
# Démarrer XAMPP/WAMP
# - Apache : Port 80
# - MySQL : Port 3306
```

### 2. Créer la base de données
1. Ouvrir **phpMyAdmin** : `http://localhost/phpmyadmin`
2. Créer une nouvelle base de données : `pimms_mediation`
3. Importer le fichier : `database/schema.sql`

### 3. Configurer la connexion
Éditer `api/config.php` :
```php
$host = 'localhost';
$dbname = 'pimms_mediation';
$username = 'root';
$password = ''; // Mot de passe MySQL (vide par défaut)
```

### 4. Déployer les fichiers
```bash
# Copier tous les fichiers vers le dossier web
# XAMPP : C:\xampp\htdocs\pimms\
# WAMP : C:\wamp64\www\pimms\
```

### 5. Tester l'application
Ouvrir : `http://localhost/pimms/`

## 🌐 Déploiement sur Hébergement Web

### 1. Préparer les fichiers
```bash
# Structure des fichiers à uploader :
pimms/
├── index.html
├── accueil.html
├── mediateur.html
├── admin.html
├── css/
├── js/
├── api/
│   ├── config.php
│   ├── auth.php
│   ├── visitors.php
│   └── users.php
└── database/
    └── schema.sql
```

### 2. Configurer la base de données
1. Créer une base de données MySQL via le panneau de contrôle
2. Importer `database/schema.sql`
3. Modifier `api/config.php` :
```php
$host = 'votre-serveur-mysql.com';
$dbname = 'votre_nom_db';
$username = 'votre_utilisateur';
$password = 'votre_mot_de_passe';
```

### 3. Uploader les fichiers
- Via **FTP/SFTP** : Uploader tous les fichiers
- Via **panneau de contrôle** : Uploader l'archive ZIP

### 4. Tester l'application
Ouvrir : `https://votre-domaine.com/pimms/`

## 🔧 Configuration Avancée

### Sécurité
```php
// Dans api/config.php
// Changer les mots de passe par défaut
// Activer HTTPS
// Configurer les permissions de fichiers
```

### Performance
```php
// Optimiser la base de données
// Activer la compression
// Configurer le cache
```

## 🧪 Tests

### Comptes de test
- **Admin** : `admin` / `admin123`
- **Accueil** : `accueil` / `accueil123`
- **Médiateur** : `mediateur` / `mediateur123`

### Tests de synchronisation
1. Ouvrir plusieurs onglets/navigateurs
2. Se connecter avec différents rôles
3. Ajouter/modifier des visiteurs
4. Vérifier la synchronisation temps réel

## 🚨 Dépannage

### Erreurs courantes
- **Erreur de connexion DB** : Vérifier les paramètres dans `config.php`
- **404 sur les API** : Vérifier que les fichiers PHP sont uploadés
- **Erreur de permissions** : Vérifier les permissions des dossiers

### Logs
- **Apache** : `/var/log/apache2/error.log`
- **PHP** : `php.ini` → `log_errors = On`
- **Application** : Console du navigateur (F12)

## 📞 Support

En cas de problème :
1. Vérifier les logs d'erreur
2. Tester la connexion à la base de données
3. Vérifier les permissions des fichiers
4. Consulter la documentation technique

## 🔄 Mise à jour

Pour mettre à jour l'application :
1. Sauvegarder la base de données
2. Remplacer les fichiers (sauf `api/config.php`)
3. Tester les fonctionnalités
4. Restaurer la base de données si nécessaire
