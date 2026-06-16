// js/admin-improved.js
// ✅ IMPROVED VERSION with all critical fixes
// Changes:
// 1. Uses unified Appwrite config from appwrite.js
// 2. No hardcoded admin email
// 3. Proper error handling on all API calls
// 4. Loading states for all operations
// 5. Event delegation instead of inline onclick
// 6. Separated concerns (fetch, render, orchestrate)

// ============ CONFIGURATION (Unified) ============
// Uses window.ENDPOINT, window.PROJECT, etc. from appwrite.js
// No duplication!

// ============ UTILITY FUNCTIONS ============

/**
 * Safe text rendering with XSS protection
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Format date for display
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Get image preview URL with optimization
 */
function getImagePreviewUrl(fileId, width = 120, height = 80) {
  if (!fileId) return null;
  return `${window.ENDPOINT}/storage/buckets/${window.APPWRITE_BUCKET_ID}/files/${fileId}/preview?project=${window.PROJECT}&width=${width}&height=${height}&quality=80`;
}

/**
 * Show error toast
 */
function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-error';
  toast.textContent = `❌ ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 4000);
}

/**
 * Show success toast
 */
function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.textContent = `✅ ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

// ============ AUTHENTICATION & AUTHORIZATION ============

/**
 * Verify admin access on page load
 */
async function verifyAdminAccess() {
  try {
    const me = await window.account.get();
    
    // Check if user has admin role (via Appwrite teams/labels)
    const isAdmin = me.labels?.includes('admin') || false;
    
    if (!isAdmin) {
      showDenyAccess(me.email);
      return false;
    }
    
    document.getElementById('adminEmail').textContent = me.email;
    document.getElementById('adminName').textContent = me.name || me.email;
    
    return true;
  } catch (error) {
    console.error('Auth verification failed:', error);
    // Redirect to login if session expired
    if (error.code === 401) {
      window.location.href = '/login.html';
    }
    return false;
  }
}

/**
 * Display access denied message
 */
function showDenyAccess(email) {
  document.body.innerHTML = `
    <div style="padding:40px;text-align:center;font-family:system-ui;background:#fff">
      <h2 style="color:#d32f2f">🔒 Access Denied</h2>
      <p style="color:#666">You are logged in as <strong>${escapeHtml(email)}</strong></p>
      <p style="color:#666">Admin access is required for this page.</p>
      <a href="/" style="color:#c41e3a;font-weight:600;text-decoration:none">← Go Home</a>
    </div>
  `;
}

// ============ DATA FETCHING ============

/**
 * Fetch pending articles from Appwrite
 */
async function fetchPendingArticles() {
  const queries = [
    window.Query.equal('status', 'pending'),
    window.Query.orderDesc('$createdAt')
  ];
  
  return await window.databases.listDocuments(
    window.APPWRITE_DB_ID,
    window.COL_ARTICLES,
    queries
  );
}

/**
 * Approve article (update status)
 */
async function approveArticle(articleId) {
  const data = { status: 'approved' };
  
  return await window.databases.updateDocument(
    window.APPWRITE_DB_ID,
    window.COL_ARTICLES,
    articleId,
    data
  );
}

/**
 * Reject article (delete)
 */
async function rejectArticle(articleId) {
  return await window.databases.deleteDocument(
    window.APPWRITE_DB_ID,
    window.COL_ARTICLES,
    articleId
  );
}

// ============ UI RENDERING ============

/**
 * Create article card HTML
 */
function createArticleCardHtml(article) {
  const imageUrl = getImagePreviewUrl(article.imageFileId);
  
  return `
    <div class="article-card" data-article-id="${article.$id}">
      <div class="article-preview">
        ${imageUrl ? `<img 
          src="${imageUrl}" 
          alt="Article thumbnail: ${escapeHtml(article.title)}"
          class="article-image"
          onerror="this.style.display='none'"
        >` : ''}
        <div class="article-info">
          <h3 class="article-title">${escapeHtml(article.title)}</h3>
          <p class="article-meta">
            By <strong>${escapeHtml(article.authorName || 'Anonymous')}</strong> 
            • ${escapeHtml(article.category || 'General')} 
            • ${escapeHtml(article.location || 'Darjeeling')}
          </p>
          <p class="article-excerpt">
            ${escapeHtml(article.content.substring(0, 150))}...
          </p>
          <time class="article-date">${formatDate(article.$createdAt)}</time>
        </div>
      </div>
      
      <div class="article-actions">
        <button class="btn btn-success" data-action="approve" data-id="${article.$id}" title="Approve article">
          ✓ Approve
        </button>
        <button class="btn btn-danger" data-action="reject" data-id="${article.$id}" title="Reject article">
          ✗ Reject
        </button>
        <button class="btn btn-secondary" data-action="view" data-id="${article.$id}" title="View article">
          👁️ View
        </button>
        <button class="btn btn-secondary" data-action="edit" data-id="${article.$id}" title="Edit article">
          ✏️ Edit
        </button>
      </div>
    </div>
  `;
}

