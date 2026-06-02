// js/appwrite.js
const { Client, Databases, Storage, ID } = Appwrite;

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('khabardarjeeling'); // Your project ID

// Initialize Appwrite services
const databases = new Databases(client);
const storage = new Storage(client);

// Your database details
const APPWRITE_DATABASE_ID = 'Khabar_db';
const APPWRITE_COLLECTION_ID = 'articles';
const APPWRITE_BUCKET_ID = 'article_images';