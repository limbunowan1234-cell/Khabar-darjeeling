// js/admin.js - Khabar Darjeeling Admin Panel

const APPWRITE_DB_ID = 'Khabar_db';
const APPWRITE_COLLECTION_ID = 'articles';

// Check if user is logged in on page load
checkAuth();

async function checkAuth() {
    try {
        const user = await window.account.get();
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'inline-block';
        document.getElementById('adminUser').textContent = user.email;
        loadDashboard();
    } catch (error) {
        // Not logged in - show login screen
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }
}

// Login Form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');
    
    try {
        await window.account.createEmailSession(email, password);
        errorMsg.style.display = 'none';
        checkAuth();
    } catch (error) {
        errorMsg.textContent = 'Login failed: ' + error.message;
        errorMsg.style.display = 'block';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await window.account.deleteSession('current');
        window.location.reload();
    } catch (error) {
        alert('Logout failed: ' + error.message);
    }
});

// Tab Navigation
window.showTab = function(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Load data for tab
    if (tabName === 'pending') loadPendingArticles();
    if (tabName === 'published') loadPublishedArticles();
    if (tabName === 'rejected') loadRejectedArticles();
}

// Load Dashboard Stats
async function loadDashboard() {
    try {
        const allArticles = await window.database.listDocuments(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            [Query.limit(1000)]
        );
        
        const articles = allArticles.documents;
        const pending = articles.filter(a => a.status === 'pending' || !a.status);
        const published = articles.filter(a => a.status === 'published');
        const rejected = articles.filter(a => a.status === 'rejected');
        
        document.getElementById('totalArticles').textContent = articles.length;
        document.getElementById('pendingCount').textContent = pending.length;
        document.getElementById('publishedCount').textContent = published.length;
        document.getElementById('rejectedCount').textContent = rejected.length;
        
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

// Load Pending Articles
async function loadPendingArticles() {
    const container = document.getElementById('pendingArticlesList');
    container.innerHTML = 'Loading...';
    
    try {
        const response = await window.database.listDocuments(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            [
                Query.equal('status', 'pending'),
                Query.orderDesc('$createdAt')
            ]
        );
        
        if (response.documents.length === 0) {
            container.innerHTML = '<p>No pending articles.</p>';
            return;
        }
        
        container.innerHTML = '';
        response.documents.forEach(article => {
            container.innerHTML += `
                <div class="article-card">
                    ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : '<div style="width:150px;height:100px;background:#eee;border-radius:6px;"></div>'}
                    <div class="article-content">
                        <h3>${article.title}</h3>
                        <p>${article.content ? article.content.substring(0, 150) + '...' : ''}</p>
                        <p><strong>Category:</strong> ${article.category || 'N/A'} | <strong>Author:</strong> ${article.authorName || 'Unknown'}</p>
                        <button class="btn-approve" onclick="approveArticle('${article.$id}')">✓ Approve</button>
                        <button class="btn-reject" onclick="rejectArticle('${article.$id}')">✗ Reject</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
        console.error('Pending articles error:', error);
    }
}

// Load Published Articles
async function loadPublishedArticles() {
    const container = document.getElementById('publishedArticlesList');
    container.innerHTML = 'Loading...';
    
    try {
        const response = await window.database.listDocuments(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            [
                Query.equal('status', 'published'),
                Query.orderDesc('$createdAt')
            ]
        );
        
        if (response.documents.length === 0) {
            container.innerHTML = '<p>No published articles.</p>';
            return;
        }
        
        container.innerHTML = '';
        response.documents.forEach(article => {
            container.innerHTML += `
                <div class="article-card">
                    ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : '<div style="width:150px;height:100px;background:#eee;border-radius:6px;"></div>'}
                    <div class="article-content">
                        <h3>${article.title} <span style="color:green;font-size:12px;">✅ PUBLISHED</span></h3>
                        <p>${article.content ? article.content.substring(0, 150) + '...' : ''}</p>
                        <p><strong>Category:</strong> ${article.category || 'N/A'}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
    }
}

// Load Rejected Articles
async function loadRejectedArticles() {
    const container = document.getElementById('rejectedArticlesList');
    container.innerHTML = 'Loading...';
    
    try {
        const response = await window.database.listDocuments(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            [
                Query.equal('status', 'rejected'),
                Query.orderDesc('$createdAt')
            ]
        );
        
        if (response.documents.length === 0) {
            container.innerHTML = '<p>No rejected articles.</p>';
            return;
        }
        
        container.innerHTML = '';
        response.documents.forEach(article => {
            container.innerHTML += `
                <div class="article-card">
                    <div class="article-content">
                        <h3>${article.title} <span style="color:red;font-size:12px;">❌ REJECTED</span></h3>
                        <p>${article.content ? article.content.substring(0, 150) + '...' : ''}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
    }
}

// THIS IS THE KEY FIX - Approve Article
window.approveArticle = async function(articleId) {
    if (!confirm('Approve this article? It will go live on the homepage.')) return;
    
    try {
        await window.database.updateDocument(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            articleId,
            {
                status: 'published' // ← THIS LINE MAKES IT WORK
            }
        );
        
        alert('Article approved! It is now live on the homepage.');
        loadPendingArticles();
        loadDashboard();
    } catch (error) {
        alert('Error approving article: ' + error.message);
        console.error(error);
    }
}

// Reject Article
window.rejectArticle = async function(articleId) {
    if (!confirm('Reject this article?')) return;
    
    try {
        await window.database.updateDocument(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            articleId,
            {
                status: 'rejected'
            }
        );
        
        alert('Article rejected.');
        loadPendingArticles();
        loadDashboard();
    } catch (error) {
        alert('Error rejecting article: ' + error.message);
        console.error(error);
    }
}