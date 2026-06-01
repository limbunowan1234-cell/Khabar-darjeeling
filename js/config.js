/* ==================== CONFIG FILE ==================== */

// Appwrite Configuration
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'khabardarjeeling';
const APPWRITE_DB_ID = 'Khabar_db'; 
const APPWRITE_COLLECTION_ID = 'articles'; 
const APPWRITE_BUCKET_ID = 'article_images';

// Categories - update these to match your site
const CATEGORIES = [
    { id: 'darjeeling', name: 'Darjeeling', icon: '📍' },
    { id: 'kalimpong', name: 'Kalimpong', icon: '🏔️' },
    { id: 'kurseong', name: 'Kurseong', icon: '🌄' },
    { id: 'mirik', name: 'Mirik', icon: '🏞️' },
    { id: 'siliguri', name: 'Siliguri', icon: '🏙️' },
    { id: 'west-bengal', name: 'West Bengal', icon: '🗺️' },
    { id: 'national', name: 'National', icon: '🇮🇳' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'sports', name: 'Sports', icon: '⚽' }
];

// Article Status
const ARTICLE_STATUS = {
    PENDING: 'pending',
    PUBLISHED: 'published',
    REJECTED: 'rejected'
};

// Site Configuration
const SITE_CONFIG = {
    name: 'Khabar Darjeeling',
    url: 'https://khabardarjeeling.space',
    description: 'Your trusted source for news from Darjeeling and West Bengal',
    keywords: 'news, Darjeeling, Kalimpong, West Bengal, India',
    image: 'https://khabardarjeeling.space/og-image.jpg',
    social: {
        twitter: '@KhabarDarjeeling',
        facebook: 'khabardarjeeling',
        instagram: 'khabardarjeeling'
    }
};

// Export for ES modules
export { 
    APPWRITE_ENDPOINT, 
    APPWRITE_PROJECT_ID, 
    APPWRITE_DB_ID, 
    APPWRITE_COLLECTION_ID, 
    APPWRITE_BUCKET_ID,
    CATEGORIES,
    ARTICLE_STATUS,
    SITE_CONFIG
};