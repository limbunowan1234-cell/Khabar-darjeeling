// js/admin.js

(function () {
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const loginError = document.getElementById('loginError');

    function showError(message) {
        if (!loginError) return;
        loginError.textContent = message;
        loginError.className = 'status-box error';
        loginError.style.display = 'block';
    }

    function clearError() {
        if (!loginError) return;
        loginError.textContent = '';
        loginError.className = 'status-box';
        loginError.style.display = 'none';
    }

    function appwriteReady() {
        return !!(window.account && window.databases && window.Query);
    }

    if (!appwriteReady()) {
        console.error('❌ Appwrite not initialized.');
        showError('Appwrite not initialized. Please hard refresh and check js/appwrite.js.');
        return;
    }

    window.initDashboard = function () {
        loadDashboard();
    };

    window.showTab = function (tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

        const selectedTab = document.getElementById(tabName);
        if (selectedTab) selectedTab.classList.add('active');

        if (window.event && window.event.target) {
            window.event.target.classList.add('active');
        }

        if (tabName === 'dashboard') loadDashboard();
        if (tabName === 'pending') loadPendingArticles();
        if (tabName === 'published') loadPublishedArticles();
        if (tabName === 'rejected') loadRejectedArticles();
    };

    async function checkExistingSession() {
        try {
            const user = await window.account.get();
            showAdminPanel(user);
        } catch {
            if (loginScreen) loginScreen.style.display = 'flex';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            try {
                await window.account.createEmailPasswordSession({
                    email,
                    password
                });
                const user = await window.account.get();
                showAdminPanel(user);
            } catch (error) {
                console.error('Login failed:', error);
                showError('Login failed: ' + (error.message || 'Unknown error'));
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await window.account.deleteSession('current');
                window.location.reload();
            } catch (error) {
                console.error('Logout error:', error);
                alert('Logout failed: ' + error.message);
            }
        });
    }

    function showAdminPanel(user) {
        if (loginScreen) loginScreen.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';

        const userDisplay = document.getElementById('adminUser');
        if (userDisplay) userDisplay.textContent = user.email || user.name || 'Admin';

        loadDashboard();
    }

    async function loadDashboard() {
        try {
            const allArticles = await window.databases.listDocuments(
                window.APPWRITE_DB_ID,
                window.APPWRITE_COLLECTION_ID,
                [window.Query.limit(100)]
            );

            const pending = allArticles.documents.filter(a => a.status === 'pending').length;
            const published = allArticles.documents.filter(a => a.status === 'published').length;
            const rejected = allArticles.documents.filter(a => a.status === 'rejected').length;

            const totalArticles = document.getElementById('totalArticles');
            const pendingCount = document.getElementById('pendingCount');
            const publishedCount = document.getElementById('publishedCount');
            const rejectedCount = document.getElementById('rejectedCount');

            if (totalArticles) totalArticles.textContent = allArticles.total ?? allArticles.documents.length;
            if (pendingCount) pendingCount.textContent = pending;
            if (publishedCount) publishedCount.textContent = published;
            if (rejectedCount) rejectedCount.textContent = rejected;
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

            if (!response.documents.length) {
                list.innerHTML = '<p style="padding:15px; color:#666;">No pending articles waiting for moderation.</p>';
                return;
            }

            list.innerHTML = response.documents.map(article => `
                <div class="article-card">
                    ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${escapeHtml(article.title)}">` : ''}
                    <div class="article-content">
                        <h3>${escapeHtml(article.title || 'Untitled')}</h3>
                        <p style="margin: 5px 0; font-size:13px; color:#666;">
                            <strong>Category:</strong> ${escapeHtml((article.category || 'general').toUpperCase())} |
                            <strong>Location:</strong> ${escapeHtml(article.location || 'Not Specified')}
                        </p>
                        <p style="margin-bottom:8px; font-size:13px; color:#666;">
                            <strong>Author:</strong> ${escapeHtml(article.authorName || article.submitterName || 'Anonymous')}
                        </p>
                        <p style="font-size:14px; color:#333;">${escapeHtml((article.content || '').substring(0, 200))}...</p>
                        <div style="margin-top:15px;">
                            <button class="btn-approve" onclick="approveArticle('${article.$id}')">✓ Approve</button>
                            <button class="btn-reject" onclick="rejectArticle('${article.$id}')">✗ Reject</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            list.innerHTML = '<p style="color:red; padding:15px;">Error: ' + error.message + '</p>';
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

            list.innerHTML = response.documents.map(article => `
                <div class="article-card">
                    ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${escapeHtml(article.title)}">` : ''}
                    <div class="article-content">
                        <h3>${escapeHtml(article.title || 'Untitled')}</h3>
                        <p style="margin:5px 0; font-size:13px; color:#666;">
                            <strong>Category:</strong> ${escapeHtml(article.category || 'general')} |
                            <strong>Location:</strong> ${escapeHtml(article.location || 'Not Specified')}
                        </p>
                        <p style="font-size:14px; color:#333;">${escapeHtml((article.content || '').substring(0, 150))}...</p>

                        <div style="margin-top:15px; padding-top:10px; border-top:1px solid #eee; display:flex; gap:15px; align-items:center; flex-wrap:wrap;">
                            <label style="font-size:13px; cursor:pointer; color:#333; font-weight:500;">
                                <input type="checkbox" class="featured-checkbox" onchange="toggleFeatured('${article.$id}', this.checked, this)" ${article.isFeatured ? 'checked' : ''}>
                                ⭐ Featured Story
                            </label>
                            <label style="font-size:13px; cursor:pointer; color:#333; font-weight:500;">
                                <input type="checkbox" onchange="toggleTopNews('${article.$id}', this.checked)" ${article.isTopNews ? 'checked' : ''}>
                                🔥 Top News
                            </label>

                            <button style="margin-left:auto; padding:6px 12px; font-size:12px; background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;" onclick="deleteArticle('${article.$id}')">🗑️ Delete</button>
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
                    ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${escapeHtml(article.title)}">` : ''}
                    <div class="article-content">
                        <h3>${escapeHtml(article.title || 'Untitled')}</h3>
                        <p style="margin:5px 0; font-size:13px; color:#666;">
                            <strong>Category:</strong> ${escapeHtml(article.category || 'general')} |
                            <strong>Author:</strong> ${escapeHtml(article.authorName || article.submitterName || 'Anonymous')}
                        </p>
                        <p style="font-size:14px; color:#333;">${escapeHtml((article.content || '').substring(0, 150))}...</p>
                    </div>
                </div>
            `).join('') || '<p style="padding:15px; color:#666;">No rejected articles found.</p>';
        } catch (error) {
            list.innerHTML = '<p style="color:red; padding:15px;">Error: ' + error.message + '</p>';
        }
    }

    window.approveArticle = async function (id) {
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

    window.rejectArticle = async function (id) {
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

    window.toggleFeatured = async function (id, isChecked, checkboxElement) {
        if (isChecked) {
            const currentFeaturedCount = document.querySelectorAll('.featured-checkbox:checked').length;
            if (currentFeaturedCount > 3) {
                alert('🛑 Limit reached: only 3 featured articles allowed.');
                checkboxElement.checked = false;
                return;
            }
        }

        try {
            await window.databases.updateDocument(
                window.APPWRITE_DB_ID,
                window.APPWRITE_COLLECTION_ID,
                id,
                { isFeatured: isChecked }
            );
        } catch (error) {
            alert('Failed to update Featured status: ' + error.message);
            loadPublishedArticles();
        }
    };

    window.toggleTopNews = async function (id, isChecked) {
        try {
            await window.databases.updateDocument(
                window.APPWRITE_DB_ID,
                window.APPWRITE_COLLECTION_ID,
                id,
                { isTopNews: isChecked }
            );
        } catch (error) {
            alert('Failed to update Top News status: ' + error.message);
            loadPublishedArticles();
        }
    };

    window.deleteArticle = async function (id) {
        if (!confirm('🛑 WARNING: Permanently delete this article?')) return;

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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    checkExistingSession();
})();
