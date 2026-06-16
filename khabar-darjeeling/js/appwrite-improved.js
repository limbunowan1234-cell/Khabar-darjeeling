// js/appwrite-improved.js
// ✅ IMPROVED VERSION with Admin Team Support
// Features:
// 1. Unified configuration
// 2. Admin team/role checking
// 3. Comprehensive error handling
// 4. Helper functions for auth
// 5. Session management with cookies
// 6. Query builders for easy database queries

// ============================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================

// Your Appwrite API endpoint
window.ENDPOINT = 'https://api.khabardarjeeling.space/v1';  // Change to your endpoint

// Your Appwrite project ID
window.PROJECT = 'khabardarjeeling';  // Change to your project ID

// Database configuration
window.APPWRITE_DB_ID = 'Khabar_db';           // Your database ID
window.COL_ARTICLES = 'articles';              // Articles collection
window.COL_PROFILES = 'profiles';              // User profiles collection
window.COL_LIKES = 'likes';                    // Likes collection
window.COL_COMMENTS = 'comments';              // Comments collection
window.COL_PROFILE_LIKES = 'profile_likes';    // Profile likes
window.COL_PROFILE_COMMENTS = 'profile_comments'; // Profile comments

// Storage configuration
window.APPWRITE_BUCKET_ID = 'article-image';   // Image storage bucket

// Admin team configuration
window.ADMIN_TEAM_ID = 'admin';                // Your admin team ID
window.ADMIN_ROLE_ID = 'admin';                // Your admin role ID

// ============================================================
// HTTP HEADERS
// ============================================================

// Base headers for all requests
const H = {
  'X-Appwrite-Project': window.PROJECT
};

// Headers with Content-Type for POST/PATCH requests
const HJ = {
  'X-Appwrite-Project': window.PROJECT,
  'Content-Type': 'application/json'
};

window.HEADERS = HJ;

// ============================================================
// QUERY HELPERS - Build Appwrite queries easily
// ============================================================

window.Query = {
  // Exact match
  equal: (k, v) => JSON.stringify({
    method: 'equal',
    attribute: k,
    values: Array.isArray(v) ? v : [v]
  }),

  // Not equal
  notEqual: (k, v) => JSON.stringify({
    method: 'notEqual',
    attribute: k,
    values: Array.isArray(v) ? v : [v]
  }),

  // Sort descending
  orderDesc: (k) => JSON.stringify({
    method: 'orderDesc',
    attribute: k
  }),

  // Sort ascending
  orderAsc: (k) => JSON.stringify({
    method: 'orderAsc',
    attribute: k
  }),

  // Pagination: number of results
  limit: (n) => JSON.stringify({
    method: 'limit',
    values: [n]
  }),

  // Pagination: skip results
  offset: (n) => JSON.stringify({
    method: 'offset',
    values: [n]
  }),

  // Greater than
  greaterThan: (k, v) => JSON.stringify({
    method: 'greaterThan',
    attribute: k,
    values: [v]
  }),

  // Greater than or equal
  greaterThanEqual: (k, v) => JSON.stringify({
    method: 'greaterThanEqual',
    attribute: k,
    values: [v]
  }),

  // Less than
  lessThan: (k, v) => JSON.stringify({
    method: 'lessThan',
    attribute: k,
    values: [v]
  }),

  // Less than or equal
  lessThanEqual: (k, v) => JSON.stringify({
    method: 'lessThanEqual',
    attribute: k,
    values: [v]
  }),

  // Search (full text)
  search: (k, v) => JSON.stringify({
    method: 'search',
    attribute: k,
    values: [v]
  }),

  // Contains substring
  contains: (k, v) => JSON.stringify({
    method: 'contains',
    attribute: k,
    values: [v]
  })
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Generate unique ID for documents
 */
window.uniqueId = () => 'u' + Date.now() + Math.random().toString(36).slice(2, 9);

/**
 * ID generator - matches Appwrite's ID generation
 */
window.ID = {
  unique: () => window.uniqueId()
};

/**
 * Escape HTML to prevent XSS
 */
window.escapeHtml = (text) => {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
};

/**
 * Format date for display
 */
window.formatDate = (isoString) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Unknown date';
  }
};

