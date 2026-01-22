# 🏢 Pimms Médiation - Système de Gestion des Visiteurs

[![Version](https://img.shields.io/badge/version-2.0-blue.svg)](https://github.com/Nicoklaus30/Pimms)
[![PHP](https://img.shields.io/badge/PHP-7.4+-green.svg)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-orange.svg)](https://mysql.com)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

## 📋 Description

**Pimms Médiation** est un système web complet de gestion des visiteurs pour les entreprises de médiation. Il permet l'enregistrement, le suivi et la gestion en temps réel des visiteurs avec synchronisation entre tous les utilisateurs connectés.

## ✨ Fonctionnalités

### 🔐 **Authentification & Rôles**
- **Admin** : Gestion complète des utilisateurs et du système
- **Accueil** : Enregistrement et gestion des visiteurs
- **Médiateur** : Consultation et mise à jour des statuts

### 👥 **Gestion des Visiteurs**
- Enregistrement avec numéro de suivi automatique
- Informations complètes : Nom, Prénom, Sexe, Motif
- Champ RDV (Rendez-vous)
- Statuts : En attente → Reçu → Fait
- Recherche et filtrage avancés

### 🔄 **Synchronisation Temps Réel**
- Mise à jour automatique toutes les 5 secondes
- Tous les utilisateurs voient les mêmes données
- Modifications instantanées pour tous les connectés

### 🛡️ **Sécurité**
- Sessions sécurisées avec tokens
- Authentification robuste
- Gestion des permissions par rôle
- Protection contre les injections SQL

## 🚀 Installation

### Prérequis
- **XAMPP** ou **WAMP** (Apache + MySQL + PHP)
- **Navigateur web** moderne

### Installation locale
1. **Cloner le projet :**
   ```bash
   git clone https://github.com/Nicoklaus30/Pimms.git
   cd Pimms
   ```

2. **Démarrer XAMPP :**
   - Lancer XAMPP Control Panel
   - Démarrer **Apache** et **MySQL**

3. **Créer la base de données :**
   - Ouvrir : `http://localhost/pimms/create-database.php`
   - Le script créera automatiquement la base de données

4. **Accéder à l'application :**
   - Ouvrir : `http://localhost/pimms/`

### Comptes de test
- **Admin** : `admin` / `admin123`
- **Accueil** : `accueil` / `accueil123`
- **Médiateur** : `mediateur` / `mediateur123`

## 🌐 Déploiement en ligne

### Hébergement web classique
1. Choisir un hébergeur (OVH, 1&1, Hostinger...)
2. Créer une base de données MySQL
3. Uploader les fichiers via cPanel ou FTP
4. Modifier `api/config.php` avec vos paramètres
5. Importer la base de données

**Coût estimé :** 1-3€/mois

### Hébergement cloud
- **Firebase** (gratuit) - Base de données temps réel
- **Vercel + PlanetScale** (gratuit) - Frontend + Base de données

## 📁 Structure du projet

```
Pimms/
├── 📄 index.html              # Page de connexion
├── 📄 accueil.html            # Interface Accueil
├── 📄 mediateur.html          # Interface Médiateur
├── 📄 admin.html              # Interface Admin
├── 📁 api/                    # Backend PHP
│   ├── config.php             # Configuration base de données
│   ├── auth.php               # API d'authentification
│   ├── visitors.php           # API gestion visiteurs
│   └── users.php              # API gestion utilisateurs
├── 📁 js/                     # JavaScript frontend
│   ├── api-client.js          # Client API
│   ├── accueil-api.js         # Logique page Accueil
│   ├── mediateur-api.js       # Logique page Médiateur
│   └── admin-api.js           # Logique page Admin
├── 📁 css/                    # Styles CSS
├── 📁 database/               # Schéma base de données
│   └── schema.sql             # Structure MySQL
├── 📄 create-database.php     # Script création automatique
├── 📄 INSTALLATION.md         # Guide installation local
└── 📄 DEPLOIEMENT_WEB.md      # Guide hébergement en ligne
```

## 🔧 Technologies utilisées

### Backend
- **PHP 7.4+** - Langage serveur
- **MySQL 5.7+** - Base de données
- **PDO** - Accès sécurisé à la base de données
- **JSON** - Communication API

### Frontend
- **HTML5** - Structure des pages
- **CSS3** - Styles et mise en page
- **Bootstrap 5** - Framework CSS
- **JavaScript ES6+** - Logique côté client
- **AJAX** - Communication avec l'API

## 📊 Fonctionnalités par rôle

| Fonctionnalité | Admin | Accueil | Médiateur |
|----------------|-------|---------|-----------|
| Connexion | ✅ | ✅ | ✅ |
| Voir la liste | ✅ | ✅ | ✅ |
| Ajouter visiteur | ✅ | ✅ | ❌ |
| Modifier visiteur | ✅ | ✅ | ❌ |
| Supprimer visiteur | ✅ | ✅ | ❌ |
| Changer statut | ✅ | ✅ | ✅ |
| Gérer utilisateurs | ✅ | ❌ | ❌ |

## 🚨 Dépannage

### Erreurs courantes
- **Erreur de connexion DB** : Vérifier que MySQL est démarré
- **404 sur les API** : Vérifier que les fichiers PHP sont uploadés
- **Erreur de permissions** : Vérifier les permissions des dossiers

### Logs
- **Apache** : `/var/log/apache2/error.log`
- **PHP** : `php.ini` → `log_errors = On`
- **Application** : Console du navigateur (F12)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📝 Changelog

### Version 2.0 (2025-01-12)
- ✨ Backend PHP avec API REST complète
- ✨ Base de données MySQL pour persistance
- ✨ Synchronisation temps réel entre utilisateurs
- ✨ Authentification sécurisée avec sessions
- 🔧 Accueil peut changer tous les statuts
- 📚 Documentation complète d'installation et déploiement

### Version 1.0 (2025-01-11)
- 🎉 Version initiale avec localStorage
- ✨ Interface utilisateur complète
- ✨ Gestion des rôles de base

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

**Nico Klaus** - [@Nicoklaus30](https://github.com/Nicoklaus30)

## 📞 Support

Pour toute question ou problème :
- 📧 Email : nicoklaus30@gmail.com
- 🐛 Issues : [GitHub Issues](https://github.com/Nicoklaus30/Pimms/issues)
- 📖 Documentation : Voir les fichiers `.md` du projet

---

⭐ **N'oubliez pas de mettre une étoile si ce projet vous a aidé !** ⭐