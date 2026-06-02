// js/appwrite.js
const { Client, Databases, Storage, Account, ID, Query } = window.Appwrite;

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('khabardarjeeling');

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

// Appwrite IDs - exact match from console
const APPWRITE_DB_ID = 'Khabar_db';           // Capital K
const APPWRITE_COLLECTION_ID = 'articles';    
const APPWRITE_BUCKET_ID = 'article_images';  // Underscore

// Make available globally for other scripts
window.account = account;
window.database = databases;
window.storage = storage;
window.ID = ID;
window.Query = Query;
window.APPWRITE_DB_ID = APPWRITE_DB_ID;
window.APPWRITE_COLLECTION_ID = APPWRITE_COLLECTION_ID;
window.APPWRITE_BUCKET_ID = APPWRITE_BUCKET_ID;