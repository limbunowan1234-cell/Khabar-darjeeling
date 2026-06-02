/* ==================== SECURE ADMIN DASHBOARD ==================== */

// FIX FOR CLOUDFLARE - get from window (no imports)
const account = window.account;
const database = window.database;
const storage = window.storage;
const { Query } = window.Appwrite;

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
        const user = await account.get();
        adminUser = user;
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
    const loginBtn = e.target.querySelector('button[type="submit"]');

    loginError.style.display = 'none';
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;

    try {
        await account.createEmailPasswordSession(email, password);
        window.location.reload();
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'Invalid email or password: ' + error.message;
        loginError.style.display = 'block';
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
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
            const onclick = item.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/showTab\('([^']+)'\)/);
                if (match) showTab(match[1]);
            }
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

// Handle Logout
async function handleAdminLogout() {
    try {
        await account.deleteSession('current');
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
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
        case 'published':
            loadPublishedArticles();
            break;
        case 'rejected':
            loadRejectedArticles();
            break;
        case 'categories':
            loadCategories();
            break;
    }
}

// Load Dashboard
async function loadDashboard() {
    try {
        await requireAdmin();
        const stats = await getArticleStatistics();

        document.getElementById('totalArticles').textContent = stats.total;
        document.getElementById('pendingCount').textContent = stats.pending;
        document.getElementById('publishedCount').textContent = stats.approved;
        document.getElementById('rejectedCount').textContent = stats.rejected;
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

// Get Article Statistics
async function getArticleStatistics() {
    try {
        const totalResponse = await database.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, [Query.limit(1)]);
        const pendingResponse = await database.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, [
            Query.equal('status', 'pending'),
            Query.limit(1)
        ]);
        const approvedResponse = await database.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, [
            Query.equal('status', 'published'),
            Query.limit(1)
        ]);
        const rejectedResponse = await database.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, [
            Query.equal('status', 'rejected'),
            Query.limit(1)
        ]);

        return {
            total: totalResponse.total,
            pending: pendingResponse.total,
            approved: approvedResponse.total,
            rejected: rejectedResponse.total
        };
    } catch (error) {
        console.error('Failed to get statistics:', error);
        return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
}

// Placeholder functions - add your existing code below
async function loadPendingArticles() { console.log('Loading pending...'); }
async function loadPublishedArticles() { console.log('Loading published...'); }
async function loadRejectedArticles() { console.log('Loading rejected...'); }
async function loadCategories() { console.log('Loading categories...'); }
async function handleArticleUpdate(e) { e.preventDefault(); console.log('Update article...'); }
