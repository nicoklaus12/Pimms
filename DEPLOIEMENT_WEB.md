# 🌐 Guide d'hébergement en ligne - Pimms Médiation

## 📋 Prérequis hébergement

### Fonctionnalités requises :
- ✅ **PHP 7.4+** ou 8.x
- ✅ **MySQL 5.7+** ou 8.x
- ✅ **Support des fichiers .htaccess**
- ✅ **Espace disque** : 100 MB minimum
- ✅ **Bande passante** : Illimitée (recommandée)

## 🚀 Étapes de déploiement

### 1. Choisir un hébergeur

**Recommandations :**
- **OVH** (France) : https://www.ovh.com - À partir de 2€/mois
- **1&1 IONOS** : https://www.ionos.fr - À partir de 1€/mois
- **Hostinger** : https://www.hostinger.fr - À partir de 1€/mois
- **Infomaniak** : https://www.infomaniak.com - À partir de 3€/mois

### 2. Créer un compte et souscrire

1. Choisir un **plan d'hébergement mutualisé** (shared hosting)
2. Sélectionner un **nom de domaine** (ex: pimms-mediation.com)
3. Finaliser la commande

### 3. Accéder au panneau de contrôle

- **cPanel** (le plus courant)
- **Plesk** 
- **DirectAdmin**

### 4. Créer la base de données MySQL

1. Aller dans **"Bases de données MySQL"**
2. Créer une nouvelle base : `pimms_mediation`
3. Créer un utilisateur : `pimms_user`
4. Mot de passe : `[mot_de_passe_fort]`
5. Assigner l'utilisateur à la base de données

### 5. Uploader les fichiers

**Méthode 1 : File Manager (cPanel)**
1. Aller dans **"Gestionnaire de fichiers"**
2. Naviguer vers le dossier `public_html`
3. Uploader tous les fichiers du projet

**Méthode 2 : FTP**
1. Utiliser **FileZilla** ou **WinSCP**
2. Se connecter avec les identifiants FTP
3. Uploader vers `public_html/`

### 6. Configurer l'application

**Modifier `api/config.php` :**
```php
$host = 'localhost'; // ou l'adresse fournie par l'hébergeur
$dbname = 'pimms_mediation';
$username = 'pimms_user';
$password = 'votre_mot_de_passe';
```

### 7. Importer la base de données

**Méthode 1 : phpMyAdmin**
1. Aller dans **"phpMyAdmin"**
2. Sélectionner la base `pimms_mediation`
3. Importer le fichier `database/schema.sql`

**Méthode 2 : Script automatique**
1. Ouvrir : `https://votre-domaine.com/create-database.php`
2. Le script créera automatiquement la base

### 8. Tester l'application

1. Ouvrir : `https://votre-domaine.com/`
2. Se connecter avec les comptes par défaut
3. Tester toutes les fonctionnalités

## 🔧 Configuration avancée

### Sécurité
```php
// Dans api/config.php
// Changer les mots de passe par défaut
// Activer HTTPS
// Configurer les permissions de fichiers
```

### Performance
- Activer la compression GZIP
- Configurer le cache navigateur
- Optimiser les images

### Sauvegarde
- Configurer les sauvegardes automatiques
- Exporter régulièrement la base de données
- Sauvegarder les fichiers

## 📊 Coûts estimés

| Hébergeur | Prix/mois | Domaine inclus | SSL inclus |
|-----------|-----------|----------------|------------|
| OVH | 2€ | Non | Oui |
| 1&1 IONOS | 1€ | Oui | Oui |
| Hostinger | 1€ | Oui | Oui |
| Infomaniak | 3€ | Non | Oui |

## 🚨 Dépannage

### Erreurs courantes
- **500 Internal Server Error** : Vérifier les permissions des fichiers
- **Database connection failed** : Vérifier les paramètres dans config.php
- **404 Not Found** : Vérifier que les fichiers sont dans public_html

### Support
- Consulter la documentation de l'hébergeur
- Contacter le support technique
- Vérifier les logs d'erreur

## 🔄 Mise à jour

Pour mettre à jour l'application :
1. Sauvegarder la base de données
2. Remplacer les fichiers (sauf config.php)
3. Tester les fonctionnalités
4. Restaurer la base si nécessaire
