(function () {
  const init = () => {
    if (!window.Appwrite) {
      console.error('Appwrite SDK not found! Check the CDN script tag.');
      return;
    }

    const { Client, Databases, Storage, Account, ID, Query } = window.Appwrite;

    const client = new Client()
      .setEndpoint('https://nyc.cloud.appwrite.io/v1')
      .setProject('khabardarjeeling');

    const account = new Account(client);
    const databases = new Databases(client);
    const storage = new Storage(client);

    window.client = client;
    window.account = account;
    window.databases = databases;
    window.database = databases;
    window.storage = storage;
    window.ID = ID;
    window.Query = Query;

    window.APPWRITE_DB_ID = 'Khabar_db';
    window.APPWRITE_COLLECTION_ID = 'articles';
    window.APPWRITE_BUCKET_ID = 'article-image';

    window.APPWRITEDBID = window.APPWRITE_DB_ID;
    window.APPWRITECOLLECTIONID = window.APPWRITE_COLLECTION_ID;
    window.APPWRITEBUCKETID = window.APPWRITE_BUCKET_ID;

    window.AppwriteReady = Promise.resolve();
    console.log('✅ Appwrite successfully initialized');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