/**
 * Handle API errors with helpful messages
 */
function handleApiError(error, context = '') {
  console.error(`API Error (${context}):`, error);

  let message = error.message || 'Unknown error occurred';

  // Enhance error message based on status code
  if (error.code === 401) {
    message = 'Session expired. Please login again.';
  } else if (error.code === 403) {
    message = 'Access denied. You do not have permission.';
  } else if (error.code === 404) {
    message = 'Resource not found.';
  } else if (error.code === 422) {
    message = 'Invalid data provided. Please check your input.';
  } else if (error.code === 429) {
    message = 'Too many requests. Please wait a moment.';
  } else if (error.code === 500) {
    message = 'Server error. Please try again later.';
  }

  return Object.assign(new Error(message), { code: error.code, original: error });
}

// ============================================================
// DATABASES API - Query and manage documents
// ============================================================

window.databases = {
  /**
   * List documents from a collection with optional queries
   */
  listDocuments: async (dbId, colId, queries = []) => {
    try {
      const qs = queries
        .map(q => `queries[]=${encodeURIComponent(q)}`)
        .join('&');

      const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents${qs ? '?' + qs : ''}`;

      const res = await fetch(url, {
        headers: H,
        credentials: 'include'  // Send cookies automatically
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw handleApiError({
          code: res.status,
          message: error.message || 'Failed to list documents'
        }, 'listDocuments');
      }

      return res.json();
    } catch (error) {
      throw handleApiError(error, 'listDocuments');
    }
  },

  /**
   * Get a single document by ID
   */
  getDocument: async (dbId, colId, docId) => {
    try {
      const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents/${docId}`;

      const res = await fetch(url, {
        headers: H,
        credentials: 'include'
      });

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: 'Failed to get document'
        }, 'getDocument');
      }

      return res.json();
    } catch (error) {
      throw handleApiError(error, 'getDocument');
    }
  },

  /**
   * Create a new document
   */
  createDocument: async (dbId, colId, docId, data) => {
    try {
      const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents`;

      const res = await fetch(url, {
        method: 'POST',
        headers: HJ,
        credentials: 'include',
        body: JSON.stringify({
          documentId: docId || 'unique()',
          data
        })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw handleApiError({
          code: res.status,
          message: error.message || 'Failed to create document'
        }, 'createDocument');
      }

      return res.json();
    } catch (error) {
      throw handleApiError(error, 'createDocument');
    }
  },

  /**
   * Update an existing document
   */
  updateDocument: async (dbId, colId, docId, data) => {
    try {
      const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents/${docId}`;

      const res = await fetch(url, {
        method: 'PATCH',
        headers: HJ,
        credentials: 'include',
        body: JSON.stringify({ data })
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw handleApiError({
          code: res.status,
          message: error.message || 'Failed to update document'
        }, 'updateDocument');
      }

      return res.json();
    } catch (error) {
      throw handleApiError(error, 'updateDocument');
    }
  },

  /**
   * Delete a document
   */
  deleteDocument: async (dbId, colId, docId) => {
    try {
      const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents/${docId}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: H,
        credentials: 'include'
      });

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: 'Failed to delete document'
        }, 'deleteDocument');
      }

      return true;
    } catch (error) {
      throw handleApiError(error, 'deleteDocument');
    }
  }
};

// ============================================================
// STORAGE API - Manage files
// ============================================================

