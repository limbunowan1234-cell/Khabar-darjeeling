// js/appwrite.js
// Khabar Darjeeling - Cloudflare + Appwrite NYC fix
// Waits for CDN, then initializes client safely

(function () {
  const CDN_CHECK_INTERVAL = 50;   // ms between checks
  const CDN_TIMEOUT = 3000;        // give CDN 3 seconds max

  function waitForAppwrite() {
    return new Promise((resolve, reject) => {
      let elapsed = 0;
      const timer = setInterval(() => {
        if (window.Appwrite) {
          clearInterval(timer);
          resolve(window.Appwrite);
        } else if ((elapsed += CDN_CHECK_INTERVAL) > CDN_TIMEOUT) {
          clearInterval(timer);
          reject(new Error('Appwrite SDK not found! Check the CDN script tag.'));
        }
      }, CDN_CHECK_INTERVAL);
    });
  }

  // Expose a real ready promise your other code can await
  window.AppwriteReady = waitForAppwrite()
    .then(({ Client, Databases, Storage, Account, ID, Query }) => {
      const client = new Client()
        .setEndpoint('https://nyc.cloud.appwrite.io/v1')
        .setProject('khabardarjeeling');

      const databases = new Databases(client);
      const storage = new Storage(client);
      const account = new Account(client);

      const APPWRITE_DB_ID = 'Khabar_db';
      const APPWRITE_COLLECTION_ID = 'articles';
      const APPWRITE_BUCKET_ID = 'article-image';

      // Keep all your existing globals for compatibility
      Object.assign(window, {
        client,
        account,
        databases,
        database: databases,  // legacy alias
        storage,
        ID,
        Query,
        APPWRITE_DB_ID,
        APPWRITE_COLLECTION_ID,
        APPWRITE_BUCKET_ID,
        APPWRITEDBID: APPWRITE_DB_ID,
        APPWRITECOLLECTIONID: APPWRITE_COLLECTION_ID,
        APPWRITEBUCKETID: APPWRITE_BUCKET_ID,
        APPWRITE_ENDPOINT: 'https://nyc.cloud.appwrite.io/v1',
        APPWRITE_PROJECT_ID: 'khabardarjeeling'
      });

      console.log('✅ Appwrite successfully initialized');
      return client;
    })
    .catch(err => {
      console.error('❌', err.message);
      // Re-throw so your UI can catch it if needed
      throw err;
    });
})();