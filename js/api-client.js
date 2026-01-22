// Client API pour communiquer avec le backend PHP
class ApiClient {
    constructor() {
        this.baseUrl = 'api/';
        this.sessionToken = localStorage.getItem('session_token');
    }

    // Méthode générique pour les requêtes
    async request(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const config = { ...defaultOptions, ...options };
        
        try {
            console.log('API request to:', url, 'with config:', config);
            const response = await fetch(url, config);
            
            // Vérifier si c'est du JSON
            const text = await response.text();
            console.log('API raw response:', text);
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error('Réponse non JSON: ' + text.substring(0, 200));
            }
            
            console.log('API parsed response:', data);
            
            if (!data.success) {
                throw new Error(data.message || 'Erreur API');
            }
            
            return data;
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }

    // Authentification
    async login(username, password) {
        const data = await this.request('auth.php?action=login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (data.success) {
            this.sessionToken = data.data.session_token;
            localStorage.setItem('session_token', this.sessionToken);
            localStorage.setItem('current_user', JSON.stringify({
                id: data.data.id,
                username: data.data.username,
                role: data.data.role
            }));
        }
        
        return data;
    }

    async logout() {
        if (this.sessionToken) {
            try {
                await this.request(`auth.php?action=logout&token=${this.sessionToken}`, {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
            }
        }
        
        this.sessionToken = null;
        localStorage.removeItem('session_token');
        localStorage.removeItem('current_user');
    }

    async verifySession() {
        if (!this.sessionToken) {
            return { success: false, message: 'Aucune session active' };
        }
        
        try {
            return await this.request(`auth.php?action=verify&token=${this.sessionToken}`);
        } catch (error) {
            this.logout();
            return { success: false, message: 'Session expirée' };
        }
    }

    // Gestion des visiteurs
    async getVisitors() {
        const result = await this.request(`visitors.php?action=list&token=${this.sessionToken}`);
        console.log('API getVisitors result:', result);
        return result;
    }

    async addVisitor(visitorData) {
        console.log('API addVisitor sending:', visitorData);
        const result = await this.request(`visitors.php?action=add&token=${this.sessionToken}`, {
            method: 'POST',
            body: JSON.stringify(visitorData)
        });
        console.log('API addVisitor result:', result);
        return result;
    }

    async updateVisitor(id, visitorData) {
        return await this.request(`visitors.php?action=update&id=${id}&token=${this.sessionToken}`, {
            method: 'PUT',
            body: JSON.stringify(visitorData)
        });
    }

    async deleteVisitor(id) {
        return await this.request(`visitors.php?action=delete&id=${id}&token=${this.sessionToken}`, {
            method: 'DELETE'
        });
    }

    async updateVisitorStatus(id, status) {
        return await this.request(`visitors.php?action=update_status&id=${id}&token=${this.sessionToken}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Gestion des utilisateurs (Admin)
    async getUsers() {
        return await this.request(`users.php?action=list&token=${this.sessionToken}`);
    }

    async addUser(userData) {
        return await this.request(`users.php?action=add&token=${this.sessionToken}`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(id) {
        return await this.request(`users.php?action=delete&id=${id}&token=${this.sessionToken}`, {
            method: 'DELETE'
        });
    }

    // Utilitaires
    getCurrentUser() {
        const user = localStorage.getItem('current_user');
        return user ? JSON.parse(user) : null;
    }

    isLoggedIn() {
        return this.sessionToken !== null && this.getCurrentUser() !== null;
    }

    canAccess(requiredRole) {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (user.role === 'admin') return true;
        return user.role === requiredRole;
    }

    redirectToRolePage() {
        const user = this.getCurrentUser();
        if (user) {
            switch (user.role) {
                case 'admin':
                    window.location.href = 'admin.html';
                    break;
                case 'accueil':
                    window.location.href = 'accueil.html';
                    break;
                case 'mediateur':
                    window.location.href = 'mediateur.html';
                    break;
                default:
                    window.location.href = 'index.html';
            }
        } else {
            window.location.href = 'index.html';
        }
    }
}

// Instance globale
window.apiClient = new ApiClient();
