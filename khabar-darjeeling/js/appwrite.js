// js/appwrite.js

if (!window.Appwrite) {
    console.error('❌ Appwrite SDK not found! Make sure the CDN script is loaded before appwrite.js');
} else {
    const { Client, Databases, Storage, Account, ID, Query } = window.Appwrite;

    const client = new Client()
        .setEndpoint('https://nyc.cloud.appwrite.io/v1')
        .setProject('khabardarjeeling');

    const databases = new Databases(client);
    const storage = new Storage(client);
    const account = new Account(client);

    const APPWRITE_DB_ID = 'Khabar_db';
    const APPWRITE_COLLECTION_ID = 'articles';
    const APPWRITE_BUCKET_ID = 'article-image';

    window.client = client;
    window.account = account;
    window.databases = databases;
    window.database = databases;
    window.storage = storage;
    window.ID = ID;
    window.Query = Query;
    window.APPWRITE_DB_ID = APPWRITE_DB_ID;
    window.APPWRITE_COLLECTION_ID = APPWRITE_COLLECTION_ID;
    window.APPWRITE_BUCKET_ID = APPWRITE_BUCKET_ID;

    console.log('✅ Appwrite successfully initialized');
    console.log('Current Bucket ID:', window.APPWRITE_BUCKET_ID);
}
