// js/appwrite.js — NO SDK, direct fetch only
window.ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
window.PROJECT  = 'khabardarjeeling';
window.HEADERS  = {
  'X-Appwrite-Project': window.PROJECT,
  'Content-Type': 'application/json'
};

window.APPWRITE_DB_ID       = 'Khabar_db';
window.APPWRITE_COLLECTION_ID = 'articles';
window.APPWRITE_BUCKET_ID   = 'article-image';

window.Query = {
  equal:     (k, v) => `equal("${k}","${v}")`,
  orderDesc: (k)    => `orderDesc("${k}")`,
  limit:     (n)    => `limit(${n})`
};

window.databases = {
  listDocuments: async (dbId, colId, queries = []) => {
    const qs  = queries.map(q => `queries[]=${encodeURIComponent(q)}`).join('&');
    const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents?${qs}`;
    const res = await fetch(url, { headers: { 'X-Appwrite-Project': window.PROJECT } });
    return res.json();
  }
};

// Real auth check using session cookie
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
    await fetch(`${window.ENDPOINT}/account/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'X-Appwrite-Project': window.PROJECT },
      credentials: 'include'
    });
  }
};

// Auth buttons + gatekeeper for index.html
document.addEventListener('DOMContentLoaded', async () => {
  const authButtons = document.getElementById('authButtons');

  if (authButtons) {
    try {
      const user = await window.account.get();
      authButtons.innerHTML = `
        <span style="font-size:13px;color:#606770;margin-right:8px">Hi, ${user.name.split(' ')[0]}</span>
        <button onclick="window.logout()" style="background:#c41e3a;color:#fff;padding:6px 12px;border-radius:4px;border:none;cursor:pointer;font-size:13px">Logout</button>
      `;
    } catch {
      authButtons.innerHTML = `
        <a href="login.html" style="background:#c41e3a;color:#fff;padding:6px 12px;border-radius:4px;text-decoration:none;font-size:13px">Login</a>
      `;
    }
  }

  setTimeout(() => document.getElementById('gatekeeperLoader')?.remove(), 300);
});

window.logout = async () => {
  try { await window.account.deleteSession('current'); } catch {}
  location.href = 'login.html';
};
