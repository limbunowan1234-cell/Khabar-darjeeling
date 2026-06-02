// js/index.js

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

        // Breaking news ticker - first 3 articles
        const breakingNews = articles.slice(0, 3).map(a => a.title).join(' • ');
        document.getElementById('breakingTicker').textContent = breakingNews || 'No breaking news';

        // Featured story - first article
        if (articles.length > 0) {
            const featured = articles[0];
            document.getElementById('featuredStory').innerHTML = `
                ${featured.imageFileId? `<img src="${featured.imageFileId}" alt="${featured.title}" style="width:100%;height:400px;object-fit:cover;">` : ''}
                <div style="padding: 30px;">
                    <span class="category-badge">${featured.category}</span>
                    <h2>${featured.title}</h2>
                    <p class="meta">${featured.location} • ${new Date(featured.submittedAt).toLocaleDateString()}</p>
                    <p>${featured.content.substring(0, 200)}...</p>
                </div>
            `;
        }

        // Latest news grid
        const newsGrid = document.getElementById('newsGrid');
        newsGrid.innerHTML = articles.map(article => `
            <div class="news-card">
                ${article.imageFileId? `<img src="${article.imageFileId}" alt="${article.title}">` : ''}
                <div class="news-card-content">
                    <span class="category-badge">${article.category}</span>
                    <h4>${article.title}</h4>
                    <p class="meta">${article.location} • ${new Date(article.submittedAt).toLocaleDateString()}</p>
                    <p>${article.content.substring(0, 100)}...</p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading articles:', error);
        document.getElementById('newsGrid').innerHTML = '<p>Error loading news. Please refresh.</p>';
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