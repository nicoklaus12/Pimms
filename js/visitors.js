// Gestion des visiteurs
class VisitorManager {
    constructor() {
        this.visitors = this.loadVisitors();
        this.nextTrackingNumber = this.getNextTrackingNumber();
    }

    loadVisitors() {
        const stored = localStorage.getItem('visitors');
        return stored ? JSON.parse(stored) : [];
    }

    saveVisitors() {
        localStorage.setItem('visitors', JSON.stringify(this.visitors));
    }

    getNextTrackingNumber() {
        if (this.visitors.length === 0) return 1;
        return Math.max(...this.visitors.map(v => v.trackingNumber)) + 1;
    }

    addVisitor(visitorData) {
        const visitor = {
            id: Date.now(),
            trackingNumber: this.nextTrackingNumber++,
            nom: visitorData.nom.toUpperCase(),
            prenom: visitorData.prenom,
            sexe: visitorData.sexe,
            motif: visitorData.motif,
            rdv: visitorData.rdv || false,
            status: 'En attente',
            createdAt: new Date().toLocaleString(),
            createdBy: authManager.getCurrentUser()?.username || 'system'
        };

        this.visitors.unshift(visitor);
        this.saveVisitors();
        return visitor;
    }

    updateVisitor(id, updates) {
        const index = this.visitors.findIndex(v => v.id === id);
        if (index !== -1) {
            this.visitors[index] = { ...this.visitors[index], ...updates };
            this.saveVisitors();
            return this.visitors[index];
        }
        return null;
    }

    deleteVisitor(id) {
        const index = this.visitors.findIndex(v => v.id === id);
        if (index !== -1) {
            this.visitors.splice(index, 1);
            this.saveVisitors();
            return true;
        }
        return false;
    }

    getVisitors() {
        return this.visitors;
    }

    searchVisitors(term) {
        if (!term) return this.visitors;
        
        const searchTerm = term.toLowerCase();
        return this.visitors.filter(visitor => 
            visitor.nom.toLowerCase().includes(searchTerm) ||
            visitor.prenom.toLowerCase().includes(searchTerm) ||
            visitor.motif.toLowerCase().includes(searchTerm)
        );
    }

    filterByStatus(status) {
        if (status === 'Tous') return this.visitors;
        return this.visitors.filter(visitor => visitor.status === status);
    }
}

// Instance globale
const visitorManager = new VisitorManager();

// Fonctions utilitaires
function formatStatusBadge(status) {
    const badges = {
        'En attente': 'badge-attente',
        'Reçu': 'badge-recu',
        'Fait': 'badge-fait'
    };
    
    return `<span class="badge ${badges[status] || 'badge-secondary'}">${status}</span>`;
}

function formatRdvBadge(hasRdv) {
    return hasRdv ? '<span class="badge badge-rdv">RDV</span>' : '<span class="text-muted">-</span>';
}

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
                    <select class="form-select form-select-sm" onchange="updateVisitorStatus(${visitor.id}, this.value)" style="width: auto;">
                        <option value="En attente" ${visitor.status === 'En attente' ? 'selected' : ''}>En attente</option>
                        <option value="Reçu" ${visitor.status === 'Reçu' ? 'selected' : ''}>Reçu</option>
                        <option value="Fait" ${visitor.status === 'Fait' ? 'selected' : ''}>Fait</option>
                    </select>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteVisitor(${visitor.id})" title="Supprimer">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateVisitorStatus(id, newStatus) {
    visitorManager.updateVisitor(id, { status: newStatus });
    refreshVisitorsTable();
}

function deleteVisitor(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce visiteur ?')) {
        visitorManager.deleteVisitor(id);
        refreshVisitorsTable();
    }
}

function refreshVisitorsTable() {
    const searchTerm = document.getElementById('searchInput')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'Tous';
    
    let visitors = visitorManager.getVisitors();
    
    if (searchTerm) {
        visitors = visitorManager.searchVisitors(searchTerm);
    }
    
    if (statusFilter !== 'Tous') {
        visitors = visitors.filter(v => v.status === statusFilter);
    }
    
    renderVisitorsTable(visitors);
}

// Fonction de déconnexion
function logout() {
    authManager.logout();
    window.location.href = 'index.html';
}

