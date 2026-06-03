// js/appwrite.js

// 1. Check if Appwrite SDK is loaded from CDN
if (!window.Appwrite) {
    console.error('Appwrite SDK not found! Make sure the CDN script is loaded before this file.');
}

const { Client, Databases, Storage, Account, ID, Query } = window.Appwrite;

// 2. Initialize the Client
const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('khabardarjeeling'); // Double check if this is your ID or Name

// 3. Initialize Services
const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

// 4. Constants for Database/Storage
const APPWRITE_DB_ID = 'Khabar_db';
const APPWRITE_COLLECTION_ID = 'articles';
const APPWRITE_BUCKET_ID = 'article-image';

// 5. Global Export (Critical for submit.js and admin.js)
// We assign them to window explicitly to survive Cloudflare minification
window.client = client;
window.account = account;
window.databases = databases;
window.storage = storage;
window.ID = ID;
window.Query = Query;
window.APPWRITE_DB_ID = APPWRITE_DB_ID;
window.APPWRITE_COLLECTION_ID = APPWRITE_COLLECTION_ID;
window.APPWRITE_BUCKET_ID = APPWRITE_BUCKET_ID;

// Debugging log to confirm initialization
console.log('✅ Appwrite successfully initialized');
console.log('Current Bucket ID:', window.APPWRITE_BUCKET_ID);
