// Authentification et gestion des utilisateurs
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initUsers();
    }

    initUsers() {
        // Initialiser les utilisateurs par défaut si pas encore créés
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                { id: 1, username: 'admin', password: 'admin', role: 'admin', isActive: true },
                { id: 2, username: 'accueil', password: 'accueil', role: 'accueil', isActive: true },
                { id: 3, username: 'mediateur', password: 'mediateur', role: 'mediateur', isActive: true }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
    }

    login(username, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password && u.isActive);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        }
        return null;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                try {
                    this.currentUser = JSON.parse(stored);
                } catch (e) {
                    console.error('Erreur lors du parsing de currentUser:', e);
                    localStorage.removeItem('currentUser');
                }
            }
        }
        return this.currentUser;
    }

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    }

    canAccess(requiredRole) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        // Admin peut tout
        if (user.role === 'admin') return true;
        
        // Vérifier le rôle requis
        return user.role === requiredRole;
    }
}

// Instances globales
const authManager = new AuthManager();

// Gestion de la connexion
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const user = authManager.login(username, password);
            
            if (user) {
                // Rediriger selon le rôle
                switch(user.role) {
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
                        alert('Rôle non reconnu');
                }
            } else {
                alert('Identifiants incorrects');
            }
        });
    }
});

// Fonction globale pour vérifier l'auth au chargement de chaque page
function checkAuthOnPageLoad() {
    console.log('Vérification de l\'authentification...');
    console.log('Utilisateur actuel:', authManager.getCurrentUser());
    console.log('Est connecté:', authManager.isLoggedIn());
    
    // Forcer la récupération de l'utilisateur depuis localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            authManager.currentUser = user;
            console.log('Utilisateur restauré depuis localStorage:', user);
        } catch (e) {
            console.error('Erreur lors de la restauration de l\'utilisateur:', e);
            localStorage.removeItem('currentUser');
        }
    }
}
