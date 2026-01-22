// Script spécifique à la page Accueil
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page Accueil chargée');
    
    // Vérifier et restaurer l'authentification
    checkAuthOnPageLoad();
    
    console.log('Utilisateur connecté après vérification:', authManager.getCurrentUser());
    
    // Vérifier l'authentification
    if (!authManager.isLoggedIn()) {
        console.log('Utilisateur non connecté, redirection vers login');
        window.location.href = 'index.html';
        return;
    }
    
    if (!authManager.canAccess('accueil')) {
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

    // Gestion du formulaire d'enregistrement
    const visitorForm = document.getElementById('visitorForm');
    if (visitorForm) {
        visitorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                nom: document.getElementById('nom').value,
                prenom: document.getElementById('prenom').value,
                sexe: document.getElementById('sexe').value,
                motif: document.getElementById('motif').value,
                rdv: document.getElementById('rdv').checked
            };

            // Validation
            if (!formData.nom || !formData.prenom || !formData.sexe || !formData.motif) {
                alert('Veuillez remplir tous les champs obligatoires');
                return;
            }

            // Ajouter le visiteur
            const newVisitor = visitorManager.addVisitor(formData);
            
            // Réinitialiser le formulaire
            visitorForm.reset();
            
            // Rafraîchir la table
            refreshVisitorsTable();
            
            // Afficher un message de succès
            showSuccessMessage(`Visiteur ${newVisitor.nom} ${newVisitor.prenom} enregistré avec le numéro ${newVisitor.trackingNumber}`);
        });
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
