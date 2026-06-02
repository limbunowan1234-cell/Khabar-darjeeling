// js/appwrite.js
const { Client, Databases, Storage, Account, ID } = window.Appwrite;

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('khabardarjeeling'); // ← Your actual Project ID

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

window.account = account;
window.database = databases;
window.storage = storage;
window.ID = ID;

const APPWRITE_DATABASE_ID = 'Khabar_db';
const APPWRITE_COLLECTION_ID = 'articles';
const APPWRITE_BUCKET_ID = 'article_images';