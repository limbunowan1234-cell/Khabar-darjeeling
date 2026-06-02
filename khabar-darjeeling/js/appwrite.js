// js/appwrite.js
const { Client, Databases, Storage, ID } = Appwrite;

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
    .setProject('YOUR_PROJECT_ID'); // Replace with your Project ID

// Initialize services
const databases = new Databases(client);
const storage = new Storage(client);

// Your IDs - replace these with actual values from Appwrite Console
const APPWRITE_DATABASE_ID = 'your_database_id';
const APPWRITE_COLLECTION_ID = 'your_collection_id'; 
const APPWRITE_BUCKET_ID = 'your_bucket_id';