window.storage = {
  /**
   * Upload a file to storage
   */
  createFile: async (bucketId, fileId, file) => {
    try {
      const form = new FormData();
      form.append('fileId', fileId || 'unique()');
      form.append('file', file);

      const url = `${window.ENDPOINT}/storage/buckets/${bucketId}/files`;

      const res = await fetch(url, {
        method: 'POST',
        headers: H,  // Don't set Content-Type with FormData
        credentials: 'include',
        body: form
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw handleApiError({
          code: res.status,
          message: error.message || 'File upload failed'
        }, 'createFile');
      }

      return res.json();
    } catch (error) {
      throw handleApiError(error, 'createFile');
    }
  },

  /**
   * Get file view URL with optional preview parameters
   */
  getFileViewUrl: (bucketId, fileId, width = null, height = null, quality = 80) => {
    let url = `${window.ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${window.PROJECT}`;

    if (width) url += `&width=${width}`;
    if (height) url += `&height=${height}`;
    if (quality) url += `&quality=${quality}`;

    return url;
  },

  /**
   * Get file preview URL (generates thumbnail)
   */
  getFilePreviewUrl: (bucketId, fileId, width = 300, height = 200, quality = 80) => {
    return `${window.ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${window.PROJECT}&width=${width}&height=${height}&quality=${quality}`;
  },

  /**
   * Delete a file from storage
   */
  deleteFile: async (bucketId, fileId) => {
    try {
      const url = `${window.ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: H,
        credentials: 'include'
      });

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: 'Failed to delete file'
        }, 'deleteFile');
      }

      return true;
    } catch (error) {
      throw handleApiError(error, 'deleteFile');
    }
  }
};

// ============================================================
// ACCOUNT API - User authentication and profile
// ============================================================

window.account = {
  /**
   * Get current user account
   */
  get: async () => {
    try {
      const res = await fetch(`${window.ENDPOINT}/account`, {
        headers: H,
        credentials: 'include'
      });

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: 'Not authenticated'
        }, 'account.get');
      }

      return res.json();
    } catch (error) {
      throw handleApiError(error, 'account.get');
    }
  },

  /**
   * Create a session with email and password
   */
  createEmailPasswordSession: async (email, password) => {
    try {
      const res = await fetch(`${window.ENDPOINT}/account/sessions/email`, {
        method: 'POST',
        headers: HJ,
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: data.message || 'Login failed'
        }, 'createEmailPasswordSession');
      }

      return data;
    } catch (error) {
      throw handleApiError(error, 'createEmailPasswordSession');
    }
  },

  /**
   * Create a new user account
   */
  create: async (userId, email, password, name) => {
    try {
      const res = await fetch(`${window.ENDPOINT}/account`, {
        method: 'POST',
        headers: HJ,
        credentials: 'include',
        body: JSON.stringify({
          userId: userId || 'unique()',
          email,
          password,
          name
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: data.message || 'Signup failed'
        }, 'account.create');
      }

      return data;
    } catch (error) {
      throw handleApiError(error, 'account.create');
    }
  },

  /**
   * Request password recovery email
   */
  createRecovery: async (email, url) => {
    try {
      const res = await fetch(`${window.ENDPOINT}/account/recovery`, {
        method: 'POST',
        headers: HJ,
        credentials: 'include',
        body: JSON.stringify({ email, url })
      });

      const data = await res.json();

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: data.message || 'Recovery failed'
        }, 'createRecovery');
      }

      return data;
    } catch (error) {
      throw handleApiError(error, 'createRecovery');
    }
  },

  /**
   * Complete password recovery
   */
  updateRecovery: async (userId, secret, password) => {
    try {
      const res = await fetch(`${window.ENDPOINT}/account/recovery`, {
        method: 'PUT',
        headers: HJ,
        credentials: 'include',
        body: JSON.stringify({
          userId,
          secret,
          password,
          passwordAgain: password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: data.message || 'Reset failed'
        }, 'updateRecovery');
      }

      return data;
    } catch (error) {
      throw handleApiError(error, 'updateRecovery');
    }
  },

  /**
   * Update user name
   */
  updateName: async (name) => {
    try {
      const res = await fetch(`${window.ENDPOINT}/account/name`, {
        method: 'PATCH',
        headers: HJ,
        credentials: 'include',
        body: JSON.stringify({ name })
      });

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: 'Failed to update name'
        }, 'updateName');
      }

      return res.json();
    } catch (error) {
      throw handleApiError(error, 'updateName');
    }
  },

  /**
   * Update user preferences
   */
  updatePrefs: async (prefs) => {
    try {
      const res = await fetch(`${window.ENDPOINT}/account/prefs`, {
        method: 'PATCH',
        headers: HJ,
        credentials: 'include',
        body: JSON.stringify({ prefs })
      });

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: 'Failed to update preferences'
        }, 'updatePrefs');
      }

      return res.json();
    } catch (error) {
      throw handleApiError(error, 'updatePrefs');
    }
  },

  /**
   * Delete current session (logout)
   */
  deleteSession: async (sessionId = 'current') => {
    try {
      const res = await fetch(`${window.ENDPOINT}/account/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: H,
        credentials: 'include'
      });

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: 'Failed to delete session'
        }, 'deleteSession');
      }

      return true;
    } catch (error) {
      throw handleApiError(error, 'deleteSession');
    }
  }
};

