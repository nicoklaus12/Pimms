<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Vérifier l'authentification pour toutes les actions sauf OPTIONS
if ($method !== 'OPTIONS') {
    $token = $_GET['token'] ?? '';
    $session = isValidSession($token);
    
    if (!$session) {
        sendResponse(false, null, 'Session invalide ou expirée');
    }
}

switch ($action) {
    case 'list':
        if ($method === 'GET') {
            handleGetVisitors();
        } else {
            sendResponse(false, null, 'Méthode non autorisée');
        }
        break;
        
    case 'add':
        if ($method === 'POST') {
            handleAddVisitor();
        } else {
            sendResponse(false, null, 'Méthode non autorisée');
        }
        break;
        
    case 'update':
        if ($method === 'PUT') {
            handleUpdateVisitor();
        } else {
            sendResponse(false, null, 'Méthode non autorisée');
        }
        break;
        
    case 'delete':
        if ($method === 'DELETE') {
            handleDeleteVisitor();
        } else {
            sendResponse(false, null, 'Méthode non autorisée');
        }
        break;
        
    case 'update_status':
        if ($method === 'PUT') {
            handleUpdateStatus();
        } else {
            sendResponse(false, null, 'Méthode non autorisée');
        }
        break;
        
    default:
        sendResponse(false, null, 'Action non reconnue');
}

