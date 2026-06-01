/* ==================== APPWRITE HELPERS ==================== */

let appwriteClient = null;
let appwriteAccount = null;
let appwriteDatabase = null;
let appwriteStorage = null;
let currentUser = null;

// Initialize Appwrite
function initializeAppwrite() {
    try {
        const { Client, Account, Databases, Storage } = window.Appwrite;
        
        appwriteClient = new Client()
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID);
        
        appwriteAccount = new Account(appwriteClient);
        appwriteDatabase = new Databases(appwriteClient);
        appwriteStorage = new Storage(appwriteClient);
        
        // FIX: Expose to window so admin.js can use them
        window.account = appwriteAccount;
        window.databases = appwriteDatabase;
        window.storage = appwriteStorage;
        window.Query = window.Appwrite.Query;
        
        console.log('✓ Appwrite initialized successfully');
        checkCurrentUser();
    } catch (error) {
        console.error('✗ Failed to initialize Appwrite:', error);
    }
}

// Check if user is logged in
async function checkCurrentUser() {
    try {
        currentUser = await appwriteAccount.get();
        console.log('✓ User logged in:', currentUser.email);
        return currentUser;
    } catch (error) {
        currentUser = null;
        return null;
    }
}

// Register user
async function registerUser(email, password, name) {
    try {
        const user = await appwriteAccount.create('unique()', email, password, name);
        console.log('✓ User registered:', user.email);
        return user;
    } catch (error) {
        console.error('✗ Registration failed:', error);
        throw error;
    }
}

// Login user
async function loginUser(email, password) {
    try {
        const session = await appwriteAccount.createEmailSession(email, password);
        currentUser = await appwriteAccount.get();
        console.log('✓ User logged in:', currentUser.email);
        return session;
    } catch (error) {
        console.error('✗ Login failed:', error);
        throw error;
    }
}

// Logout user
async function logoutUser() {
    try {
        await appwriteAccount.deleteSession('current');
        currentUser = null;
        console.log('✓ User logged out');
    } catch (error) {
        console.error('✗ Logout failed:', error);
        throw error;
    }
}

// Upload image
async function uploadImage(file, bucketId = APPWRITE_BUCKET_ID) {
    try {
        if (!file) throw new Error('No file provided');
        
        if (