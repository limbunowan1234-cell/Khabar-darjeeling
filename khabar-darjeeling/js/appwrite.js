const appwriteClient = new window.Appwrite.Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const appwriteAccount = new window.Appwrite.Account(appwriteClient);
const appwriteDatabase = new window.Appwrite.Databases(appwriteClient);
const appwriteStorage = new window.Appwrite.Storage(appwriteClient);

// Make them global so admin.js can use them
window.account = appwriteAccount;
window.database = appwriteDatabase;
window.storage = appwriteStorage;
window.Appwrite = window.Appwrite; // for Query
