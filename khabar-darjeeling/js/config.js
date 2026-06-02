/* ==================== APPWRITE CONFIG ==================== */
var APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
var APPWRITE_PROJECT_ID = 'khabardarjeeling';
var APPWRITE_DB_ID = 'Khabar_db';
var APPWRITE_COLLECTION_ID = 'articles';
var APPWRITE_BUCKET_ID = 'article_images';

var ARTICLE_STATUS = {
    PENDING: 'pending',
    PUBLISHED: 'published',
    REJECTED: 'rejected'
};

var CATEGORIES = [
    { id: 'darjeeling', name: 'Darjeeling', icon: '🏔️' },
    { id: 'kalimpong', name: 'Kalimpong', icon: '🌲' },
    { id: 'kurseong', name: 'Kurseong', icon: '🚂' },
    { id: 'mirik', name: 'Mirik', icon: '🏞️' },
    { id: 'siliguri', name: 'Siliguri', icon: '🏙️' },
    { id: 'west-bengal', name: 'West Bengal', icon: '📰' },
    { id: 'national', name: 'National', icon: '🇮🇳' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'sports', name: 'Sports', icon: '⚽' }
];
