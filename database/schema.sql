-- Base de données Pimms Médiation
-- Schéma MySQL pour hébergement web

CREATE DATABASE IF NOT EXISTS pimms_mediation;
USE pimms_mediation;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'accueil', 'mediateur') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des visiteurs
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
);

-- Table des sessions (pour gérer les connexions)
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertion des utilisateurs par défaut
INSERT INTO users (username, password, role) VALUES
('admin', MD5('admin123'), 'admin'),
('accueil', MD5('accueil123'), 'accueil'),
('mediateur', MD5('mediateur123'), 'mediateur');

-- Index pour optimiser les performances
CREATE INDEX idx_visitors_statut ON visitors(statut);
CREATE INDEX idx_visitors_numero_suivi ON visitors(numero_suivi);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);