// js/appwrite.js?v=133 — Khabar Darjeeling FINAL
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'khabardarjeeling';

// === Your Appwrite IDs (from your screenshots) ===
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

// === Init ===
const client = new Appwrite.Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

window.client = client;
window.databases = new Appwrite.Databases(client);
window.storage = new Appwrite.Storage(client);
window.account = new Appwrite.Account(client);
window.Query = Appwrite.Query;

// Non-blocking auth
window.currentUser = null;
account.get().then(u => window.currentUser = u).catch(() => {});

// Kill old loader if it appears
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelectorAll('*').forEach(el => {
      if (el.textContent?.includes('Checking authentication')) {
        el.closest('div')?.remove();
      }
    });
  }, 300);
});