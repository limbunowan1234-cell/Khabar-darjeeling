// js/appwrite.js
const { Client, Databases, Storage, ID } = window.Appwrite;

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') // Correct New York endpoint
    .setProject('khabardarjeeling');

const databases = new Databases(client);
const storage = new Storage(client);

const APPWRITE_DATABASE_ID = 'Khabar_db';
const APPWRITE_COLLECTION_ID = 'articles';
const APPWRITE_BUCKET_ID = 'article_images';