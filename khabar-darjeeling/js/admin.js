/* ==================== SECURE ADMIN DASHBOARD ==================== */

// FIXED: No Query destructuring - use Appwrite.Query directly
const account = window.account;
const database = window.database;
const storage = window.storage;

let adminUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = await checkAdminLogin();

    if (isLoggedIn) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        setupAdminDashboard();
    } else {
        setupLoginForm();
    }
});

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

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
}

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

async function requireAdmin() {
    const isAdmin = await checkAdminLogin();
    if (!isAdmin) {
        alert('Session expired. Please log in again.');
        window.location.href = 'admin.html';
        throw new Error('Unauthorized');
    }
    return adminUser;
}

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

async function handleAdminLogout() {
    try {
        await account.deleteSession('current');
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

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

async function getArticleStatistics() {
    try {
        const totalResponse = await database.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, [Appwrite.Query.limit(1)]);
        const pendingResponse = await database.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, [
            Appwrite.Query.equal('status', 'pending'),
            Appwrite.Query.limit(1)
        ]);
        const approvedResponse = await database.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, [
            Appwrite.Query.equal('status', 'approved'),
            Appwrite.Query.limit(1)
        ]);
        const rejectedResponse = await database.listDocuments(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, [
            Appwrite.Query.equal('status', 'rejected'),
            Appwrite.Query.limit(1)
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

async function loadPendingArticles() {
    const container = document.getElementById('pendingArticlesList');
    if (!container) return;
    
    container.innerHTML = '<p>Loading...</p>';
    
    try {
        await requireAdmin();
        const response = await database.listDocuments(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            [
                Appwrite.Query.equal('status', 'pending'),
                Appwrite.Query.orderDesc('submittedAt'),
                Appwrite.Query.limit(50)
            ]
        );
        
        if (response.documents.length === 0) {
            container.innerHTML = '<p>No pending articles.</p>';
            return;
        }
        
        container.innerHTML = response.documents.map(article => `
            <div class="article-card">
                ${article.imageFileId? `<img src="${article.imageFileId}" alt="${article.title}" style="width:150px;height:100px;object-fit:cover;border-radius:6px;">` : ''}
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p><strong>Category:</strong> ${article.category} | <strong>Location:</strong> ${article.location}</p>
                    <p><strong>Author:</strong> ${article.authorName}</p>
                    <p>${article.content.substring(0, 200)}...</p>
                    <small>Submitted: ${new Date(article.submittedAt).toLocaleString()}</small>
                    <div style="margin-top:10px;display:flex;gap:10px;">
                        <button class="btn-approve" onclick="approveArticle('${article.$id}')">✓ Approve</button>
                        <button class="btn-reject" onclick="rejectArticle('${article.$id}')">✗ Reject</button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        container.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
}

async function loadPublishedArticles() {
    const container = document.getElementById('publishedArticlesList');
    if (!container) return;
    
    container.innerHTML = '<p>Loading...</p>';
    
    try {
        await requireAdmin();
        const response = await database.listDocuments(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            [
                Appwrite.Query.equal('status', 'approved'),
                Appwrite.Query.orderDesc('submittedAt'),
                Appwrite.Query.limit(50)
            ]
        );
        
        if (response.documents.length === 0) {
            container.innerHTML = '<p>No published articles.</p>';
            return;
        }
        
        container.innerHTML = response.documents.map(article => `
            <div class="article-card">
                ${article.imageFileId? `<img src="${article.imageFileId}" alt="${article.title}" style="width:150px;height:100px;object-fit:cover;border-radius:6px;">` : ''}
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p><strong>Category:</strong> ${article.category} | ${article.location}</p>
                    <p><span style="color:green;font-weight:600;">✓ PUBLISHED</span></p>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        container.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
}

async function loadRejectedArticles() {
    const container = document.getElementById('rejectedArticlesList');
    if (!container) return;
    
    container.innerHTML = '<p>Loading...</p>';
    
    try {
        await requireAdmin();
        const response = await database.listDocuments(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            [
                Appwrite.Query.equal('status', 'rejected'),
                Appwrite.Query.orderDesc('submittedAt'),
                Appwrite.Query.limit(50)
            ]
        );
        
        if (response.documents.length === 0) {
            container.innerHTML = '<p>No rejected articles.</p>';
            return;
        }
        
        container.innerHTML = response.documents.map(article => `
            <div class="article-card">
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p><span style="color:red;font-weight:600;">✗ REJECTED</span></p>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        container.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
}

async function approveArticle(id) {
    try {
        await requireAdmin();
        await database.updateDocument(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            id,
            { status: 'approved' }
        );
        alert('Article approved!');
        loadPendingArticles();
        loadDashboard();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function rejectArticle(id) {
    if (!confirm('Reject this article?')) return;
    try {
        await requireAdmin();
        await database.updateDocument(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            id,
            { status: 'rejected' }
        );
        alert('Article rejected!');
        loadPendingArticles();
        loadDashboard();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadCategories() {
    const container = document.getElementById('categoriesList');
    if (container) {
        container.innerHTML = '<p>Categories: darjeeling, kalimpong, kurseong, mirik, siliguri, west-bengal, national, entertainment, sports</p>';
    }
}

async function handleArticleUpdate(e) { 
    e.preventDefault(); 
    console.log('Update article...'); 
}