/**
 * Render empty state
 */
function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-icon">✅</div>
      <h3>All Caught Up!</h3>
      <p>No pending articles to review</p>
    </div>
  `;
}

/**
 * Render article list
 */
function renderArticleList(articles) {
  const container = document.getElementById('pendingList');
  
  if (!articles || articles.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }
  
  const html = articles
    .map(article => createArticleCardHtml(article))
    .join('');
  
  container.innerHTML = html;
  
  // Bind event delegation
  bindArticleActions();
}

/**
 * Show loading state
 */
function showLoading() {
  const container = document.getElementById('pendingList');
  container.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading articles...</p>
    </div>
  `;
}

// ============ EVENT HANDLING ============

/**
 * Bind article action buttons using event delegation
 */
function bindArticleActions() {
  const container = document.getElementById('pendingList');
  
  container.removeEventListener('click', handleArticleAction);
  container.addEventListener('click', handleArticleAction);
}

/**
 * Handle article action clicks (approve, reject, view, edit)
 */
async function handleArticleAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  
  const action = button.dataset.action;
  const articleId = button.dataset.id;
  
  // Prevent double-clicks
  if (button.disabled) return;
  button.disabled = true;
  const originalText = button.textContent;
  
  try {
    switch (action) {
      case 'approve':
        await handleApprove(articleId, button, originalText);
        break;
      case 'reject':
        await handleReject(articleId, button, originalText);
        break;
      case 'view':
        handleView(articleId);
        return; // Don't reload for view
      case 'edit':
        handleEdit(articleId);
        return; // Don't reload for edit
    }
  } catch (error) {
    console.error(`Action '${action}' failed:`, error);
    showError(error.message || `Failed to ${action} article`);
    button.disabled = false;
    button.textContent = originalText;
  }
}

/**
 * Handle article approval
 */
async function handleApprove(articleId, button, originalText) {
  if (!confirm('Are you sure you want to approve this article?')) {
    button.disabled = false;
    button.textContent = originalText;
    return;
  }
  
  button.textContent = '⏳ Approving...';
  
  try {
    await approveArticle(articleId);
    button.textContent = '✓ Approved!';
    button.style.background = '#4caf50';
    
    showSuccess('Article approved successfully');
    
    // Reload after 1 second for visual feedback
    setTimeout(() => loadPendingArticles(), 1000);
  } catch (error) {
    throw new Error(`Failed to approve: ${error.message}`);
  }
}

/**
 * Handle article rejection
 */
async function handleReject(articleId, button, originalText) {
  if (!confirm('Are you sure you want to permanently delete this article?')) {
    button.disabled = false;
    button.textContent = originalText;
    return;
  }
  
  button.textContent = '⏳ Deleting...';
  
  try {
    await rejectArticle(articleId);
    button.textContent = '✓ Deleted!';
    button.style.background = '#f44336';
    
    showSuccess('Article rejected and deleted');
    
    // Reload after 1 second for visual feedback
    setTimeout(() => loadPendingArticles(), 1000);
  } catch (error) {
    throw new Error(`Failed to delete: ${error.message}`);
  }
}

/**
 * View article in new tab
 */
function handleView(articleId) {
  window.open(`/article.html?id=${articleId}`, '_blank');
}

/**
 * Edit article (redirect to edit page)
 */
function handleEdit(articleId) {
  // Implement edit page or redirect
  window.location.href = `/edit-article.html?id=${articleId}`;
}

// ============ MAIN ORCHESTRATION ============

/**
 * Load and display pending articles
 */
async function loadPendingArticles() {
  try {
    showLoading();
    const result = await fetchPendingArticles();
    renderArticleList(result.documents || []);
  } catch (error) {
    console.error('Failed to load articles:', error);
    showError(error.message || 'Failed to load articles');
    
    const container = document.getElementById('pendingList');
    container.innerHTML = `
      <div class="error-state">
        <p>❌ Error loading articles</p>
        <p style="color:#666;font-size:14px">${escapeHtml(error.message)}</p>
        <button onclick="loadPendingArticles()" style="margin-top:10px;padding:8px 16px;background:#c41e3a;color:white;border:none;border-radius:6px;cursor:pointer">
          🔄 Retry
        </button>
      </div>
    `;
  }
}

/**
 * Initialize admin panel
 */
async function initAdmin() {
  try {
    // Verify admin access first
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) return;
    
    // Load pending articles
    await loadPendingArticles();
    
    // Setup logout button
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      try {
        await window.account.deleteSession('current');
      } catch (e) {
        console.error('Logout error:', e);
      } finally {
        window.location.href = '/';
      }
    });
  } catch (error) {
    console.error('Admin initialization failed:', error);
    showError('Failed to initialize admin panel');
  }
}

// ============ PAGE INITIALIZATION ============

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}

// Handle visibility change (refresh when tab becomes active)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    loadPendingArticles();
  }
});