function handleGetVisitors() {
    global $pdo;
    ensurePdoAlive();
    
    try {
        $stmt = $pdo->prepare("
            SELECT id, numero_suivi, nom, prenom, sexe, motif, priorite, heure_rdv, statut, created_at, updated_at
            FROM visitors 
            ORDER BY 
                CASE priorite
                    WHEN 'EDF' THEN 1
                    WHEN 'ENGIE' THEN 2
                    WHEN 'RDV' THEN 3
                    ELSE 4
                END ASC,
                numero_suivi ASC
        ");
        $stmt->execute();
        $visitors = $stmt->fetchAll();
        
        // Nettoyer les données
        foreach ($visitors as &$visitor) {
            $visitor['priorite'] = $visitor['priorite'] ?? '';
            $visitor['heure_rdv'] = $visitor['heure_rdv'] ?? '';
        }
        
        sendResponse(true, $visitors, 'Liste des visiteurs récupérée');
        
    } catch (Exception $e) {
        sendResponse(false, null, 'Erreur lors de la récupération des visiteurs: ' . $e->getMessage());
    }
}

function handleAddVisitor() {
    global $pdo;
    ensurePdoAlive();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log("DEBUG: Données reçues: " . print_r($input, true));
    
    // Validation des données
    $required = ['nom', 'prenom', 'sexe', 'motif'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            sendResponse(false, null, "Le champ $field est requis");
        }
    }
    
    try {
        // Obtenir le prochain numéro de suivi
        $stmt = $pdo->prepare("SELECT MAX(numero_suivi) as max_num FROM visitors");
        $stmt->execute();
        $result = $stmt->fetch();
        $nextNum = ($result['max_num'] ?? 0) + 1;
        
        error_log("DEBUG: Prochain numéro de suivi: $nextNum");
        
        // Insérer le nouveau visiteur
        $stmt = $pdo->prepare("
            INSERT INTO visitors (numero_suivi, nom, prenom, sexe, motif, priorite, heure_rdv, statut) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $priorite = isset($input['priorite']) && $input['priorite'] !== '' ? trim($input['priorite']) : null;
        $heure_rdv = isset($input['heure_rdv']) && $input['heure_rdv'] !== '' ? trim($input['heure_rdv']) : null;
        
        error_log("DEBUG: Données à insérer - priorite: '$priorite', heure_rdv: '$heure_rdv'");
        
        $stmt->execute([
            $nextNum,
            trim($input['nom']),
            trim($input['prenom']),
            $input['sexe'],
            trim($input['motif']),
            $priorite,
            $heure_rdv,
            'En attente'
        ]);
        
        $visitorId = $pdo->lastInsertId();
        error_log("DEBUG: Visiteur créé avec ID: $visitorId");
        
        // Récupérer le visiteur créé
        $stmt = $pdo->prepare("
            SELECT id, numero_suivi, nom, prenom, sexe, motif, priorite, heure_rdv, statut, created_at, updated_at
            FROM visitors WHERE id = ?
        ");
        $stmt->execute([$visitorId]);
        $visitor = $stmt->fetch();
        $visitor['priorite'] = $visitor['priorite'] ?? '';
        $visitor['heure_rdv'] = $visitor['heure_rdv'] ?? '';
        
        error_log("DEBUG: Visiteur récupéré: " . print_r($visitor, true));
        
        sendResponse(true, $visitor, 'Visiteur ajouté avec succès');
        
    } catch (Exception $e) {
        // Si MySQL est parti (2006), on réessaie une fois après reconnexion
        if (strpos($e->getMessage(), '2006') !== false || stripos($e->getMessage(), 'server has gone away') !== false) {
            ensurePdoAlive();
            try {
                $stmt = $pdo->prepare("SELECT MAX(numero_suivi) as max_num FROM visitors");
                $stmt->execute();
                $result = $stmt->fetch();
                $nextNum = ($result['max_num'] ?? 0) + 1;

                $stmt = $pdo->prepare("
                    INSERT INTO visitors (numero_suivi, nom, prenom, sexe, motif, priorite, heure_rdv, statut) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $priorite = isset($input['priorite']) && $input['priorite'] !== '' ? trim($input['priorite']) : null;
                $heure_rdv = isset($input['heure_rdv']) && $input['heure_rdv'] !== '' ? trim($input['heure_rdv']) : null;
                $stmt->execute([$nextNum, trim($input['nom']), trim($input['prenom']), $input['sexe'], trim($input['motif']), $priorite, $heure_rdv, 'En attente']);
                $visitorId = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT id, numero_suivi, nom, prenom, sexe, motif, priorite, heure_rdv, statut, created_at, updated_at FROM visitors WHERE id = ?");
                $stmt->execute([$visitorId]);
                $visitor = $stmt->fetch();
                $visitor['priorite'] = $visitor['priorite'] ?? '';
                $visitor['heure_rdv'] = $visitor['heure_rdv'] ?? '';
                sendResponse(true, $visitor, 'Visiteur ajouté avec succès');
            } catch (Exception $e2) {
                sendResponse(false, null, 'Erreur lors de l\'ajout du visiteur (reconnexion): ' . $e2->getMessage());
            }
        }
        sendResponse(false, null, 'Erreur lors de l\'ajout du visiteur: ' . $e->getMessage());
    }
}

function handleUpdateVisitor() {
    global $pdo;
    ensurePdoAlive();
    
    $input = json_decode(file_get_contents('php://input'), true);
    $visitorId = $_GET['id'] ?? '';
    
    if (empty($visitorId)) {
        sendResponse(false, null, 'ID du visiteur requis');
    }
    
    // Validation des données
    $required = ['nom', 'prenom', 'sexe', 'motif'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            sendResponse(false, null, "Le champ $field est requis");
        }
    }
    
    try {
        $stmt = $pdo->prepare("
            UPDATE visitors 
            SET nom = ?, prenom = ?, sexe = ?, motif = ?, priorite = ?, heure_rdv = ?, updated_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([
            trim($input['nom']),
            trim($input['prenom']),
            $input['sexe'],
            trim($input['motif']),
            isset($input['priorite']) ? trim($input['priorite']) : '',
            isset($input['heure_rdv']) ? trim($input['heure_rdv']) : '',
            $visitorId
        ]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(true, null, 'Visiteur mis à jour avec succès');
        } else {
            sendResponse(false, null, 'Visiteur non trouvé');
        }
        
    } catch (Exception $e) {
        sendResponse(false, null, 'Erreur lors de la mise à jour: ' . $e->getMessage());
    }
}

function handleDeleteVisitor() {
    global $pdo;
    ensurePdoAlive();
    
    $visitorId = $_GET['id'] ?? '';
    
    if (empty($visitorId)) {
        sendResponse(false, null, 'ID du visiteur requis');
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM visitors WHERE id = ?");
        $stmt->execute([$visitorId]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(true, null, 'Visiteur supprimé avec succès');
        } else {
            sendResponse(false, null, 'Visiteur non trouvé');
        }
        
    } catch (Exception $e) {
        sendResponse(false, null, 'Erreur lors de la suppression: ' . $e->getMessage());
    }
}

function handleUpdateStatus() {
    global $pdo;
    ensurePdoAlive();
    
    $input = json_decode(file_get_contents('php://input'), true);
    $visitorId = $_GET['id'] ?? '';
    $newStatus = $input['status'] ?? '';
    
    if (empty($visitorId) || empty($newStatus)) {
        sendResponse(false, null, 'ID du visiteur et nouveau statut requis');
    }
    
    $allowedStatuses = ['En attente', 'Reçu', 'Terminé'];
    if (!in_array($newStatus, $allowedStatuses)) {
        sendResponse(false, null, 'Statut invalide');
    }
    
    try {
        $stmt = $pdo->prepare("
            UPDATE visitors 
            SET statut = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$newStatus, $visitorId]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(true, null, 'Statut mis à jour avec succès');
        } else {
            sendResponse(false, null, 'Visiteur non trouvé');
        }
        
    } catch (Exception $e) {
        sendResponse(false, null, 'Erreur lors de la mise à jour du statut: ' . $e->getMessage());
    }
}
?>
