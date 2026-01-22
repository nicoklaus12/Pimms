<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Vérifier l'authentification
$token = $_GET['token'] ?? '';
$session = isValidSession($token);

if (!$session) {
    sendResponse(false, null, 'Session invalide ou expirée');
}

// Vérifier que l'utilisateur est admin
if ($session['role'] !== 'admin') {
    sendResponse(false, null, 'Accès non autorisé - Rôle admin requis');
}

switch ($action) {
    case 'list':
        if ($method === 'GET') {
            handleGetUsers();
        } else {
            sendResponse(false, null, 'Méthode non autorisée');
        }
        break;
        
    case 'add':
        if ($method === 'POST') {
            handleAddUser();
        } else {
            sendResponse(false, null, 'Méthode non autorisée');
        }
        break;
        
    case 'delete':
        if ($method === 'DELETE') {
            handleDeleteUser();
        } else {
            sendResponse(false, null, 'Méthode non autorisée');
        }
        break;
        
    default:
        sendResponse(false, null, 'Action non reconnue');
}

function handleGetUsers() {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT id, username, role, created_at, updated_at
            FROM users 
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $users = $stmt->fetchAll();
        
        sendResponse(true, $users, 'Liste des utilisateurs récupérée');
        
    } catch (Exception $e) {
        sendResponse(false, null, 'Erreur lors de la récupération des utilisateurs: ' . $e->getMessage());
    }
}

function handleAddUser() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validation des données
    $required = ['username', 'password', 'role'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            sendResponse(false, null, "Le champ $field est requis");
        }
    }
    
    $username = trim($input['username']);
    $password = trim($input['password']);
    $role = $input['role'];
    
    // Vérifier que le rôle est valide
    $allowedRoles = ['admin', 'accueil', 'mediateur'];
    if (!in_array($role, $allowedRoles)) {
        sendResponse(false, null, 'Rôle invalide');
    }
    
    // Vérifier que le nom d'utilisateur n'existe pas déjà
    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            sendResponse(false, null, 'Ce nom d\'utilisateur existe déjà');
        }
        
        // Créer l'utilisateur
        $stmt = $pdo->prepare("
            INSERT INTO users (username, password, role) 
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([$username, md5($password), $role]);
        $userId = $pdo->lastInsertId();
        
        // Récupérer l'utilisateur créé
        $stmt = $pdo->prepare("
            SELECT id, username, role, created_at, updated_at
            FROM users WHERE id = ?
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        sendResponse(true, $user, 'Utilisateur créé avec succès');
        
    } catch (Exception $e) {
        sendResponse(false, null, 'Erreur lors de la création de l\'utilisateur: ' . $e->getMessage());
    }
}

function handleDeleteUser() {
    global $pdo;
    
    $userId = $_GET['id'] ?? '';
    
    if (empty($userId)) {
        sendResponse(false, null, 'ID de l\'utilisateur requis');
    }
    
    // Empêcher la suppression de l'utilisateur connecté
    if ($userId == $session['user_id']) {
        sendResponse(false, null, 'Vous ne pouvez pas supprimer votre propre compte');
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(true, null, 'Utilisateur supprimé avec succès');
        } else {
            sendResponse(false, null, 'Utilisateur non trouvé');
        }
        
    } catch (Exception $e) {
        sendResponse(false, null, 'Erreur lors de la suppression: ' . $e->getMessage());
    }
}
?>
