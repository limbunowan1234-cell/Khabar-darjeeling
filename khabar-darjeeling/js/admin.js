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
        const response = await window.databases.listDocuments(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            [
                window.Query.equal('status', 'pending'),
                window.Query.orderDesc('$createdAt') 
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
        const response = await window.databases.listDocuments(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            [
                window.Query.equal('status', 'published'),
                window.Query.orderDesc('$createdAt'),
                window.Query.limit(50)
            ]
        );
        
        // ⚡ ADDED 'featured-checkbox' CLASS TO TRACK HOW MANY ARE CHECKED
        list.innerHTML = response.documents.map(article => `
            <div class="article-card">
                ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : ''}
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p style="margin:5px 0; font-size:13px; color:#666;"><strong>Category:</strong> ${article.category} | <strong>Location:</strong> ${article.location}</p>
                    <p style="font-size:14px; color:#333;">${article.content ? article.content.substring(0, 150) : ''}...</p>
                    
                    <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                        <label style="font-size: 13px; cursor: pointer; color: #333; font-weight: 500;">
                            <input type="checkbox" class="featured-checkbox" onchange="toggleFeatured('${article.$id}', this.checked, this)" ${article.isFeatured ? 'checked' : ''}>
                            ⭐ Featured Story
                        </label>
                        <label style="font-size: 13px; cursor: pointer; color: #333; font-weight: 500;">
                            <input type="checkbox" onchange="toggleTopNews('${article.$id}', this.checked)" ${article.isTopNews ? 'checked' : ''}>
                            🔥 Top News
                        </label>
                        
                        <button style="margin-left: auto; padding: 6px 12px; font-size: 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;" onclick="deleteArticle('${article.$id}')">🗑️ Delete</button>
                    </div>

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

// ==========================================
// ADMIN DATABASE ACTIONS
// ==========================================

window.approveArticle = async function(id) {
    try {
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
        await window.databases.updateDocument(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            id,
            { status: 'rejected' }
        );
        loadPendingArticles();
        loadDashboard();
    } catch (error) {
        alert('Rejection failed: ' + error.message);
    }
};

// ⚡ SMART TOGGLE: BLOCKS SELECTION IF MORE THAN 3 ARE CHECKED
window.toggleFeatured = async function(id, isChecked, checkboxElement) {
    if (isChecked) {
        // Count how many are checked on the screen right now
        const currentFeaturedCount = document.querySelectorAll('.featured-checkbox:checked').length;
        if (currentFeaturedCount > 3) {
            alert('🛑 Limit Reached: You can only have up to 3 Featured Articles at a time.\n\nPlease un-check an older featured story first.');
            checkboxElement.checked = false; // Revert the box back to empty
            return; // Stop here, do not update database
        }
    }

    try {
        await window.databases.updateDocument(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            id,
            { isFeatured: isChecked }
        );
        console.log(`Article ${id} Featured status set to: ${isChecked}`);
    } catch (error) {
        alert('Failed to update Featured status: ' + error.message);
        loadPublishedArticles(); // Reloads to reset the checkbox to its actual state if it failed
    }
};

window.toggleTopNews = async function(id, isChecked) {
    try {
        await window.databases.updateDocument(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            id,
            { isTopNews: isChecked }
        );
        console.log(`Article ${id} Top News status set to: ${isChecked}`);
    } catch (error) {
        alert('Failed to update Top News status: ' + error.message);
        loadPublishedArticles(); 
    }
};

window.deleteArticle = async function(id) {
    if (!confirm('🛑 WARNING: Are you sure you want to permanently delete this article? This action cannot be undone.')) return;
    
    try {
        await window.databases.deleteDocument(
            window.APPWRITE_DB_ID,
            window.APPWRITE_COLLECTION_ID,
            id
        );
        loadPublishedArticles();
        loadDashboard(); 
    } catch (error) {
        alert('Delete failed: ' + error.message);
    }
};
