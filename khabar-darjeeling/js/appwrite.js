// NO SDK - direct fetch
window.ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT = 'khabardarjeeling';
const DB = 'Khabar_db';
const COL = 'articles';

window.APPWRITE_DB_ID = DB;
window.APPWRITE_COLLECTION_ID = COL;
window.APPWRITE_BUCKET_ID = 'article-image';

window.Query = {
  equal: (k,v) => `equal("${k}","${v}")`,
  orderDesc: (k) => `orderDesc("${k}")`,
  limit: (n) => `limit(${n})`
};

window.databases = {
  listDocuments: async (dbId, colId, queries=[]) => {
    const qs = queries.map(q=>`queries[]=${encodeURIComponent(q)}`).join('&');
    const url = `${window.ENDPOINT}/databases/${dbId}/collections/${colId}/documents?${qs}`;
    const res = await fetch(url, { headers: { 'X-Appwrite-Project': PROJECT }});
    return await res.json();
  }
};

window.account = { get: ()=>Promise.reject(), deleteSession: ()=>Promise.resolve() };

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('authButtons').innerHTML = '<a href="login.html" style="background:#c41e3a;color:#fff;padding:6px 12px;border-radius:4px;text-decoration:none">Login</a>';
  setTimeout(()=>document.getElementById('gatekeeperLoader')?.remove(), 300);
});