// js/admin.js - Fixed for SDK v14 Databases and Security Routing

// Global function mapping so it can be safely triggered by admin.html gatekeeper
window.initDashboard = function() {
    loadDashboard();
};

// Check if already logged in natively on initialization 
window.account.get().then(response => {
    // If admin.html's inline check hasn't already hidden the screen, show it here
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen && loginScreen.style.display !== 'none') {
        showAdminPanel(response);
    }
}).catch(() => {
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) loginScreen.style.display = 'flex';
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
    if(document.getElementById('loginScreen')) document.getElementById('loginScreen').style.display = 'none';
    if(document.getElementById('adminPanel')) document.getElementById('adminPanel').style.display = 'block';
    if(document.getElementById('logoutBtn')) document.getElementById('logoutBtn').style.display = 'inline-block';
    
    const userDisplay = document.getElementById('adminUser');
    if (userDisplay) {
        userDisplay.textContent = user.email;
    }
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
    if(window.event && window.event.target) {
        window.event.target.classList.add('active');
    }
    
    // Load content
    if (tabName === 'dashboard') loadDashboard();
    if (tabName === 'pending') loadPendingArticles();
    if (tabName === 'published') loadPublishedArticles();
    if (tabName === 'rejected') loadRejectedArticles();
}

async function loadDashboard() {
    try {
        // ✅ FIXED: Changed window.database to window.databases
        const allArticles = await window.databases.listDocuments(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            [window.Query.limit(1000)]
        );
        
        const pending = allArticles.documents.filter(a => a.status === 'pending').length;
        const published = allArticles.documents.filter(a => a.status === 'published').length;
        const rejected = allArticles.documents.filter(a => a.status === 'rejected').length;
        
        if(document.getElementById('totalArticles')) document.getElementById('totalArticles').textContent = allArticles.total;
        if(document.getElementById('pendingCount')) document.getElementById('pendingCount').textContent = pending;
        if(document.getElementById('publishedCount')) document.getElementById('publishedCount').textContent = published;
        if(document.getElementById('rejectedCount')) document.getElementById('rejectedCount').textContent = rejected;
    } catch (error) {
        console.error('Dashboard loading error:', error);
    }
}

async function loadPendingArticles() {
    const list = document.getElementById('pendingArticlesList');
    if (!list) return;
    list.innerHTML = 'Loading...';
    
    try {
        // ✅ FIXED: Changed window.database to window.databases
        const response = await window.databases.listDocuments(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            [
                window.Query.equal('status', 'pending'),
                window.Query.orderDesc('$createdAt') // Fallback to system createdAt if submittedAt is empty
            ]
        );
        
        if (response.documents.length === 0) {
            list.innerHTML = '<p style="padding:15px; color:#666;">No pending articles waiting for moderation.</p>';
            return;
        }
        
        list.innerHTML = response.documents.map(article => `
            <div class="article-card">
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : ''}
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p style="margin: 5px 0; font-size:13px; color:#666;">
                        <strong>Category:</strong> ${article.category ? article.category.toUpperCase() : 'GENERAL'} | 
                        <strong>Location:</strong> ${article.location || 'Not Specified'}
                    </p>
                    <p style="margin-bottom:8px; font-size:13px; color:#666;"><strong>Author:</strong> ${article.authorName || 'Anonymous'}</p>
                    <p style="font-size:14px; color:#333;">${article.content ? article.content.substring(0, 200) : ''}...</p>
                    <div style="margin-top:15px;">
                        <button class="btn-approve" onclick="approveArticle('${article.$id}')">✓ Approve</button>
                        <button class="btn-reject" onclick="rejectArticle('${article.$id}')">✗ Reject</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p style="color:red; padding:15px;">Error: ' + error.message + '</p>';
        console.error(error);
    }
}

async function loadPublishedArticles() {
    const list = document.getElementById('publishedArticlesList');
    if (!list) return;
    list.innerHTML = 'Loading...';
    
    try {
        // ✅ FIXED: Changed window.database to window.databases
        const response = await window.databases.listDocuments(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            [
                window.Query.equal('status', 'published'),
                window.Query.orderDesc('$createdAt'),
                window.Query.limit(50)
            ]
        );
        
        list.innerHTML = response.documents.map(article => `
            <div class="article-card">
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : ''}
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p style="margin:5px 0; font-size:13px; color:#666;"><strong>Category:</strong> ${article.category} | <strong>Location:</strong> ${article.location}</p>
                    <p style="font-size:14px; color:#333;">${article.content ? article.content.substring(0, 150) : ''}...</p>
                </div>
            </div>
        `).join('') || '<p style="padding:15px; color:#666;">No published articles found.</p>';
    } catch (error) {
        list.innerHTML = '<p style="color:red; padding:15px;">Error: ' + error.message + '</p>';
    }
}

async function loadRejectedArticles() {
    const list = document.getElementById('rejectedArticlesList');
    if (!list) return;
    list.innerHTML = 'Loading...';
    
    try {
        // ✅ FIXED: Changed window.database to window.databases
        const response = await window.databases.listDocuments(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            [
                window.Query.equal('status', 'rejected'),
                window.Query.orderDesc('$createdAt')
            ]
        );
        
        list.innerHTML = response.documents.map(article => `
            <div class="article-card">
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : ''}
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p style="margin:5px 0; font-size:13px; color:#666;"><strong>Category:</strong> ${article.category} | <strong>Author:</strong> ${article.authorName}</p>
                    <p style="font-size:14px; color:#333;">${article.content ? article.content.substring(0, 150) : ''}...</p>
                </div>
            </div>
        `).join('') || '<p style="padding:15px; color:#666;">No rejected articles found.</p>';
    } catch (error) {
        list.innerHTML = '<p style="color:red; padding:15px;">Error: ' + error.message + '</p>';
    }
}

// Global scope attachment so inline HTML onClick triggers can hit these endpoints smoothly
window.approveArticle = async function(id) {
    try {
        // ✅ FIXED: Changed window.database to window.databases
        await window.databases.updateDocument(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            id,
            { status: 'published' }
        );
        loadPendingArticles();
        loadDashboard();
        alert('Article approved and published live!');
    } catch (error) {
        alert('Approval failed: ' + error.message);
    }
};

window.rejectArticle = async function(id) {
    if (!confirm('Are you sure you want to reject this article submission?')) return;
    try {
        // ✅ FIXED: Changed window.database to window.databases
        await window.databases.updateDocument(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            id,
            { status: 'rejected' }
        );
        loadPendingArticles();
        loadDashboard();
        alert('Article rejected.');
    } catch (error) {
        alert('Rejection failed: ' + error.message);
    }
};
