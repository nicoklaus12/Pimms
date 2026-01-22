// Logique de la page Accueil avec API
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation de la page accueil (API)...');

    // Vérifier l'authentification
    if (!window.apiClient.isLoggedIn()) {
        console.log('❌ Pas connecté, redirection vers index.html');
        window.location.href = 'index.html';
        return;
    }

    if (!window.apiClient.canAccess('accueil')) {
        console.log('❌ Pas les droits pour cette page');
        alert('Vous n\'avez pas les droits pour accéder à cette page');
        window.location.href = 'index.html';
        return;
    }

    const currentUser = window.apiClient.getCurrentUser();
    console.log('✅ Utilisateur connecté:', currentUser);
    updateUserInfo(currentUser);

    // Charger les visiteurs
    console.log('📥 Chargement des visiteurs...');
    await loadVisitors();

    // Configurer les événements
    setupEventListeners();

    // Actualisation automatique toutes les 3 secondes
    setInterval(async () => {
        console.log('🔄 Actualisation automatique...');
        await loadVisitors();
    }, 3000);

    console.log('✅ Page accueil (API) initialisée avec succès');
});

function updateUserInfo(user) {
    document.getElementById('userInfo').textContent = user.username;
}

function setupEventListeners() {
    document.getElementById('visitorForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('statusFilter').addEventListener('change', handleStatusFilter);
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const nomEl = document.getElementById('nom');
    const prenomEl = document.getElementById('prenom');
    const sexeEl = document.getElementById('sexe');
    const motifEl = document.getElementById('motif');
    const prioriteEl = document.getElementById('priorite');
    const heureRdvEl = document.getElementById('heure_rdv');

    if (!nomEl || !prenomEl || !sexeEl || !motifEl) {
        alert('Erreur: éléments du formulaire manquants');
        return;
    }

    const formData = {
        nom: nomEl.value.trim(),
        prenom: prenomEl.value.trim(),
        sexe: sexeEl.value,
        motif: motifEl.value.trim(),
        priorite: prioriteEl ? prioriteEl.value : '',
        heure_rdv: heureRdvEl ? heureRdvEl.value : ''
    };

    console.log('Données du formulaire:', formData);

    if (!formData.nom || !formData.prenom || !formData.sexe || !formData.motif) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    try {
        if (window.editingVisitorId) {
            const result = await window.apiClient.updateVisitor(window.editingVisitorId, formData);
            if (result.success) {
                alert('Visiteur mis à jour avec succès');
                window.editingVisitorId = null;
            } else {
                alert(result.message || 'Erreur lors de la mise à jour');
                return;
            }
        } else {
            const result = await window.apiClient.addVisitor(formData);
            console.log('Résultat de l\'ajout:', result);
            
            if (result.success) {
                const visitor = result.data;
                alert(`Visiteur ${visitor.nom} ${visitor.prenom} enregistré avec le numéro ${visitor.numero_suivi}`);
            } else {
                alert(result.message || 'Erreur lors de l\'enregistrement');
                return;
            }
        }
        document.getElementById('visitorForm').reset();
        // Recharger immédiatement pour voir le nouveau visiteur
        await loadVisitors();
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        alert('Erreur lors de l\'enregistrement: ' + error.message);
    }
}

async function loadVisitors() {
    try {
        console.log('📥 Appel API getVisitors...');
        const result = await window.apiClient.getVisitors();
        console.log('✅ Réponse API reçue:', result);
        console.log('📊 Données:', result.data);
        
        if (result.success && result.data) {
            console.log('✅ Données valides, nombre de visiteurs:', result.data.length);
            
            // Trier les visiteurs par priorité - FORCÉ pour garantir l'ordre
            const sortedVisitors = result.data.sort((a, b) => {
                // Priorité : EDF > ENGIE > RDV > Aucune
                const priorityOrder = { 'EDF': 1, 'ENGIE': 2, 'RDV': 3, '': 4, null: 4, undefined: 4 };
                const priorityA = priorityOrder[a.priorite] || 4;
                const priorityB = priorityOrder[b.priorite] || 4;
                
                if (priorityA !== priorityB) return priorityA - priorityB;
                return (a.numero_suivi || 0) - (b.numero_suivi || 0);
            });
            
            console.log('🔄 Visiteurs triés:', sortedVisitors);
            console.log('🎯 Nombre de visiteurs après tri:', sortedVisitors.length);
            
            window.visitors = sortedVisitors;
            applyFiltersAndRender();
            
            console.log('✅ Affichage terminé');
        } else {
            console.error('❌ Pas de données dans la réponse:', result);
            alert('Erreur: ' + (result.message || 'Pas de données'));
        }
    } catch (error) {
        console.error('❌ Erreur complète:', error);
        console.error('❌ Stack trace:', error.stack);
        alert('Erreur: ' + error.message);
    }
}

function applyFiltersAndRender() {
    // Les visiteurs sont déjà triés par priorité depuis loadVisitors()
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

    // Si un filtre est actif, re-trier pour maintenir la priorité
    if (query || status !== 'Tous') {
        currentVisitors.sort((a, b) => {
            const priorityOrder = { 'EDF': 1, 'ENGIE': 2, 'RDV': 3, '': 4 };
            const priorityA = priorityOrder[a.priorite] || 4;
            const priorityB = priorityOrder[b.priorite] || 4;
            
            if (priorityA !== priorityB) return priorityA - priorityB;
            return a.numero_suivi - b.numero_suivi;
        });
    }

    window.filteredVisitors = currentVisitors;
    renderVisitorsTable();
}

function renderVisitorsTable() {
    const tbody = document.getElementById('visitorsTableBody');
    tbody.innerHTML = '';

    // Afficher l'heure de dernière mise à jour
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        const now = new Date();
        lastUpdateElement.textContent = `Dernière MAJ: ${now.toLocaleTimeString()}`;
    }

    if (window.filteredVisitors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Aucun visiteur trouvé</td></tr>';
        return;
    }

    window.filteredVisitors.forEach(visitor => {
        const row = document.createElement('tr');
        
        // Mettre en surbrillance selon la priorité
        const priorite = visitor.priorite || '';
        if (priorite === 'EDF') {
            row.className = 'table-danger'; // Rouge pour EDF
            row.style.fontWeight = 'bold';
        } else if (priorite === 'ENGIE') {
            row.className = 'table-warning'; // Jaune pour ENGIE
        } else if (priorite === 'RDV') {
            row.className = 'table-info'; // Bleu clair pour RDV
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
                ${getVisitorActions(visitor)}
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

function getVisitorActions(visitor) {
    const currentUser = window.apiClient.getCurrentUser();
    const actions = getAvailableActions(visitor, currentUser.role);
    let html = '';

    actions.forEach(action => {
        switch (action) {
            case 'Modifier':
                html += `<button class="btn btn-sm btn-outline-primary me-1" onclick="editVisitor(${visitor.id})">
                    <i class="bi bi-pencil"></i>
                </button>`;
                break;
            case 'Supprimer':
                html += `<button class="btn btn-sm btn-outline-danger me-1" onclick="deleteVisitor(${visitor.id})">
                    <i class="bi bi-trash"></i>
                </button>`;
                break;
            case 'Marquer Reçu':
                html += `<button class="btn btn-sm btn-outline-info me-1" onclick="updateVisitorStatus(${visitor.id}, 'Reçu')">
                    <i class="bi bi-check-circle"></i>
                </button>`;
                break;
            case 'Marquer Terminé':
                html += `<button class="btn btn-sm btn-outline-success me-1" onclick="updateVisitorStatus(${visitor.id}, 'Terminé')">
                    <i class="bi bi-check2-circle"></i>
                </button>`;
                break;
                case 'Marquer En attente':
                    html += `<button class="btn btn-sm btn-outline-warning me-1" onclick="updateVisitorStatus(${visitor.id}, 'En attente')">
                        <i class="bi bi-clock"></i>
                    </button>`;
                    break;
        }
    });
    return html;
}

function getAvailableActions(visitor, role) {
    const actions = [];
    // Accueil a tous les droits
    if (role === 'accueil' || role === 'admin') {
        actions.push('Modifier', 'Supprimer');
        // Toutes les actions de changement de statut
        if (visitor.statut === 'En attente') {
            actions.push('Marquer Reçu', 'Marquer Terminé');
        }
        if (visitor.statut === 'Reçu') {
            actions.push('Marquer En attente', 'Marquer Terminé');
        }
        if (visitor.statut === 'Terminé') {
            actions.push('Marquer En attente', 'Marquer Reçu');
        }
    } else if (role === 'mediateur') {
        if (visitor.statut === 'En attente' || visitor.statut === 'Reçu') {
            actions.push('Marquer Terminé');
        }
    }
    return actions;
}

function editVisitor(id) {
    const visitor = window.visitors.find(v => v.id === id);
    if (!visitor) return;

    window.editingVisitorId = id;

    const nomEl = document.getElementById('nom');
    const prenomEl = document.getElementById('prenom');
    const sexeEl = document.getElementById('sexe');
    const motifEl = document.getElementById('motif');
    const prioriteEl = document.getElementById('priorite');
    const heureRdvEl = document.getElementById('heure_rdv');
    
    if (nomEl) nomEl.value = visitor.nom;
    if (prenomEl) prenomEl.value = visitor.prenom;
    if (sexeEl) sexeEl.value = visitor.sexe;
    if (motifEl) motifEl.value = visitor.motif;
    if (prioriteEl) prioriteEl.value = visitor.priorite || '';
    if (heureRdvEl) heureRdvEl.value = visitor.heure_rdv || '';

    document.getElementById('visitorForm').scrollIntoView({ behavior: 'smooth' });
}

async function deleteVisitor(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce visiteur ?')) {
        return;
    }
    try {
        const result = await window.apiClient.deleteVisitor(id);
        if (result.success) {
            alert('Visiteur supprimé avec succès');
            await loadVisitors();
        } else {
            alert(result.message || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression: ' + error.message);
    }
}

async function updateVisitorStatus(id, newStatus) {
    try {
        const result = await window.apiClient.updateVisitorStatus(id, newStatus);
        if (result.success) {
            alert(`Statut mis à jour: ${newStatus}`);
            await loadVisitors();
        } else {
            alert(result.message || 'Erreur lors de la mise à jour du statut');
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        alert('Erreur lors de la mise à jour du statut: ' + error.message);
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
