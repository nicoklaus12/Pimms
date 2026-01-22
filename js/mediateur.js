// Script spécifique à la page Médiateur
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page Médiateur chargée');
    
    // Vérifier et restaurer l'authentification
    checkAuthOnPageLoad();
    
    console.log('Utilisateur connecté après vérification:', authManager.getCurrentUser());
    
    // Vérifier l'authentification
    if (!authManager.isLoggedIn()) {
        console.log('Utilisateur non connecté, redirection vers login');
        window.location.href = 'index.html';
        return;
    }
    
    if (!authManager.canAccess('mediateur')) {
        console.log('Accès refusé pour ce rôle');
        alert('Vous n\'avez pas les droits pour accéder à cette page');
        window.location.href = 'index.html';
        return;
    }

    // Afficher les informations utilisateur
    const user = authManager.getCurrentUser();
    if (user) {
        document.getElementById('userInfo').textContent = user.username;
    }

    // Gestion de la recherche
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', refreshVisitorsTable);
    }

    // Gestion du filtre de statut
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', refreshVisitorsTable);
    }

    // Charger la table initiale
    refreshVisitorsTable();
});

// Fonction de déconnexion
function logout() {
    authManager.logout();
    window.location.href = 'index.html';
}

// Override de la fonction renderVisitorsTable pour le médiateur
function renderVisitorsTable(visitors) {
    const tbody = document.getElementById('visitorsTableBody');
    if (!tbody) return;

    if (visitors.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="bi bi-inbox me-2"></i>Aucun visiteur trouvé
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = visitors.map(visitor => `
        <tr>
            <td class="fw-mono">${visitor.trackingNumber}</td>
            <td>${formatRdvBadge(visitor.rdv)}</td>
            <td class="fw-bold">${visitor.nom}</td>
            <td>${visitor.prenom}</td>
            <td>${visitor.sexe}</td>
            <td>${visitor.motif}</td>
            <td>${formatStatusBadge(visitor.status)}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    ${getMediateurActions(visitor)}
                </div>
            </td>
        </tr>
    `).join('');
}

function getMediateurActions(visitor) {
    switch(visitor.status) {
        case 'En attente':
            return `
                <button class="btn btn-success btn-sm" onclick="markAsDone(${visitor.id})">
                    <i class="bi bi-check2-circle me-1"></i>Marquer Fait
                </button>
            `;
        case 'Reçu':
            return `
                <button class="btn btn-success btn-sm" onclick="markAsDone(${visitor.id})">
                    <i class="bi bi-check2-circle me-1"></i>Marquer Fait
                </button>
            `;
        case 'Fait':
            return `
                <span class="badge bg-success">
                    <i class="bi bi-check2-circle me-1"></i>Terminé
                </span>
            `;
        default:
            return '<span class="text-muted">-</span>';
    }
}

function markAsDone(id) {
    visitorManager.updateVisitor(id, { status: 'Fait' });
    refreshVisitorsTable();
    showSuccessMessage('Visiteur marqué comme fait');
}

function showSuccessMessage(message) {
    // Créer une alerte Bootstrap temporaire
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Supprimer automatiquement après 3 secondes
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 3000);
}
