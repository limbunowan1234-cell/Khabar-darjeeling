// js/admin.js - Fixed for SDK v14

// Check if already logged in
window.account.get().then(response => {
    showAdminPanel(response);
}).catch(() => {
    document.getElementById('loginScreen').style.display = 'flex';
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');
    
    errorMsg.style.display = 'none';
    
    try {
        // FIXED: createEmailPasswordSession for SDK v14
        await window.account.createEmailPasswordSession(email, password);
        const user = await window.account.get();
        showAdminPanel(user);
    } catch (error) {
        errorMsg.textContent = 'Login failed: ' + error.message;
        errorMsg.style.display = 'block';
        console.error(error);
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await window.account.deleteSession('current');
        window.location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
});

function showAdminPanel(user) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('adminUser').textContent = user.email;
    loadDashboard();
}

function showTab(tabName) {
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
    
    // Load content
    if (tabName === 'pending') loadPendingArticles();
    if (tabName === 'published') loadPublishedArticles();
    if (tabName === 'rejected') loadRejectedArticles();
}

async function loadDashboard() {
    try {
        const allArticles = await window.database.listDocuments(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            [window.Query.limit(1000)]
        );
        
        const pending = allArticles.documents.filter(a => a.status === 'pending').length;
        const published = allArticles.documents.filter(a => a.status === 'published').length;
        const rejected = allArticles.documents.filter(a => a.status === 'rejected').length;
        
        document.getElementById('totalArticles').textContent = allArticles.total;
        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('publishedCount').textContent = published;
        document.getElementById('rejectedCount').textContent = rejected;
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

async function loadPendingArticles() {
    const list = document.getElementById('pendingArticlesList');
    list.innerHTML = 'Loading...';
    
    try {
        const response = await window.database.listDocuments(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            [
                window.Query.equal('status', 'pending'),
                window.Query.orderDesc('submittedAt')
            ]
        );
        
        if (response.documents.length === 0) {
            list.innerHTML = '<p>No pending articles</p>';
            return;
        }
        
        list.innerHTML = response.documents.map(article => `
            <div class="article-card">
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : ''}
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p><strong>Category:</strong> ${article.category} | <strong>Location:</strong> ${article.location}</p>
                    <p><strong>Author:</strong> ${article.authorName}</p>
                    <p>${article.content.substring(0, 200)}...</p>
                    <div style="margin-top:15px;">
                        <button class="btn-approve" onclick="approveArticle('${article.$id}')">✓ Approve</button>
                        <button class="btn-reject" onclick="rejectArticle('${article.$id}')">✗ Reject</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p style="color:red;">Error: ' + error.message + '</p>';
        console.error(error);
    }
}

async function loadPublishedArticles() {
    const list = document.getElementById('publishedArticlesList');
    list.innerHTML = 'Loading...';
    
    try {
        const response = await window.database.listDocuments(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            [
                window.Query.equal('status', 'published'),
                window.Query.orderDesc('submittedAt'),
                window.Query.limit(50)
            ]
        );
        
        list.innerHTML = response.documents.map(article => `
            <div class="article-card">
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : ''}
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p><strong>Category:</strong> ${article.category} | <strong>Location:</strong> ${article.location}</p>
                    <p>${article.content.substring(0, 150)}...</p>
                </div>
            </div>
        `).join('') || '<p>No published articles</p>';
    } catch (error) {
        list.innerHTML = '<p style="color:red;">Error: ' + error.message + '</p>';
    }
}

async function loadRejectedArticles() {
    const list = document.getElementById('rejectedArticlesList');
    list.innerHTML = 'Loading...';
    
    try {
        const response = await window.database.listDocuments(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            [
                window.Query.equal('status', 'rejected'),
                window.Query.orderDesc('submittedAt')
            ]
        );
        
        list.innerHTML = response.documents.map(article => `
            <div class="article-card">
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : ''}
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p><strong>Category:</strong> ${article.category} | <strong>Author:</strong> ${article.authorName}</p>
                    <p>${article.content.substring(0, 150)}...</p>
                </div>
            </div>
        `).join('') || '<p>No rejected articles</p>';
    } catch (error) {
        list.innerHTML = '<p style="color:red;">Error: ' + error.message + '</p>';
    }
}

async function approveArticle(id) {
    try {
        await window.database.updateDocument(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            id,
            { status: 'published' }
        );
        loadPendingArticles();
        loadDashboard();
        alert('Article approved!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function rejectArticle(id) {
    if (!confirm('Reject this article?')) return;
    try {
        await window.database.updateDocument(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            id,
            { status: 'rejected' }
        );
        loadPendingArticles();
        loadDashboard();
        alert('Article rejected!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}