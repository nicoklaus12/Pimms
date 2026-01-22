// Logique de la page Admin avec API
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initialisation de la page admin (API)...');

    // Vérifier l'authentification
    if (!window.apiClient.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    if (!window.apiClient.canAccess('admin')) {
        alert('Vous n\'avez pas les droits pour accéder à cette page');
        window.location.href = 'index.html';
        return;
    }

    const currentUser = window.apiClient.getCurrentUser();
    updateUserInfo(currentUser);

    // Charger les utilisateurs
    await loadUsers();

    // Configurer les événements
    setupEventListeners();

    console.log('Page admin (API) initialisée avec succès');
});

function updateUserInfo(user) {
    document.getElementById('userInfo').textContent = user.username;
}

function setupEventListeners() {
    document.getElementById('newUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createUser();
    });
}

async function loadUsers() {
    try {
        const result = await window.apiClient.getUsers();
        if (result.success) {
            window.users = result.data;
            renderUsersTable();
        } else {
            console.error('Erreur lors du chargement:', result.message);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    if (window.users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Aucun utilisateur trouvé</td></tr>';
        return;
    }

    const currentUser = window.apiClient.getCurrentUser();

    window.users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>
                <span class="badge ${getRoleBadgeClass(user.role)}">${getRoleDisplayName(user.role)}</span>
            </td>
            <td>
                <span class="badge bg-success">Actif</span>
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})" ${user.id === currentUser.id ? 'disabled' : ''}>
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getRoleBadgeClass(role) {
    switch (role) {
        case 'admin': return 'bg-danger';
        case 'accueil': return 'bg-primary';
        case 'mediateur': return 'bg-info';
        default: return 'bg-secondary';
    }
}

function getRoleDisplayName(role) {
    switch (role) {
        case 'admin': return 'Administrateur';
        case 'accueil': return 'Accueil';
        case 'mediateur': return 'Médiateur';
        default: return role;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function createUser() {
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;

    if (!username || !password || !role) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    try {
        const result = await window.apiClient.addUser({
            username: username,
            password: password,
            role: role
        });

        if (result.success) {
            alert('Utilisateur créé avec succès');
            const modal = bootstrap.Modal.getInstance(document.getElementById('newUserModal'));
            modal.hide();
            document.getElementById('newUserForm').reset();
            await loadUsers();
        } else {
            alert(result.message || 'Erreur lors de la création de l\'utilisateur');
        }
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        alert('Erreur lors de la création de l\'utilisateur: ' + error.message);
    }
}

async function deleteUser(id) {
    const currentUser = window.apiClient.getCurrentUser();
    if (id === currentUser.id) {
        alert('Vous ne pouvez pas supprimer votre propre compte');
        return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
    }

    try {
        const result = await window.apiClient.deleteUser(id);
        if (result.success) {
            alert('Utilisateur supprimé avec succès');
            await loadUsers();
        } else {
            alert(result.message || 'Erreur lors de la suppression de l\'utilisateur');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        alert('Erreur lors de la suppression de l\'utilisateur: ' + error.message);
    }
}

function logout() {
    window.apiClient.logout();
    window.location.href = 'index.html';
}
