/* ==================== SECURE ADMIN DASHBOARD ==================== */

// Appwrite SDK is loaded from admin.html: window.Appwrite
// Assumes js/appwrite.js already initialized: const account = new Appwrite.Account(client);

let adminUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = await checkAdminLogin();
    
    if (isLoggedIn) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
        setupAdminDashboard();
    } else {
        setupLoginForm();
    }
});

// Check Admin Login - Uses real Appwrite session
async function checkAdminLogin() {
    try {
        const user = await account.get(); // Throws error if no session
        adminUser = user;
        // Optional: Check if user is in admin team
        // const teams = await teams.list(); 
        // if (!teams.teams.some(t => t.$id === 'ADMIN_TEAM_ID')) throw new Error('Not admin');
        return true;
    } catch {
        adminUser = null;
        return false;
    }
}

// Setup Login Form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
}

// Handle Admin Login - Real Appwrite Auth
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    
    loginError.style.display = 'none';
    
    try {
        await account.createEmailSession(email, password);
        window.location.reload();
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'Invalid email or password: ' + error.message;
        loginError.style.display = 'block';
    }
}

// Middleware: Verify admin before any action
async function requireAdmin() {
    const isAdmin = await checkAdminLogin();
    if (!isAdmin) {
        alert('Session expired. Please log in again.');
        window.location.href = 'admin.html';
        throw new Error('Unauthorized');
    }
    return adminUser;
}

// Setup Admin Dashboard
function setupAdminDashboard() {
    if (adminUser) {
        document.getElementById('adminUser').textContent = adminUser.email;
    }
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.getAttribute('onclick').match(/showTab\('([^']+)'\)/)[1];
            showTab(tab);
        });
    });
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleAdminLogout);
    }
    
    showTab('dashboard');
    
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleArticleUpdate);
    }
}

// Show Tab
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.classList.add('active');
        document.querySelector(`[onclick*="${tabName}"]`)?.classList.add('active');
    }
    
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'pending':
            loadPendingArticles();
            break;
        case 'published': // Changed from 'approved'
            loadPublishedArticles(); // Changed from loadApprovedArticles
            break;
        case 'rejected':
            loadRejectedArticles();
            break;
        case 'categories':
            loadCategories();
            break;
    }
}

// Load Dashboard - FIXED
async function loadDashboard() {
    try {
        await requireAdmin();
        const stats = await getArticleStatistics();
        
        document.getElementById('totalArticles').textContent = stats.total;
        document.getElementById('pendingCount').textContent = stats