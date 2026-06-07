// js/appwrite.js — NO SDK NEEDED
const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = 'khabardarjeeling';

window.APPWRITE_DB_ID = 'Khabar_db';
window.APPWRITE_COLLECTION_ID = 'articles';
window.APPWRITE_BUCKET_ID = 'article-image';

// Fake Appwrite objects so your index.js doesn't break
window.Query = {
  equal: (a,b) => `equal("${a}","${b}")`,
  orderDesc: (a) => `orderDesc("${a}")`,
  limit: (n) => `limit(${n})`
};

window.databases = {
  listDocuments: async function(dbId, colId, queries=[]) {
    const q = queries.map(q => `queries[]=${encodeURIComponent(q)}`).join('&');
    const url = `${ENDPOINT}/databases/${dbId}/collections/${colId}/documents?${q}`;
    const res = await fetch(url, {
      headers: { 'X-Appwrite-Project': PROJECT_ID }
    });
    if (!res.ok) throw new Error('Appwrite fetch failed');
    return await res.json();
  }
};

window.storage = {
  getFileView: (bucket, id) => `${ENDPOINT}/storage/buckets/${bucket}/files/${id}/view?project=${PROJECT_ID}`
};

window.account = {
  get: () => Promise.reject('not logged in'),
  deleteSession: () => Promise.resolve()
};

// --- Auth buttons (simple) ---
function renderAuth() {
  const el = document.getElementById('authButtons');
  if (el) el.innerHTML = `<a href="login.html" style="padding:6px 12px;background:#c41e3a;color:#fff;border-radius:4px;text-decoration:none;">Login</a>`;
}
document.addEventListener('DOMContentLoaded', renderAuth);

// hide loader
setTimeout(() => document.getElementById('gatekeeperLoader')?.remove(), 500);
