// Script spécifique à la page Admin
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page Admin chargée');
    
    // Vérifier et restaurer l'authentification
    checkAuthOnPageLoad();
    
    console.log('Utilisateur connecté après vérification:', authManager.getCurrentUser());
    
    // Vérifier l'authentification
    if (!authManager.isLoggedIn()) {
        console.log('Utilisateur non connecté, redirection vers login');
        window.location.href = 'index.html';
        return;
    }
    
    if (!authManager.canAccess('admin')) {
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

    // Charger la table des utilisateurs
    refreshUsersTable();
});

function refreshUsersTable() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-inbox me-2"></i>Aucun utilisateur trouvé
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td class="fw-bold">${user.username}</td>
            <td>
                <span class="badge ${getRoleBadgeClass(user.role)}">
                    ${getRoleLabel(user.role)}
                </span>
            </td>
            <td>
                <span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">
                    ${user.isActive ? 'Actif' : 'Inactif'}
                </span>
            </td>
            <td class="text-muted">${user.createdAt || 'N/A'}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-${user.isActive ? 'warning' : 'success'} btn-sm" 
                            onclick="toggleUser(${user.id})" 
                            title="${user.isActive ? 'Désactiver' : 'Activer'}">
                        <i class="bi bi-${user.isActive ? 'pause' : 'play'}-circle"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" 
                            onclick="deleteUser(${user.id})" 
                            title="Supprimer">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getRoleLabel(role) {
    const labels = {
        'admin': 'Administrateur',
        'accueil': 'Accueil',
        'mediateur': 'Médiateur'
    };
    return labels[role] || role;
}

function getRoleBadgeClass(role) {
    const classes = {
        'admin': 'bg-purple',
        'accueil': 'bg-primary',
        'mediateur': 'bg-success'
    };
    return classes[role] || 'bg-secondary';
}

function createUser() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;

    if (!username || !password || !role) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Vérifier si l'utilisateur existe déjà
    if (users.find(u => u.username === username)) {
        alert('Ce nom d\'utilisateur existe déjà');
        return;
    }

    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        role: role,
        isActive: true,
        createdAt: new Date().toLocaleDateString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Fermer le modal et réinitialiser le formulaire
    const modal = bootstrap.Modal.getInstance(document.getElementById('newUserModal'));
    modal.hide();
    document.getElementById('newUserForm').reset();

    // Rafraîchir la table
    refreshUsersTable();

    showSuccessMessage(`Utilisateur ${username} créé avec succès`);
}

function toggleUser(id) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === id);
    
    if (user) {
        user.isActive = !user.isActive;
        localStorage.setItem('users', JSON.stringify(users));
        refreshUsersTable();
        
        const action = user.isActive ? 'activé' : 'désactivé';
        showSuccessMessage(`Utilisateur ${action} avec succès`);
    }
}

function deleteUser(id) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === id);
    
    if (!user) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username} ?`)) {
        const updatedUsers = users.filter(u => u.id !== id);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        refreshUsersTable();
        showSuccessMessage(`Utilisateur ${user.username} supprimé avec succès`);
    }
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

// Fonction de déconnexion
function logout() {
    authManager.logout();
    window.location.href = 'index.html';
}
