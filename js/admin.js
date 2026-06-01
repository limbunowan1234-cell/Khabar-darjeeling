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
        loginError.textContent = 'Invalid email or password';
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
        case 'approved':
            loadApprovedArticles();
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
        console.error('Error loading dashboard:', error);
    }
}

// Load Pending Articles
async function loadPendingArticles() {
    try {
        await requireAdmin();
        const response = await getPendingArticles(20, 0);
        displayArticlesList(response.documents || [], 'pendingList', 'pending');
    } catch (error) {
        console.error('Error loading pending articles:', error);
    }
}

// Load Approved Articles
async function loadApprovedArticles() {
    try {
        await requireAdmin();
        const { Query } = window.Appwrite;
        const response = await getArticles([Query.equal('status', ARTICLE_STATUS.APPROVED)], 20, 0);
        displayArticlesList(response.documents || [], 'approvedList', 'approved');
    } catch (error) {
        console.error('Error loading approved articles:', error);
    }
}

// Load Rejected Articles
async function loadRejectedArticles() {
    try {
        await requireAdmin();
        const { Query } = window.Appwrite;
        const response = await getArticles([Query.equal('status', ARTICLE_STATUS.REJECTED)], 20, 0);
        displayArticlesList(response.documents || [], 'rejectedList', 'rejected');
    } catch (error) {
        console.error('Error loading rejected articles:', error);
    }
}

// Display Articles List
function displayArticlesList(articles, containerId, status) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (articles.length === 0) {
        container.innerHTML = '<p style="padding: 2rem; text-align: center;">No articles found</p>';
        return;
    }
    
    container.innerHTML = articles.map(article => {
        const imageUrl = getImagePreviewUrl(article.imageFileId);
        const pubDate = new Date(article.publishedAt || article.submittedAt).toLocaleDateString();
        
        let actions = '';
        if (status === 'pending') {
            actions = `
                <button class="btn-approve btn btn-small" data-action="approve" data-id="${article.$id}">Approve</button>
                <button class="btn-reject btn btn-small" data-action="reject" data-id="${article.$id}">Reject</button>
                <button class="btn-edit btn btn-small" data-action="edit" data-id="${article.$id}">Edit</button>
            `;
        } else {
            actions = `
                <button class="btn-edit btn btn-small" data-action="edit" data-id="${article.$id}">Edit</button>
                <button class="btn-delete btn btn-small" data-action="delete" data-id="${article.$id}" data-image="${article.imageFileId}">Delete</button>
                <button class="btn-view btn btn-small" data-action="view" data-id="${article.$id}">View</button>
            `;
        }
        
        return `
            <div class="article-item">
                <img src="${imageUrl}" alt="" class="article-item-image" onerror="this.src='images/placeholder.jpg'">
                <div class="article-item-content">
                    <h4>${escapeHtml(article.title)}</h4>
                    <div class="article-item-meta">
                        <span>📅 ${pubDate}</span>
                        <span>📍 ${escapeHtml(article.location)}</span>
                        <span>👤 ${escapeHtml(article.authorName)}</span>
                    </div>
                    <p class="article-item-excerpt">${escapeHtml(article.content.substring(0, 150))}...</p>
                </div>
                <div class="article-item-actions">
                    ${actions}
                </div>
            </div>
        `;
    }).join('');
    
    // Attach event listeners instead of inline onclick
    container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', handleArticleAction);
    });
}

// Handle Article Actions
async function handleArticleAction(e) {
    const action = e.target.dataset.action;
    const id = e.target.dataset.id;
    
    switch(action) {
        case 'approve':
            await approveArticle(id);
            break;
        case 'reject':
            await rejectArticle(id);
            break;
        case 'edit':
            await editArticle(id);
            break;
        case 'delete':
            await deleteArticleConfirm(id, e.target.dataset.image);
            break;
        case 'view':
            window.open(`article.html?id=${id}`, '_blank');
            break;
    }
}

// XSS Protection
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load Categories
function loadCategories() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    container.innerHTML = CATEGORIES.map(category => `
        <div class="category-card">
            <div class="category-card-icon">${category.icon}</div>
            <h5 class="category-card-name">${escapeHtml(category.name)}</h5>
            <p class="category-card-count">ID: ${category.id}</p>
        </div>
    `).join('');
}

// Approve Article
async function approveArticle(articleId) {
    if (!confirm('Approve this article?')) return;
    
    try {
        await requireAdmin();
        await updateArticleStatus(articleId, ARTICLE_STATUS.APPROVED);
        alert('Article approved!');
        loadPendingArticles();
    } catch (error) {
        alert('Error approving article: ' + error.message);
    }
}

// Reject Article
async function rejectArticle(articleId) {
    const reason = prompt('Rejection reason (optional):');
    if (reason === null) return;
    
    try {
        await requireAdmin();
        await updateArticleStatus(articleId, ARTICLE_STATUS.REJECTED, reason);
        alert('Article rejected!');
        loadPendingArticles();
    } catch (error) {
        alert('Error rejecting article: ' + error.message);
    }
}

// Edit Article
async function editArticle(articleId) {
    try {
        await requireAdmin();
        const article = await getArticleById(articleId);
        if (!article) throw new Error('Article not found');
        
        document.getElementById('editArticleId').value = articleId;
        document.getElementById('editTitle').value = article.title;
        document.getElementById('editCategory').value = article.category;
        document.getElementById('editContent').value = article.content;
        
        document.getElementById('editModal').classList.add('active');
    } catch (error) {
        alert('Error loading article: ' + error.message);
    }
}

// Handle Article Update
async function handleArticleUpdate(e) {
    e.preventDefault();
    
    const articleId = document.getElementById('editArticleId').value;
    const title = document.getElementById('editTitle').value;
    const category = document.getElementById('editCategory').value;
    const content = document.getElementById('editContent').value;
    
    try {
        await requireAdmin();
        await updateArticle(articleId, { title, category, content });
        alert('Article updated!');
        closeEditModal();
        showTab('pending');
    } catch (error) {
        alert('Error updating article: ' + error.message);
    }
}

// Delete Article Confirm
async function deleteArticleConfirm(articleId, imageFileId) {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    
    try {
        await requireAdmin();
        await deleteArticle(articleId, imageFileId);
        alert('Article deleted!');
        showTab('approved');
    } catch (error) {
        alert('Error deleting article: ' + error.message);
    }
}

// Close Edit Modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

// Handle Admin Logout
async function handleAdminLogout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    try {
        await account.deleteSession('current');
        window.location.href = 'admin.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out');
    }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeEditModal();
    }
});