<?php
// Configuration de la base de données
// À modifier selon votre hébergement

// Désactiver l'affichage des erreurs pour les réponses JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Configuration pour hébergement local (XAMPP/WAMP)
$host = 'localhost';
$dbname = 'pimms_mediation';
$username = 'root';
$password = '';

// Configuration pour hébergement web (à modifier)
// $host = 'votre-serveur-mysql.com';
// $dbname = 'votre_nom_db';
// $username = 'votre_utilisateur';
// $password = 'votre_mot_de_passe';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_PERSISTENT => true,
            PDO::ATTR_EMULATE_PREPARES => true
        ]
    );
} catch(PDOException $e) {
    // Retourner une erreur JSON au lieu de die()
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de connexion à la base de données: ' . $e->getMessage(),
        'data' => null,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// S'assure que la connexion PDO est vivante; sinon, tente une reconnexion
function ensurePdoAlive() {
    global $pdo, $host, $dbname, $username, $password;
    try {
        if (!$pdo) {
            throw new Exception('PDO non initialisé');
        }
        $pdo->query('SELECT 1');
    } catch (Throwable $t) {
        try {
            $pdo = new PDO(
                "mysql:host=$host;dbname=$dbname;charset=utf8",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_PERSISTENT => true,
                    PDO::ATTR_EMULATE_PREPARES => true
                ]
            );
        } catch (Throwable $t2) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Reconnexion MySQL échouée: ' . $t2->getMessage(),
                'data' => null,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            exit();
        }
    }
}

// Configuration de l'application
define('APP_NAME', 'Pimms Médiation');
define('SESSION_TIMEOUT', 3600); // 1 heure en secondes
define('API_VERSION', '1.0');

// Headers CORS pour permettre les requêtes AJAX
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Fonction utilitaire pour les réponses JSON
function sendResponse($success, $data = null, $message = '') {
    $response = [
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// Fonction pour générer un token de session
function generateSessionToken() {
    return bin2hex(random_bytes(32));
}

// Fonction pour vérifier si une session est valide
function isValidSession($token) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        SELECT s.*, u.username, u.role 
        FROM sessions s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.session_token = ? AND s.expires_at > NOW()
    ");
    $stmt->execute([$token]);
    
    return $stmt->fetch();
}

// Fonction pour nettoyer les sessions expirées
function cleanExpiredSessions() {
    global $pdo;
    
    $stmt = $pdo->prepare("DELETE FROM sessions WHERE expires_at < NOW()");
    $stmt->execute();
}
?>
