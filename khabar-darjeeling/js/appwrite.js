// js/appwrite.js
const { Client, Databases, Storage, Account, ID } = window.Appwrite;

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('68c3c0c00123abc456def'); // Replace with your REAL Project ID from Appwrite Settings

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

// Make them globally available for admin.js
window.account = account;
window.database = databases;
window.storage = storage;
window.ID = ID;

// Your Appwrite resource IDs
const APPWRITE_DATABASE_ID = 'Khabar_db';
const APPWRITE_COLLECTION_ID = 'articles';
const APPWRITE_BUCKET_ID = 'article_images';