window.ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
window.PROJECT_ID = 'khabardarjeeling';

window.databases = {
  listDocuments: async () => {
    const url = `${window.ENDPOINT}/databases/Khabar_db/collections/articles/documents?queries[]=${encodeURIComponent('orderDesc("$createdAt")')}&queries[]=${encodeURIComponent('limit(20)')}`;
    const res = await fetch(url, { headers: { 'X-Appwrite-Project': window.PROJECT_ID }});
    return res.json();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('authButtons').innerHTML = '<a href="login.html" class="btn-login">Login</a>';
  setTimeout(() => document.getElementById('gatekeeperLoader')?.remove(), 200);
});