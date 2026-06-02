/* ==================== APPWRITE HELPERS ==================== */

let appwriteClient = null;
let appwriteAccount = null;
let appwriteDatabase = null;
let appwriteStorage = null;
let currentUser = null;

function initializeAppwrite() {
    try {
        const { Client, Account, Databases, Storage } = window.Appwrite;
        
        appwriteClient = new Client()
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID);
        
        appwriteAccount = new Account(appwriteClient);
        appwriteDatabase = new Databases(appwriteClient);
        appwriteStorage = new Storage(appwriteClient);
        
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

async function getArticles(filters = [], limit = 10, offset = 0) {
    try {
        const response = await appwriteDatabase.listDocuments(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            filters.length > 0 ? filters : undefined,
            limit,
            offset
        );
        return response;
    } catch (error) {
        console.error('✗ Failed to get articles:', error);
        return { documents: [], total: 0 };
    }
}

async function getApprovedArticles(limit = 10, offset = 0) {
    try {
        const { Query } = window.Appwrite;
        const filters = [
            Query.equal('status', ARTICLE_STATUS.PUBLISHED),
            Query.orderDesc('publishedAt')
        ];
        return await getArticles(filters, limit, offset);
    } catch (error) {
        console.error('✗ Failed to get published articles:', error);
        return { documents: [], total: 0 };
    }
}

async function getArticlesByCategory(category, limit = 10, offset = 0) {
    try {
        const { Query } = window.Appwrite;
        const filters = [
            Query.equal('category', category),
            Query.equal('status', ARTICLE_STATUS.PUBLISHED),
            Query.orderDesc('publishedAt')
        ];
        return await getArticles(filters, limit, offset);
    } catch (error) {
        console.error('✗ Failed to get articles by category:', error);
        return { documents: [], total: 0 };
    }
}

async function getArticleById(articleId) {
    try {
        const response = await appwriteDatabase.getDocument(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            articleId
        );
        return response;
    } catch (error) {
        console.error('✗ Failed to get article:', error);
        return null;
    }
}

async function getPendingArticles(limit = 20, offset = 0) {
    try {
        const { Query } = window.Appwrite;
        const filters = [
            Query.equal('status', ARTICLE_STATUS.PENDING),
            Query.orderDesc('submittedAt')
        ];
        return await getArticles(filters, limit, offset);
    } catch (error) {
        console.error('✗ Failed to get pending articles:', error);
        return { documents: [], total: 0 };
    }
}

async function updateArticleStatus(articleId, status, publisherNote = '') {
    try {
        const updateData = { status: status };
        if (status === ARTICLE_STATUS.PUBLISHED) {
            updateData.publishedAt = new Date().toISOString();
        }
        if (publisherNote) updateData.publisherNote = publisherNote;
        
        const response = await appwriteDatabase.updateDocument(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            articleId,
            updateData
        );
        console.log('✓ Article status updated:', status);
        return response;
    } catch (error) {
        console.error('✗ Failed to update article status:', error);
        throw error;
    }
}

async function updateArticle(articleId, updateData) {
    try {
        const response = await appwriteDatabase.updateDocument(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            articleId,
            updateData
        );
        console.log('✓ Article updated:', articleId);
        return response;
    } catch (error) {
        console.error('✗ Failed to update article:', error);
        throw error;
    }
}

async function deleteArticle(articleId, imageFileId = null) {
    try {
        if (imageFileId) {
            try {
                await appwriteStorage.deleteFile(APPWRITE_BUCKET_ID, imageFileId);
            } catch (error) {
                console.warn('Warning: Could not delete image:', error);
            }
        }
        await appwriteDatabase.deleteDocument(APPWRITE_DB_ID, APPWRITE_COLLECTION_ID, articleId);
        console.log('✓ Article deleted:', articleId);
    } catch (error) {
        console.error('✗ Failed to delete article:', error);
        throw error;
    }
}

async function getArticleStatistics() {
    try {
        const { Query } = window.Appwrite;
        const totalResponse = await getArticles([], 1000, 0);
        const pendingResponse = await getPendingArticles(1000, 0);
        const approvedResponse = await getArticles([Query.equal('status', ARTICLE_STATUS.PUBLISHED)], 1000, 0);
        const rejectedResponse = await getArticles([Query.equal('status', ARTICLE_STATUS.REJECTED)], 1000, 0);
        
        return {
            total: totalResponse.total,
            pending: pendingResponse.total,
            approved: approvedResponse.total,
            rejected: rejectedResponse.total
        };
    } catch (error) {
        console.error('✗ Failed to get statistics:', error);
        return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
}

function getImagePreviewUrl(fileId, bucketId = APPWRITE_BUCKET_ID) {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${APPWRITE_PROJECT_ID}&width=400&height=300`;
}

document.addEventListener('DOMContentLoaded', initializeAppwrite);
