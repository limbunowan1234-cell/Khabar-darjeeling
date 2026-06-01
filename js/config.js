/* ==================== CONFIG FILE ==================== */

// Appwrite Configuration
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'YOUR_PROJECT_ID'; // Replace with your project ID
const APPWRITE_API_KEY = 'YOUR_API_KEY'; // Replace with your API key
const APPWRITE_DB_ID = 'news_db'; // Database ID
const APPWRITE_COLLECTION_ID = 'news'; // News collection ID
const APPWRITE_BUCKET_ID = 'news-images'; // Storage bucket ID

// Categories
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
    APPROVED: 'approved',
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
