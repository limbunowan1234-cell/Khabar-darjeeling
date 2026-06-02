const { Client, Databases, Storage, ID } = window.Appwrite;

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('68c3c0c00123abc456def'); // ← Paste your REAL Project ID here

const databases = new Databases(client);
const storage = new Storage(client);

const APPWRITE_DATABASE_ID = 'Khabar_db';
const APPWRITE_COLLECTION_ID = 'articles';
const APPWRITE_BUCKET_ID = 'article_images';