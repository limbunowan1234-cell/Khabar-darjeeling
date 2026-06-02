// js/admin.js - Khabar Darjeeling Admin Panel
// Full working version with auto-publish

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
        console.error('Login error:', error);
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
    if (tabName === 'dashboard') loadDashboard();
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
            container.innerHTML = '<p style="padding:20px;text-align:center;color:#666;">No pending articles.</p>';
            return;
        }
        
        container.innerHTML = '';
        response.documents.forEach(article => {
            container.innerHTML += `
                <div class="article-card">
                    ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : '<div style="width:150px;height:100px;background:#eee;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#999;">No Image</div>'}
                    <div class="article-content">
                        <h3>${article.title}</h3>
                        <p>${article.content ? article.content.substring(0, 150) + '...' : ''}</p>
                        <p style="margin:10px 0;color:#666;font-size:14px;">
                            <strong>Category:</strong> ${article.category || 'N/A'} | 
                            <strong>Author:</strong> ${article.authorName || 'Unknown'} | 
                            <strong>Date:</strong> ${new Date(article.$createdAt).toLocaleDateString()}
                        </p>
                        <button class="btn-approve" onclick="approveArticle('${article.$id}')">✓ Approve & Publish</button>
                        <button class="btn-reject" onclick="rejectArticle('${article.$id}')">✗ Reject</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = `<p style="color:red;padding:20px;">Error: ${error.message}</p>`;
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
            container.innerHTML = '<p style="padding:20px;text-align:center;color:#666;">No published articles yet.</p>';
            return;
        }
        
        container.innerHTML = '';
        response.documents.forEach(article => {
            container.innerHTML += `
                <div class="article-card">
                    ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : '<div style="width:150px;height:100px;background:#eee;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#999;">No Image</div>'}
                    <div class="article-content">
                        <h3>${article.title} <span style="color:green;font-size:12px;background:#e8f5e9;padding:2px 8px;border-radius:4px;">✅ LIVE</span></h3>
                        <p>${article.content ? article.content.substring(0, 150) + '...' : ''}</p>
                        <p style="margin:10px 0;color:#666;font-size:14px;">
                            <strong>Category:</strong> ${article.category || 'N/A'} | 
                            <strong>Published:</strong> ${new Date(article.$createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = `<p style="color:red;padding:20px;">Error: ${error.message}</p>`;
        console.error('Published articles error:', error);
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
            container.innerHTML = '<p style="padding:20px;text-align:center;color:#666;">No rejected articles.</p>';
            return;
        }
        
        container.innerHTML = '';
        response.documents.forEach(article => {
            container.innerHTML += `
                <div class="article-card">
                    <div class="article-content">
                        <h3>${article.title} <span style="color:#dc3545;font-size:12px;background:#ffebee;padding:2px 8px;border-radius:4px;">❌ REJECTED</span></h3>
                        <p>${article.content ? article.content.substring(0, 150) + '...' : ''}</p>
                        <p style="margin:10px 0;color:#666;font-size:14px;">
                            <strong>Category:</strong> ${article.category || 'N/A'}
                        </p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = `<p style="color:red;padding:20px;">Error: ${error.message}</p>`;
        console.error('Rejected articles error:', error);
    }
}

// APPROVE ARTICLE - THIS IS THE AUTO-PUBLISH FUNCTION
window.approveArticle = async function(articleId) {
    if (!confirm('Approve this article? It will go live on the homepage immediately.')) return;
    
    console.log('Approving article ID:', articleId);
    
    try {
        const result = await window.database.updateDocument(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            articleId,
            {
                status: 'published' // This makes it show on homepage
            }
        );
        
        console.log('Article approved successfully:', result);
        alert('✅ Article approved! It is now live on khabardarjeeling.space');
        loadPendingArticles();
        loadDashboard();
    } catch (error) {
        console.error('APPROVE ERROR:', error);
        alert('❌ Error approving article: ' + error.message + '\n\nCheck Console F12 for details. Most likely: Permissions issue. Go to Appwrite → Database → articles → Settings → Permissions → Add Role "Users" with Update permission.');
    }
}

// REJECT ARTICLE
window.rejectArticle = async function(articleId) {
    if (!confirm('Reject this article? It will not be published.')) return;
    
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
        console.error('REJECT ERROR:', error);
        alert('Error rejecting article: ' + error.message);
    }
}