<?php
// Script pour créer la base de données automatiquement
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Création de la base de données Pimms Médiation</h2>";

$host = 'localhost';
$username = 'root';
$password = '';

try {
    // Connexion sans spécifier de base de données
    $pdo = new PDO("mysql:host=$host;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p>✅ Connexion à MySQL réussie</p>";
    
    // Créer la base de données
    $pdo->exec("CREATE DATABASE IF NOT EXISTS pimms_mediation");
    echo "<p>✅ Base de données 'pimms_mediation' créée</p>";
    
    // Sélectionner la base de données
    $pdo->exec("USE pimms_mediation");
    
    // Créer la table users
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'accueil', 'mediateur') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "<p>✅ Table 'users' créée</p>";
    
    // Créer la table visitors
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS visitors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            numero_suivi INT UNIQUE NOT NULL,
            nom VARCHAR(100) NOT NULL,
            prenom VARCHAR(100) NOT NULL,
            sexe ENUM('Homme', 'Femme') NOT NULL,
            motif TEXT NOT NULL,
            priorite VARCHAR(20) DEFAULT NULL,
            heure_rdv TIME DEFAULT NULL,
            statut ENUM('En attente', 'Reçu', 'Terminé') DEFAULT 'En attente',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    echo "<p>✅ Table 'visitors' créée</p>";
    
    // Ajouter les colonnes manquantes si la table existe déjà
    $stmt = $pdo->query("DESCRIBE visitors");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('priorite', $columns)) {
        try {
            $pdo->exec("ALTER TABLE visitors ADD COLUMN priorite VARCHAR(20) DEFAULT NULL AFTER motif");
            echo "<p>✅ Colonne 'priorite' ajoutée</p>";
        } catch (PDOException $e) {
            echo "<p>⚠️ Note: " . $e->getMessage() . "</p>";
        }
    } else {
        echo "<p>ℹ️ Colonne 'priorite' existe déjà</p>";
    }
    
    if (!in_array('heure_rdv', $columns)) {
        try {
            $pdo->exec("ALTER TABLE visitors ADD COLUMN heure_rdv TIME DEFAULT NULL AFTER priorite");
            echo "<p>✅ Colonne 'heure_rdv' ajoutée</p>";
        } catch (PDOException $e) {
            echo "<p>⚠️ Note: " . $e->getMessage() . "</p>";
        }
    } else {
        echo "<p>ℹ️ Colonne 'heure_rdv' existe déjà</p>";
    }
    
    // Mettre à jour le statut si nécessaire
    try {
        $pdo->exec("ALTER TABLE visitors MODIFY COLUMN statut ENUM('En attente', 'Reçu', 'Terminé') DEFAULT 'En attente'");
        echo "<p>✅ Statut mis à jour</p>";
    } catch (PDOException $e) {
        // Ignorer si déjà à jour
        if (strpos($e->getMessage(), 'Duplicate') === false) {
            echo "<p>⚠️ Note: " . $e->getMessage() . "</p>";
        }
    }
    
    // Créer la table sessions
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ");
    echo "<p>✅ Table 'sessions' créée</p>";
    
    // Insérer les utilisateurs par défaut
    $pdo->exec("
        INSERT IGNORE INTO users (username, password, role) VALUES
        ('admin', MD5('admin123'), 'admin'),
        ('accueil', MD5('accueil123'), 'accueil'),
        ('mediateur', MD5('mediateur123'), 'mediateur')
    ");
    echo "<p>✅ Utilisateurs par défaut créés</p>";
    
    // Créer les index
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_visitors_statut ON visitors(statut)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_visitors_numero_suivi ON visitors(numero_suivi)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)");
    echo "<p>✅ Index créés</p>";
    
    echo "<h3 style='color: green;'>✅ Base de données créée avec succès !</h3>";
    echo "<p><a href='index.html'>Retour à l'application</a></p>";
    
} catch(PDOException $e) {
    echo "<p style='color: red;'>❌ Erreur: " . $e->getMessage() . "</p>";
    echo "<p>Vérifiez que MySQL est démarré dans XAMPP</p>";
}
?>