// ============================================================
// TEAMS API - Role-based access control
// ============================================================

window.teams = {
  /**
   * Get a team by ID
   */
  get: async (teamId) => {
    try {
      const res = await fetch(`${window.ENDPOINT}/teams/${teamId}`, {
        headers: H,
        credentials: 'include'
      });

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: 'Failed to get team'
        }, 'teams.get');
      }

      return res.json();
    } catch (error) {
      throw handleApiError(error, 'teams.get');
    }
  },

  /**
   * Get current user's memberships in a team
   */
  getMemberships: async (teamId) => {
    try {
      const res = await fetch(`${window.ENDPOINT}/teams/${teamId}/memberships`, {
        headers: H,
        credentials: 'include'
      });

      if (!res.ok) {
        throw handleApiError({
          code: res.status,
          message: 'Failed to get memberships'
        }, 'teams.getMemberships');
      }

      return res.json();
    } catch (error) {
      throw handleApiError(error, 'teams.getMemberships');
    }
  }
};

// ============================================================
// HELPER FUNCTIONS - Common operations
// ============================================================

/**
 * Check if current user is admin
 * Uses team membership with admin role
 */
window.isUserAdmin = async () => {
  try {
    const user = await window.account.get();

    // Check if user is in admin team
    // Appwrite stores team memberships in the user object
    if (!user.memberships) {
      return false;
    }

    // Check for admin team membership
    const isAdmin = user.memberships.some(m =>
      m.teamId === window.ADMIN_TEAM_ID &&
      m.roles?.includes(window.ADMIN_ROLE_ID)
    );

    return isAdmin;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
};

/**
 * Verify admin access - throw error if not admin
 */
window.verifyAdmin = async () => {
  try {
    const user = await window.account.get();

    if (!user.memberships) {
      throw new Error('Access denied: No team memberships');
    }

    const isAdmin = user.memberships.some(m =>
      m.teamId === window.ADMIN_TEAM_ID &&
      m.roles?.includes(window.ADMIN_ROLE_ID)
    );

    if (!isAdmin) {
      throw new Error(`Access denied: Admin role required. You are: ${user.email}`);
    }

    return user;
  } catch (error) {
    throw handleApiError(error, 'verifyAdmin');
  }
};

/**
 * Get or create user profile
 */
window.getProfile = async (userId) => {
  try {
    const res = await window.databases.listDocuments(
      window.APPWRITE_DB_ID,
      window.COL_PROFILES,
      [window.Query.equal('userId', userId), window.Query.limit(1)]
    );

    return res.documents[0] || null;
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
};

/**
 * Create or update user profile
 */
window.upsertProfile = async (userId, fields) => {
  try {
    const existing = await window.getProfile(userId);

    if (existing) {
      return await window.databases.updateDocument(
        window.APPWRITE_DB_ID,
        window.COL_PROFILES,
        existing.$id,
        fields
      );
    }

    return await window.databases.createDocument(
      window.APPWRITE_DB_ID,
      window.COL_PROFILES,
      'unique()',
      {
        userId,
        joinedAt: new Date().toISOString(),
        ...fields
      }
    );
  } catch (error) {
    throw handleApiError(error, 'upsertProfile');
  }
};

/**
 * Logout current user
 */
window.logout = async () => {
  try {
    await window.account.deleteSession('current');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always redirect, even if logout fails
    window.location.href = '/login.html';
  }
};

// ============================================================
// INITIALIZATION
// ============================================================

// Log configuration on page load (helpful for debugging)
window.addEventListener('load', () => {
  if (window.location.hostname !== 'localhost') {
    console.log('📍 Appwrite Configuration Loaded');
    console.log(`   Endpoint: ${window.ENDPOINT}`);
    console.log(`   Project: ${window.PROJECT}`);
    console.log(`   Database: ${window.APPWRITE_DB_ID}`);
  }
});

console.log('✅ Appwrite SDK initialized (improved.js v1.0.1)');
