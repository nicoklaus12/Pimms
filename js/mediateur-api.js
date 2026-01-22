// Logique de la page Médiateur avec API
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initialisation de la page médiateur (API)...');

    // Vérifier l'authentification
    if (!window.apiClient.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    if (!window.apiClient.canAccess('mediateur')) {
        alert('Vous n\'avez pas les droits pour accéder à cette page');
        window.location.href = 'index.html';
        return;
    }

    const currentUser = window.apiClient.getCurrentUser();
    updateUserInfo(currentUser);

    // Charger les visiteurs
    await loadVisitors();

    // Configurer les événements
    setupEventListeners();

    // Actualisation automatique toutes les 3 secondes
    setInterval(loadVisitors, 3000);

    console.log('Page médiateur (API) initialisée avec succès');
});

function updateUserInfo(user) {
    document.getElementById('userInfo').textContent = user.username;
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('statusFilter').addEventListener('change', handleStatusFilter);
}

async function loadVisitors() {
    try {
        const result = await window.apiClient.getVisitors();
        if (result.success) {
            // Tri: EDF > ENGIE > RDV > Aucune, puis numero_suivi
            const sorted = (result.data || []).sort((a, b) => {
                const priorityOrder = { 'EDF': 1, 'ENGIE': 2, 'RDV': 3, '': 4, null: 4, undefined: 4 };
                const pa = priorityOrder[a.priorite] || 4;
                const pb = priorityOrder[b.priorite] || 4;
                if (pa !== pb) return pa - pb;
                return (a.numero_suivi || 0) - (b.numero_suivi || 0);
            });
            window.visitors = sorted;
            applyFiltersAndRender();
        } else {
            console.error('Erreur lors du chargement:', result.message);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des visiteurs:', error);
    }
}

function applyFiltersAndRender() {
    let currentVisitors = [...window.visitors];

    const query = document.getElementById('searchInput').value.toLowerCase();
    if (query) {
        currentVisitors = currentVisitors.filter(visitor =>
            visitor.nom.toLowerCase().includes(query) ||
            visitor.prenom.toLowerCase().includes(query) ||
            visitor.motif.toLowerCase().includes(query) ||
            (visitor.numero_suivi && visitor.numero_suivi.toString().includes(query))
        );
    }

    const status = document.getElementById('statusFilter').value;
    if (status !== 'Tous') {
        currentVisitors = currentVisitors.filter(v => v.statut === status);
    }

    window.filteredVisitors = currentVisitors;
    renderVisitorsTable();
}

function renderVisitorsTable() {
    const tbody = document.getElementById('visitorsTableBody');
    tbody.innerHTML = '';

    if (window.filteredVisitors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Aucun visiteur trouvé</td></tr>';
        return;
    }

    window.filteredVisitors.forEach(visitor => {
        const row = document.createElement('tr');
        // Mise en évidence selon la priorité
        const p = visitor.priorite || '';
        if (p === 'EDF') {
            row.className = 'table-danger';
            row.style.fontWeight = 'bold';
        } else if (p === 'ENGIE') {
            row.className = 'table-warning';
        } else if (p === 'RDV') {
            row.className = 'table-info';
        }

        const prioriteBadge = getPrioriteBadge(visitor.priorite);

        row.innerHTML = `
            <td>${prioriteBadge}</td>
            <td>${visitor.heure_rdv || ''}</td>
            <td><strong>${visitor.nom}</strong></td>
            <td>${visitor.prenom}</td>
            <td>${visitor.sexe}</td>
            <td>${visitor.motif}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(visitor.statut)}">${visitor.statut}</span>
            </td>
            <td>
                ${getMediateurActions(visitor)}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'En attente': return 'bg-warning';
        case 'Reçu': return 'bg-info';
        case 'Terminé': return 'bg-success';
        default: return 'bg-secondary';
    }
}

function getPrioriteBadge(priorite) {
    switch (priorite) {
        case 'EDF':
            return '<span class="badge bg-danger"><i class="bi bi-lightning-charge-fill"></i> EDF</span>';
        case 'ENGIE':
            return '<span class="badge bg-warning"><i class="bi bi-fire"></i> ENGIE</span>';
        case 'RDV':
            return '<span class="badge bg-primary"><i class="bi bi-calendar-check"></i> RDV</span>';
        default:
            return '';
    }
}

function getMediateurActions(visitor) {
    const currentUser = window.apiClient.getCurrentUser();
    const actions = getAvailableActions(visitor, currentUser.role);
    let html = '';

    actions.forEach(action => {
        switch (action) {
            case 'Marquer Reçu':
                html += `<button class="btn btn-sm btn-outline-info me-1" onclick="updateVisitorStatus(${visitor.id}, 'Reçu')" title="Marquer comme Reçu">
                    <i class="bi bi-check-circle"></i>
                </button>`;
                break;
            case 'Marquer Terminé':
                html += `<button class="btn btn-sm btn-outline-success me-1" onclick="updateVisitorStatus(${visitor.id}, 'Terminé')" title="Marquer comme Terminé">
                    <i class="bi bi-check2-circle"></i>
                </button>`;
                break;
        }
    });
    return html;
}

function getAvailableActions(visitor, role) {
    const actions = [];
    if (role === 'mediateur') {
        // Les médiateurs peuvent marquer "Reçu" quand le statut est "En attente"
        if (visitor.statut === 'En attente') {
            actions.push('Marquer Reçu', 'Marquer Terminé');
        }
        // Les médiateurs peuvent marquer "Terminé" quand le statut est "Reçu"
        if (visitor.statut === 'Reçu') {
            actions.push('Marquer Terminé');
        }
    }
    return actions;
}

async function updateVisitorStatus(id, newStatus) {
    try {
        const result = await window.apiClient.updateVisitorStatus(id, newStatus);
        if (result.success) {
            alert(`Statut mis à jour: ${newStatus}`);
            await loadVisitors();
        } else {
            alert(result.message || 'Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        alert('Erreur lors de la mise à jour: ' + error.message);
    }
}

function handleSearch() {
    applyFiltersAndRender();
}

function handleStatusFilter() {
    applyFiltersAndRender();
}

function logout() {
    window.apiClient.logout();
    window.location.href = 'index.html';
}
