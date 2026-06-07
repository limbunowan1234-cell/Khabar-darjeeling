// js/appwrite.js?v=134 — with auth buttons restored
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'khabardarjeeling';

window.APPWRITE_DB_ID = 'Khabar_db';
window.APPWRITE_COLLECTION_ID = 'articles';
window.APPWRITE_BUCKET_ID = 'article-image';

window.COLLECTIONS = {
  ARTICLES: 'articles',
  PROFILES: 'profiles',
  LIKES: 'likes',
  COMMENTS: 'comments',
  PROFILE_LIKES: 'profile_likes',
  PROFILE_COMMENTS: 'profile_comments'
};

const client = new Appwrite.Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

window.client = client;
window.databases = new Appwrite.Databases(client);
window.storage = new Appwrite.Storage(client);
window.account = new Appwrite.Account(client);
window.Query = Appwrite.Query;

// --- AUTH UI ---
function renderAuth(user) {
  const desktop = document.getElementById('authButtons');
  const mobile = document.getElementById('mobileAuthContainer');
  if (!desktop) return;

  if (user) {
    const isAdmin = user.labels?.includes('admin'); // set 'admin' label in Appwrite console
    desktop.innerHTML = `
      <span style="font-size:13px;margin-right:8px;">Hi, ${user.name || 'User'}</span>
      ${isAdmin ? '<a href="admin.html" style="padding:6px 12px;background:#c41e3a;color:#fff;border-radius:4px;text-decoration:none;font-size:13px;">Admin</a>' : ''}
      <button id="logoutBtn" style="padding:6px 12px;border:1px solid #ddd;background:#fff;border-radius:4px;cursor:pointer;font-size:13px;">Logout</button>
    `;
    document.getElementById('logoutBtn').onclick = async () => {
      await account.deleteSession('current');
      location.reload();
    };
    if (mobile) mobile.innerHTML = `<a href="${isAdmin ? 'admin.html' : 'profile.html'}">${isAdmin ? 'Admin' : 'Profile'}</a>`;
  } else {
    desktop.innerHTML = `<a href="login.html" style="padding:6px 14px;background:#c41e3a;color:#fff;border-radius:4px;text-decoration:none;font-size:13px;">Login</a>`;
    if (mobile) mobile.innerHTML = `<a href="login.html">Login</a>`;
  }
}

window.currentUser = null;
account.get()
  .then(user => { window.currentUser = user; renderAuth(user); })
  .catch(() => renderAuth(null));