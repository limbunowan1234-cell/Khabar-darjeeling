// js/appwrite.js?v=131 — Khabar Darjeeling
// 1. Appwrite setup
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'khabardarjeeling';

// 2. >>> REPLACE THESE WITH YOUR REAL IDs FROM APPWRITE CONSOLE <<<
window.APPWRITE_DB_ID = 'REPLACE_WITH_YOUR_DATABASE_ID';           // e.g. '68a1b2c3d4e5f6...'
window.APPWRITE_COLLECTION_ID = 'REPLACE_WITH_YOUR_ARTICLES_ID';   // e.g. 'articles'

// 3. Initialize client (uses the CDN you already load in index.html)
const client = new Appwrite.Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// 4. Expose globals for index.js
window.client = client;
window.databases = new Appwrite.Databases(client);
window.storage = new Appwrite.Storage(client);
window.account = new Appwrite.Account(client);
window.Query = Appwrite.Query;

// 5. Non-blocking auth check — does NOT show a loader
// If user is logged in, we store it. If not, we just continue as guest.
window.currentUser = null;
window.account.get()
  .then(user => { window.currentUser = user; })
  .catch(() => { window.currentUser = null; });

// 6. Remove any old "Checking authentication..." overlay if it exists
// (this cleans up the screen you were stuck on)
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelectorAll('div, p').forEach(el => {
      if (el.textContent && el.textContent.includes('Checking authentication')) {
        const overlay = el.closest('div[style*="fixed"]') || el.parentElement;
        if (overlay) overlay.remove();
      }
    });
  }, 500);
});