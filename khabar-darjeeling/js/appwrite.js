// js/appwrite.js — NO SDK, direct fetch only
window.ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
window.PROJECT  = 'khabardarjeeling';
window.HEADERS  = {
  'X-Appwrite-Project': window.PROJECT,
  'Content-Type': 'application/json'
};

// ── Legacy aliases (some pages used these names) ──
window.APPWRITE_ENDPOINT   = window.ENDPOINT;
window.APPWRITE_PROJECT_ID = window.PROJECT;

// ── Database + collection IDs ──
window.APPWRITE_DB_ID         = 'Khabar_db';
window.APPWRITE_COLLECTION_ID = 'articles';
window.APPWRITE_BUCKET_ID     = 'article-image';
window.COL_ARTICLES           = 'articles';
window.COL_PROFILES           = 'profiles';
window.COL_LIKES              = 'likes';
window.COL_COMMENTS           = 'comments';
window.COL_PROFILE_LIKES      = 'profile_likes';
window.COL_PROFILE_COMMENTS   = 'profile_comments';

// ── Query helpers (Appwrite 14 / Cloud — JSON object format) ──
window.Query = {
  equal:            (k, v) => JSON.stringify({ method: 'equal',            attribute: k, values: Array.isArray(v) ? v : [v] }),
  notEqual:         (k, v) => JSON.stringify({ method: 'notEqual',         attribute: k, values: Array.isArray(v) ? v : [v] }),
  orderDesc:        (k)    => JSON.stringify({ method: 'orderDesc',        attribute: k }),
  orderAsc:         (k)    => JSON.stringify({ method: 'orderAsc',         attribute: k }),
  limit:            (n)    => JSON.stringify({ method: 'limit',            values: [n] }),
  offset:           (n)    => JSON.stringify({ method: 'offset',           values: [n] }),
  greaterThan:      (k, v) => JSON.stringify({ method: 'greaterThan',      attribute: k, values: [v] }),
  greaterThanEqual: (k, v) => JSON.stringify({ method: 'greaterThanEqual', attribute: k, values: [v] }),
  lessThan:         (k, v) => JSON.stringify({ method: 'lessThan',         attribute: k, values: [v] }),
  lessThanEqual:    (k, v) => JSON.stringify({ method: 'lessThanEqual',    attribute: k, values: [v] }),
  search:           (k, v) => JSON.stringify({ method: 'search',           attribute: k, values: [v] }),
  contains:         (k, v) => JSON.stringify({ method: 'contains',         attribute: k, values: [v] }),
};

// Unique ID generator (Appwrite-safe, <=36 chars, valid chars only)
window.uniqueId = () => 'u' + Date.now() + Math.random().toString(36).slice(2, 9);
// Alias so old `window.ID.unique()` calls keep working
window.ID = { unique: () => window.uniqueId() };

// ── Databases API ──
window.databases = {
  listDocuments: async (dbId, colId, queries = []) => {
    const qs  = queries.map(q => `queries[]=${encodeURIComponent(q)}`).join('&');
    const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents${qs ? '?' + qs : ''}`;
    const res = await fetch(url, {
      headers: { 'X-Appwrite-Project': window.PROJECT },
      credentials: 'include'
    });
    if (!res.ok) throw Object.assign(new Error('listDocuments failed'), { code: res.status });
    return res.json();
  },

  getDocument: async (dbId, colId, docId) => {
    const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents/${docId}`;
    const res = await fetch(url, {
      headers: { 'X-Appwrite-Project': window.PROJECT },
      credentials: 'include'
    });
    if (!res.ok) throw Object.assign(new Error('getDocument failed'), { code: res.status });
    return res.json();
  },

  createDocument: async (dbId, colId, docId, data) => {
    const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { ...window.HEADERS, 'X-Appwrite-Project': window.PROJECT },
      credentials: 'include',
      body: JSON.stringify({ documentId: docId || 'unique()', data })
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw Object.assign(new Error(e.message || 'createDocument failed'), { code: res.status });
    }
    return res.json();
  },

  updateDocument: async (dbId, colId, docId, data) => {
    const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents/${docId}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { ...window.HEADERS, 'X-Appwrite-Project': window.PROJECT },
      credentials: 'include',
      body: JSON.stringify({ data })
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw Object.assign(new Error(e.message || 'updateDocument failed'), { code: res.status });
    }
    return res.json();
  },

  deleteDocument: async (dbId, colId, docId) => {
    const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents/${docId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'X-Appwrite-Project': window.PROJECT },
      credentials: 'include'
    });
    if (!res.ok) throw Object.assign(new Error('deleteDocument failed'), { code: res.status });
    return true;
  }
};

// ── Storage API (file upload via multipart) ──
window.storage = {
  createFile: async (bucketId, fileId, file) => {
    const form = new FormData();
    form.append('fileId', fileId || 'unique()');
    form.append('file', file);
    const url = `${window.ENDPOINT}/storage/buckets/${bucketId}/files`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'X-Appwrite-Project': window.PROJECT },  // no Content-Type — browser sets multipart boundary
      credentials: 'include',
      body: form
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw Object.assign(new Error(e.message || 'File upload failed'), { code: res.status });
    }
    return res.json();
  },

  getFileViewUrl: (bucketId, fileId) =>
    `${window.ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${window.PROJECT}`,

  deleteFile: async (bucketId, fileId) => {
    const url = `${window.ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'X-Appwrite-Project': window.PROJECT },
      credentials: 'include'
    });
    return res.ok;
  }
};

// ── Account API ──
window.account = {
  get: async () => {
    const res = await fetch(`${window.ENDPOINT}/account`, {
      headers: { 'X-Appwrite-Project': window.PROJECT },
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  updateName: async (name) => {
    const res = await fetch(`${window.ENDPOINT}/account/name`, {
      method: 'PATCH',
      headers: { ...window.HEADERS, 'X-Appwrite-Project': window.PROJECT },
      credentials: 'include',
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('updateName failed');
    return res.json();
  },

  updatePrefs: async (prefs) => {
    const res = await fetch(`${window.ENDPOINT}/account/prefs`, {
      method: 'PATCH',
      headers: { ...window.HEADERS, 'X-Appwrite-Project': window.PROJECT },
      credentials: 'include',
      body: JSON.stringify({ prefs })
    });
    if (!res.ok) throw new Error('updatePrefs failed');
    return res.json();
  },

  deleteSession: async (sessionId = 'current') => {
    const res = await fetch(`${window.ENDPOINT}/account/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'X-Appwrite-Project': window.PROJECT },
      credentials: 'include'
    });
    return res.ok;
  }
};

window.logout = async () => {
  try { await window.account.deleteSession('current'); } catch {}
  location.href = 'login.html';
};

// ── Profile helpers (profiles collection: userId, displayName, userName, bio, avatarUrl, coverUrl, joinedAT) ──
window.getProfile = async (userId) => {
  try {
    const res = await window.databases.listDocuments(
      window.APPWRITE_DB_ID, window.COL_PROFILES,
      [ window.Query.equal('userId', userId), window.Query.limit(1) ]
    );
    return res.documents[0] || null;
  } catch { return null; }
};

// Create or update a user's profile row
window.upsertProfile = async (userId, fields) => {
  const existing = await window.getProfile(userId);
  if (existing) {
    return window.databases.updateDocument(
      window.APPWRITE_DB_ID, window.COL_PROFILES, existing.$id, fields
    );
  }
  return window.databases.createDocument(
    window.APPWRITE_DB_ID, window.COL_PROFILES, 'unique()',
    { userId, joinedAT: new Date().toISOString(), ...fields }
  );
};
