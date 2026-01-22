# 🚀 Guide de Test Local avec XAMPP

## 📋 Prérequis

1. **XAMPP installé** sur votre machine Windows
2. **Navigateur web** moderne (Chrome, Firefox, Edge)

## 🔧 Étapes de Configuration

### Étape 1 : Démarrer XAMPP

1. Ouvrez le **Panneau de contrôle XAMPP**
2. Démarrez les services suivants :
   - ✅ **Apache** (doit être vert)
   - ✅ **MySQL** (doit être vert)

### Étape 2 : Vérifier l'Installation

1. Ouvrez votre navigateur
2. Accédez à : **http://localhost/pimms/test-xampp.php**
3. Vérifiez que tous les tests sont au vert ✅

### Étape 3 : Créer la Base de Données

**Option A : Via le script automatique (Recommandé)**
1. Accédez à : **http://localhost/pimms/create-database.php**
2. Le script va créer automatiquement :
   - La base de données `pimms_mediation`
   - Les tables nécessaires
   - Les utilisateurs par défaut

**Option B : Via phpMyAdmin**
1. Accédez à : **http://localhost/phpmyadmin**
2. Créez une nouvelle base de données : `pimms_mediation`
3. Importez le fichier : `database/schema.sql`

### Étape 4 : Accéder à l'Application

1. Ouvrez : **http://localhost/pimms/index.html**
2. Connectez-vous avec un des comptes suivants :

| Rôle | Nom d'utilisateur | Mot de passe |
|------|-------------------|--------------|
| Admin | `admin` | `admin123` |
| Accueil | `accueil` | `accueil123` |
| Médiateur | `mediateur` | `mediateur123` |

## 🧪 Tests à Effectuer

### Test 1 : Connexion
- [ ] Se connecter avec chaque rôle
- [ ] Vérifier la redirection vers la bonne page

### Test 2 : Fonctionnalités Accueil
- [ ] Ajouter un nouveau visiteur
- [ ] Vérifier l'attribution d'un numéro de suivi
- [ ] Modifier le statut d'un visiteur

### Test 3 : Fonctionnalités Médiateur
- [ ] Voir la liste des visiteurs
- [ ] Filtrer par statut
- [ ] Modifier les informations d'un visiteur

### Test 4 : Fonctionnalités Admin
- [ ] Gérer les utilisateurs
- [ ] Voir les statistiques
- [ ] Exporter les données

## 🐛 Dépannage

### Problème : "Erreur de connexion à la base de données"
**Solution :**
1. Vérifiez que MySQL est démarré dans XAMPP
2. Vérifiez les paramètres dans `api/config.php`
3. Exécutez `create-database.php` si la base n'existe pas

### Problème : "404 Not Found"
**Solution :**
1. Vérifiez que Apache est démarré dans XAMPP
2. Vérifiez que les fichiers sont dans `C:\xampp\htdocs\pimms\`
3. Accédez via `http://localhost/pimms/` (avec le slash final)

### Problème : "Extension PDO non chargée"
**Solution :**
1. Ouvrez `php.ini` dans XAMPP
2. Décommentez la ligne : `extension=pdo_mysql`
3. Redémarrez Apache

### Problème : "Erreur 500 Internal Server Error"
**Solution :**
1. Vérifiez les logs Apache : `C:\xampp\apache\logs\error.log`
2. Vérifiez les permissions des fichiers
3. Vérifiez la syntaxe PHP dans les fichiers

## 📝 Notes Importantes

- Les mots de passe sont stockés en MD5 (à changer en production)
- La base de données est locale, les données ne sont pas partagées
- Pour tester la synchronisation temps réel, ouvrez plusieurs onglets

## 🔗 URLs Utiles

- **Application** : http://localhost/pimms/index.html
- **Test Configuration** : http://localhost/pimms/test-xampp.php
- **Création BDD** : http://localhost/pimms/create-database.php
- **phpMyAdmin** : http://localhost/phpmyadmin

## ✅ Checklist Finale

Avant de commencer à utiliser l'application, vérifiez :

- [ ] Apache est démarré et fonctionne
- [ ] MySQL est démarré et fonctionne
- [ ] La base de données `pimms_mediation` existe
- [ ] Les tables sont créées (users, visitors, sessions)
- [ ] Les utilisateurs par défaut existent
- [ ] Le test de configuration passe tous les tests
- [ ] Vous pouvez accéder à `index.html`

---

**Bon test ! 🎉**





