// js/appwrite.js
const { Client, Databases, Storage, Account, ID } = window.Appwrite;

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('68b43d61001a7c0b6c68'); // ← Use the hex ID, not the name

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

// Make global
window.account = account;
window.database = databases;
window.storage = storage;
window.ID = ID;

const APPWRITE_DATABASE_ID = '68b44bf2000e26f021d3';
const APPWRITE_COLLECTION_ID = 'articles';
const APPWRITE_BUCKET_ID = 'article_images';