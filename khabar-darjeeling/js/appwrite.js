// js/appwrite.js — NO SDK, direct fetch only
window.ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
window.PROJECT  = 'khabardarjeeling';
window.HEADERS  = {
  'X-Appwrite-Project': window.PROJECT,
  'Content-Type': 'application/json'
};

// ── Database + collection IDs ──
window.APPWRITE_DB_ID            = 'Khabar_db';
window.APPWRITE_COLLECTION_ID    = 'articles';        // main articles
window.APPWRITE_BUCKET_ID        = 'article-image';
window.COL_ARTICLES              = 'articles';
window.COL_PROFILES              = 'profiles';
window.COL_LIKES                 = 'likes';           // articleId + userId (one row per like)
window.COL_COMMENTS              = 'comments';        // articleId, authorName, commentText, userId...
window.COL_PROFILE_LIKES         = 'profile_likes';
window.COL_PROFILE_COMMENTS      = 'profile_comments';

// ── Query helpers (Appwrite REST string format) ──
window.Query = {
  equal:            (k, v) => `equal("${k}",["${v}"])`,
  notEqual:         (k, v) => `notEqual("${k}",["${v}"])`,
  orderDesc:        (k)    => `orderDesc("${k}")`,
  orderAsc:         (k)    => `orderAsc("${k}")`,
  limit:            (n)    => `limit(${n})`,
  offset:           (n)    => `offset(${n})`,
  greaterThan:      (k, v) => `greaterThan("${k}","${v}")`,
  greaterThanEqual: (k, v) => `greaterThanEqual("${k}","${v}")`,
  lessThan:         (k, v) => `lessThan("${k}","${v}")`,
  lessThanEqual:    (k, v) => `lessThanEqual("${k}","${v}")`,
  search:           (k, v) => `search("${k}","${v}")`,
  contains:         (k, v) => `contains("${k}","${v}")`,
};

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
    if (!res.ok) throw Object.assign(new Error('createDocument failed'), { code: res.status });
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
    if (!res.ok) throw Object.assign(new Error('updateDocument failed'), { code: res.status });
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

// Unique ID generator (Appwrite-safe, <=36 chars)
window.uniqueId = () => 'u' + Date.now() + Math.random().toString(36).slice(2, 9);
