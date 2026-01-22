<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        if ($method === 'POST') {
            handleLogin();
        } else {
            sendResponse(false, null, 'Méthode non autorisée');
        }
        break;
        
    case 'logout':
        if ($method === 'POST') {
            handleLogout();
        } else {
            sendResponse(false, null, 'Méthode non autorisée');
        }
        break;
        
    case 'verify':
        if ($method === 'GET') {
            handleVerify();
        } else {
            sendResponse(false, null, 'Méthode non autorisée');
        }
        break;
        
    default:
        sendResponse(false, null, 'Action non reconnue');
}

function handleLogin() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        sendResponse(false, null, 'Nom d\'utilisateur et mot de passe requis');
    }
    
    $username = trim($input['username']);
    $password = trim($input['password']);
    
    try {
        // Vérifier les identifiants
        $stmt = $pdo->prepare("SELECT id, username, password, role FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        if (!$user || md5($password) !== $user['password']) {
            sendResponse(false, null, 'Nom d\'utilisateur ou mot de passe incorrect');
        }
        
        // Nettoyer les sessions expirées
        cleanExpiredSessions();
        
        // Créer une nouvelle session
        $sessionToken = generateSessionToken();
        $expiresAt = date('Y-m-d H:i:s', time() + SESSION_TIMEOUT);
        
        $stmt = $pdo->prepare("
            INSERT INTO sessions (user_id, session_token, expires_at) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$user['id'], $sessionToken, $expiresAt]);
        
        // Retourner les informations de l'utilisateur
        $userData = [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'session_token' => $sessionToken
        ];
        
        sendResponse(true, $userData, 'Connexion réussie');
        
    } catch (Exception $e) {
        sendResponse(false, null, 'Erreur lors de la connexion: ' . $e->getMessage());
    }
}

function handleLogout() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $input['session_token'] ?? '';
    
    if (empty($token)) {
        sendResponse(false, null, 'Token de session requis');
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM sessions WHERE session_token = ?");
        $stmt->execute([$token]);
        
        sendResponse(true, null, 'Déconnexion réussie');
        
    } catch (Exception $e) {
        sendResponse(false, null, 'Erreur lors de la déconnexion: ' . $e->getMessage());
    }
}

function handleVerify() {
    $token = $_GET['token'] ?? '';
    
    if (empty($token)) {
        sendResponse(false, null, 'Token de session requis');
    }
    
    $session = isValidSession($token);
    
    if ($session) {
        $userData = [
            'id' => $session['user_id'],
            'username' => $session['username'],
            'role' => $session['role']
        ];
        sendResponse(true, $userData, 'Session valide');
    } else {
        sendResponse(false, null, 'Session invalide ou expirée');
    }
}
?>
