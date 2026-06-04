// js/index.js
import { categoryThemes } from './categoryConfig.js'; 

// Make sure your Appwrite variables match your setup!
const PROJECT_ID = 'khabardarjeeling';
const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';

async function loadArticles() {
    try {
        // Load all approved articles
        const response = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            [
                Query.equal('status', 'approved'),
                Query.orderDesc('submittedAt'),
                Query.limit(20)
            ]
        );

        const articles = response.documents;

        // 1. BREAKING NEWS (FAILSAFE ADDED)
        const breakingNews = articles.slice(0, 3).map(a => a.title).join(' • ');
        const breakingTicker = document.getElementById('breakingTicker');
        if (breakingTicker) {
            breakingTicker.textContent = breakingNews || 'No breaking news';
        }

        // Helper to get real image URL instead of just the ID
        function getImageUrl(id) {
            if (!id || id === 'Text' || id === 'null' || id === 'undefined') return '';
            if (id.startsWith('http')) return id;
            return `${ENDPOINT}/storage/buckets/article-image/files/${id}/view?project=${PROJECT_ID}`;
        }

        // 2. FEATURED STORY (FAILSAFE ADDED)
        const featuredElement = document.getElementById('featuredStory');
        if (featuredElement && articles.length > 0) {
            const featured = articles[0];
            const featCategoryKey = featured.category ? featured.category.toLowerCase() : 'default';
            const featTheme = categoryThemes[featCategoryKey] || categoryThemes['default'] || { color: '#b81d24' };
            const imgUrl = getImageUrl(featured.imageFileId);

            featuredElement.innerHTML = `
                ${imgUrl ? `<img src="${imgUrl}" alt="${featured.title}" style="width:100%;height:400px;object-fit:cover; border-bottom: 4px solid ${featTheme.color};">` : ''}
                <div style="padding: 30px;">
                    <span class="category-badge" style="background-color: ${featTheme.color}; color: white;">${featured.category}</span>
                    <h2>${featured.title}</h2>
                    <p class="meta">${featured.location} • ${new Date(featured.submittedAt).toLocaleDateString()}</p>
                    <p>${featured.content.substring(0, 200)}...</p>
                </div>
            `;
        }

        // 3. LATEST NEWS GRID (FAILSAFE ADDED)
        const newsGrid = document.getElementById('newsGrid');
        if (newsGrid) {
            newsGrid.innerHTML = articles.map(article => {
                const categoryKey = article.category ? article.category.toLowerCase() : 'default';
                const theme = categoryThemes[categoryKey] || categoryThemes['default'] || { color: '#b81d24' };
                const imgUrl = getImageUrl(article.imageFileId);

                return `
                <div class="news-card" style="border-top: 4px solid ${theme.color};">
                    ${imgUrl ? `<img src="${imgUrl}" alt="${article.title}">` : ''}
                    <div class="news-card-content">
                        <span class="category-badge" style="background-color: ${theme.color}; color: white;">${article.category}</span>
                        <h4>${article.title}</h4>
                        <p class="meta">${article.location} • ${new Date(article.submittedAt).toLocaleDateString()}</p>
                        <p>${article.content.substring(0, 100)}...</p>
                    </div>
                </div>
                `;
            }).join('');
        }

    } catch (error) {
        console.error('Error loading articles:', error);
        const newsGrid = document.getElementById('newsGrid');
        if (newsGrid) newsGrid.innerHTML = '<p>Error loading news. Please refresh.</p>';
    }
}

// Load on page ready
document.addEventListener('DOMContentLoaded', loadArticles);

// Mobile nav toggle
document.getElementById('navToggle')?.addEventListener('click', function() {
    document.getElementById('navMenu').classList.toggle('active');
});

// Theme toggle
document.getElementById('themeToggle')?.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    this.textContent = document.body.classList.contains('dark-theme')? '☀️' : '🌙';
});
