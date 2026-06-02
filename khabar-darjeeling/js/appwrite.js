// js/appwrite.js
const { Client, Databases, Storage, Account, ID, Query } = window.Appwrite;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('khabardarjeeling');

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

// IMPORTANT: Check Appwrite Console → Database → Copy exact Database ID
// Most likely 'khabar_db' lowercase, not 'Khabar_db'
const APPWRITE_DB_ID = 'khabar_db'; // ← CHANGE THIS to match your actual DB ID
const APPWRITE_COLLECTION_ID = 'articles';
const APPWRITE_BUCKET_ID = 'article-images';

// Make available globally
window.account = account;
window.database = databases;
window.storage = storage;
window.ID = ID;
window.Query = Query;
window.APPWRITE_DB_ID = APPWRITE_DB_ID;
window.APPWRITE_COLLECTION_ID = APPWRITE_COLLECTION_ID;
window.APPWRITE_BUCKET_ID = APPWRITE_BUCKET_ID;