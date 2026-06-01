/* ==================== ADMIN DASHBOARD JAVASCRIPT ==================== */

let adminUser = null;
const ADMIN_EMAIL = 'admin@khabardarjeeling.space';
const ADMIN_PASSWORD = 'ChangeMe123!'; // Change this password!

document.addEventListener('DOMContentLoaded', async () => {
    const adminPanel = document.getElementById('adminPanel');
    const loginScreen = document.getElementById('loginScreen');
    
    // Check if admin is logged in
    const isLoggedIn = await checkAdminLogin();
    
    if (isLoggedIn) {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'flex';
        setupAdminDashboard();
    } else {
        setupLoginForm();
    }
});

// Setup Login Form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
}

// Handle Admin Login
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    
    try {
        if (email !== ADMIN_EMAIL) {
            throw new Error('Invalid credentials');
        }
        
        // In production, use proper authentication with Appwrite
        await loginUser(email, password);
        
        localStorage.setItem('adminToken', 'authenticated');
        window.location.reload();
        
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'Invalid email or password';
        loginError.style.display = 'block';
    }
}

// Check Admin Login
async function checkAdminLogin() {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;
    
    try {
        const user = await checkCurrentUser();
        return user && user.email === ADMIN_EMAIL;
    } catch {
        return false;
    }
}

// Setup Admin Dashboard
function setupAdminDashboard() {
    const adminUser = document.getElementById('adminUser');
    if (adminUser) {
        adminUser.textContent = ADMIN_EMAIL;
    }
    
    // Setup menu clicks
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.getAttribute('onclick').match(/showTab\('([^']+)'\)/)[1];
            showTab(tab);
        });
    });
    
    // Setup logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleAdminLogout);
    }
    
    // Load initial data
    showTab('dashboard');
    
    // Setup edit form
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleArticleUpdate);
    }
}

// Show Tab
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.classList.add('active');
        
        // Mark menu item as active
        document.querySelector(`[onclick*="${tabName}"]`)?.classList.add('active');
    }
    
    // Load data based on tab
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
        const response = await getPendingArticles(20, 0);
        displayArticlesList(response.documents || [], 'pendingList', 'pending');
    } catch (error) {
        console.error('Error loading pending articles:', error);
    }
}

// Load Approved Articles
async function loadApprovedArticles() {
    try {
        const { Query } = window.Appwrite;
        const response = await getArticles(
            [Query.equal('status', ARTICLE_STATUS.APPROVED)],
            20,
            0
        );
        displayArticlesList(response.documents || [], 'approvedList', 'approved');
    } catch (error) {
        console.error('Error loading approved articles:', error);
    }
}

// Load Rejected Articles
async function loadRejectedArticles() {
    try {
        const { Query } = window.Appwrite;
        const response = await getArticles(
            [Query.equal('status', ARTICLE_STATUS.REJECTED)],
            20,
            0
        );
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
                <button class="btn-approve btn btn-small" onclick="approveArticle('${article.$id}')">Approve</button>
                <button class="btn-reject btn btn-small" onclick="rejectArticle('${article.$id}')">Reject</button>
                <button class="btn-edit btn btn-small" onclick="editArticle('${article.$id}')">Edit</button>
            `;
        } else {
            actions = `
                <button class="btn-edit btn btn-small" onclick="editArticle('${article.$id}')">Edit</button>
                <button class="btn-delete btn btn-small" onclick="deleteArticleConfirm('${article.$id}', '${article.imageFileId}')">Delete</button>
                <button class="btn-view btn btn-small" onclick="window.open('article.html?id=${article.$id}')">View</button>
            `;
        }
        
        return `
            <div class="article-item">
                <img src="${imageUrl}" alt="${article.title}" class="article-item-image">
                <div class="article-item-content">
                    <h4>${article.title}</h4>
                    <div class="article-item-meta">
                        <span>📅 ${pubDate}</span>
                        <span>📍 ${article.location}</span>
                        <span>👤 ${article.authorName}</span>
                    </div>
                    <p class="article-item-excerpt">${article.content.substring(0, 150)}...</p>
                </div>
                <div class="article-item-actions">
                    ${actions}
                </div>
            </div>
        `;
    }).join('');
}

// Load Categories
function loadCategories() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    container.innerHTML = CATEGORIES.map(category => `
        <div class="category-card">
            <div class="category-card-icon">${category.icon}</div>
            <h5 class="category-card-name">${category.name}</h5>
            <p class="category-card-count">ID: ${category.id}</p>
        </div>
    `).join('');
}

// Approve Article
async function approveArticle(articleId) {
    if (!confirm('Approve this article?')) return;
    
    try {
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
    
    try {
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
        const article = await getArticleById(articleId);
        if (!article) {
            throw new Error('Article not found');
        }
        
        document.getElementById('editArticleId').value = articleId;
        document.getElementById('editTitle').value = article.title;
        document.getElementById('editCategory').value = article.category;
        document.getElementById('editContent').value = article.content;
        
        const modal = document.getElementById('editModal');
        modal.classList.add('active');
        
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
        await updateArticle(articleId, { title, category, content });
        alert('Article updated!');
        closeEditModal();
        loadPendingArticles();
    } catch (error) {
        alert('Error updating article: ' + error.message);
    }
}

// Delete Article Confirm
function deleteArticleConfirm(articleId, imageFileId) {
    if (confirm('Are you sure? This cannot be undone.')) {
        deleteArticleAction(articleId, imageFileId);
    }
}

// Delete Article Action
async function deleteArticleAction(articleId, imageFileId) {
    try {
        await deleteArticle(articleId, imageFileId);
        alert('Article deleted!');
        showTab('approved');
    } catch (error) {
        alert('Error deleting article: ' + error.message);
    }
}

// Close Edit Modal
function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
}

// Handle Admin Logout
async function handleAdminLogout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    try {
        await logoutUser();
        localStorage.removeItem('adminToken');
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
