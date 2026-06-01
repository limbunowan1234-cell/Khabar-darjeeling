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
        
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size exceeds 5MB limit');
        }
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Allowed: JPG, PNG, WebP');
        }
        
        const response = await appwriteStorage.createFile(
            bucketId,
            'unique()',
            file
        );
        
        console.log('✓ Image uploaded:', response.$id);
        return response;
    } catch (error) {
        console.error('✗ Image upload failed:', error);
        throw error;
    }
}

// Get image preview URL
function getImagePreviewUrl(fileId, bucketId = APPWRITE_BUCKET_ID) {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${APPWRITE_PROJECT_ID}&width=400&height=300`;
}

// Get image download URL
function getImageDownloadUrl(fileId, bucketId = APPWRITE_BUCKET_ID) {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/download?project=${APPWRITE_PROJECT_ID}`;
}

// Delete image
async function deleteImage(fileId, bucketId = APPWRITE_BUCKET_ID) {
    try {
        await appwriteStorage.deleteFile(bucketId, fileId);
        console.log('✓ Image deleted:', fileId);
    } catch (error) {
        console.error('✗ Image deletion failed:', error);
        throw error;
    }
}

// Create article
async function createArticle(articleData) {
    try {
        const { Query } = window.Appwrite;
        
        const existing = await appwriteDatabase.listDocuments(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            [Query.equal('title', articleData.title)]
        );
        
        if (existing.documents.length > 0) {
            throw new Error('An article with this title already exists');
        }
        
        const response = await appwriteDatabase.createDocument(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            'unique()',
            articleData
        );
        
        console.log('✓ Article created:', response.$id);
        return response;
    } catch (error) {
        console.error('✗ Article creation failed:', error);
        throw error;
    }
}

// Get articles
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

// Get published articles only - FIXED
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

// Get articles by category - FIXED
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

// Get article by ID
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

// Search articles - FIXED
async function searchArticles(query, limit = 10, offset = 0) {
    try {
        const { Query } = window.Appwrite;
        
        const filters = [
            Query.equal('status', ARTICLE_STATUS.PUBLISHED),
            Query.or([
                Query.search('title', query),
                Query.search('content', query)
            ]),
            Query.orderDesc('publishedAt')
        ];
        
        return await getArticles(filters, limit, offset);
    } catch (error) {
        console.error('✗ Search failed:', error);
        return { documents: [], total: 0 };
    }
}

// Get pending articles (admin only)
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

// Update article status - FIXED
async function updateArticleStatus(articleId, status, publisherNote = '') {
    try {
        const updateData = {
            status: status
        };
        
        if (status === ARTICLE_STATUS.PUBLISHED) {
            updateData.publishedAt = new Date().toISOString();
        }
        
        if (publisherNote) {
            updateData.publisherNote = publisherNote;
        }
        
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

// Update article
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

// Delete article
async function deleteArticle(articleId, imageFileId = null) {
    try {
        if (imageFileId) {
            try {
                await deleteImage(imageFileId);
            } catch (error) {
                console.warn('Warning: Could not delete image:', error);
            }
        }
        
        await appwriteDatabase.deleteDocument(
            APPWRITE_DB_ID,
            APPWRITE_COLLECTION_ID,
            articleId
        );
        
        console.log('✓ Article deleted:', articleId);
    } catch (error) {
        console.error('✗ Failed to delete article:', error);
        throw error;
    }
}

// Get article statistics - FIXED
async function getArticleStatistics() {
    try {
        const { Query } = window.Appwrite;
        
        const totalResponse = await getArticles([], 1000, 0);
        const total = totalResponse.total;
        
        const pendingResponse = await getPendingArticles(1000, 0);
        const pending = pendingResponse.total;
        
        const approvedFilters = [
            Query.equal('status', ARTICLE_STATUS.PUBLISHED)
        ];
        const approvedResponse = await getArticles(approvedFilters, 1000, 0);
        const approved = approvedResponse.total;
        
        const rejectedFilters = [
            Query.equal('status', ARTICLE_STATUS.REJECTED)
        ];
        const rejectedResponse = await getArticles(rejectedFilters, 1000, 0);
        const rejected = rejectedResponse.total;
        
        return {
            total,
            pending,
            approved,
            rejected
        };
    } catch (error) {
        console.error('✗ Failed to get statistics:', error);
        return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
}

// Get trending articles - FIXED
async function getTrendingArticles(limit = 5) {
    try {
        const { Query } = window.Appwrite;
        const filters = [
            Query.equal('status', ARTICLE_STATUS.PUBLISHED),
            Query.orderDesc('views'),
            Query.limit(limit)
        ];
        
        return await getArticles(filters, limit, 0);
    } catch (error) {
        console.error('✗ Failed to get trending articles:', error);
        return { documents: [], total: 0 };
    }
}

// Increment article views
async function incrementArticleViews(articleId) {
    try {
        const article = await getArticleById(articleId);
        if (article) {
            const newViews = (article.views || 0) + 1;
            await updateArticle(articleId, { views: newViews });
        }
    } catch (error) {
        console.warn('Warning: Could not increment views:', error);
    }
}

// Initialize Appwrite on page load
document.addEventListener('DOMContentLoaded', initializeAppwrite);