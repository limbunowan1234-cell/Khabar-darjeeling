/* Main homepage JavaScript - with Safari service worker fix */
document.addEventListener('DOMContentLoaded', async () => {
    // --- SAFARI FIX: remove broken SW that causes "Response served by service worker has redirections" ---
    if ('serviceWorker' in navigator) {
        try {
            // 1. Unregister all old service workers
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));

            // 2. Delete old caches (they contain the redirect)
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map(key => caches.delete(key)));

            // 3. Register the new Safari-safe worker after page load
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                   .then(() => console.log('SW registered'))
                   .catch(err => console.error('SW register failed:', err));
            });
        } catch (e) {
            console.warn('Service worker cleanup error:', e);
        }
    }
    // --- end Safari fix ---

    setupEventListeners();
    setupThemeToggle();
    await loadBreakingNews();
    await loadFeaturedArticle();
    await loadArticles();
    await loadPopularNews();
    setupCategoryLinks();
});

function setupEventListeners() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            localStorage.setItem('newsletter_email', email);
            alert('Thank you for subscribing!');
            newsletterForm.reset();
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        loadArticles(1, category);
    }
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark? 'dark' : 'light');
            themeToggle.textContent = isDark? '☀️' : '🌙';
        });
    }
}

async function loadBreakingNews() {
    try {
        const { Query } = window.Appwrite;
        const breakingResponse = await getArticles(
            [
                Query.equal('status', ARTICLE_STATUS.APPROVED),
                Query.orderDesc('publishedAt')
            ],
            1,
            0
        );

        if (breakingResponse.documents && breakingResponse.documents.length > 0) {
            const article = breakingResponse.documents[0];
            const breakingContent = document.getElementById('breakingContent');
            if (breakingContent) {
                breakingContent.innerHTML = `
                    <a href="article.html?id=${article.$id}" style="color: white; text-decoration: none;">
                        <strong>${article.title}</strong>
                    </a>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading breaking news:', error);
    }
}

async function loadFeaturedArticle() {
    try {
        const { Query } = window.Appwrite;
        const featuredResponse = await getArticles(
            [
                Query.equal('status', ARTICLE_STATUS.APPROVED),
                Query.orderDesc('publishedAt')
            ],
            1,
            0
        );

        if (featuredResponse.documents && featuredResponse.documents.length > 0) {
            const article = featuredResponse.documents[0];
            const featuredArticle = document.getElementById('featuredArticle');
            if (featuredArticle) {
                const imageUrl = getImagePreviewUrl(article.imageFileId);
                const excerpt = article.content.substring(0, 200) + '...';
                const pubDate = new Date(article.publishedAt).toLocaleDateString();

                featuredArticle.innerHTML = `
                    <img src="${imageUrl}" alt="${article.title}" class="featured-image">
                    <div class="featured-info">
                        <h3>${article.title}</h3>
                        <div class="meta">
                            <span>📅 ${pubDate}</span>
                            <span>📍 ${article.location}</span>
                            <span>👤 ${article.authorName}</span>
                        </div>
                        <p class="featured-excerpt">${excerpt}</p>
                        <a href="article.html?id=${article.$id}" class="btn btn-primary read-more">Read More</a>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading featured article:', error);
    }
}

async function loadArticles(page = 1, category = null) {
    try {
        const offset = (page - 1) * 9;
        let response;

        if (category) {
            response = await getArticlesByCategory(category, 9, offset);
        } else {
            response = await getApprovedArticles(9, offset);
        }

        const container = document.getElementById('articlesContainer');
        if (!container) return;

        if (!response.documents || response.documents.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No articles found.</p>';
        } else {
            container.innerHTML = response.documents.map(article => {
                const imageUrl = getImagePreviewUrl(article.imageFileId);
                const pubDate = new Date(article.publishedAt).toLocaleDateString();
                const excerpt = article.content.substring(0, 100) + '...';
                const categoryObj = CATEGORIES.find(c => c.id === article.category);

                return `
                    <div class="article-card" onclick="window.location.href='article.html?id=${article.$id}'">
                        <img src="${imageUrl}" alt="${article.title}" class="article-card-image" loading="lazy">
                        <div class="article-card-content">
                            <span class="article-card-category">${categoryObj?.name || article.category}</span>
                            <h4 class="article-card-title">${article.title}</h4>
                            <p class="article-card-excerpt">${excerpt}</p>
                            <div class="article-card-meta">
                                <span class="article-card-date">📅 ${pubDate}</span>
                                <span class="article-card-location">📍 ${article.location}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (query.length < 2) {
        alert('Please enter at least 2 characters');
        return;
    }

    // Implementation for search functionality
    console.log('Search for:', query);
}

async function loadPopularNews() {
    try {
        const response = await getTrendingArticles(5);
        const container = document.getElementById('popularNews');
        if (!container) return;

        if (!response.documents || response.documents.length === 0) {
            container.innerHTML = '<p>No popular news available.</p>';
        } else {
            container.innerHTML = response.documents.map(article => {
                const imageUrl = getImagePreviewUrl(article.imageFileId);
                const pubDate = new Date(article.publishedAt).toLocaleDateString();

                return `
                    <div class="popular-item" onclick="window.location.href='article.html?id=${article.$id}'">
                        <img src="${imageUrl}" alt="${article.title}" class="popular-item-image" loading="lazy">
                        <div class="popular-item-content">
                            <h5>${article.title}</h5>
                            <div class="popular-item-date">${pubDate}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading popular news:', error);
    }
}

function setupCategoryLinks() {
    document.querySelectorAll('a[href*="?category="]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const url = new URL(this.href, window.location.origin);
            const category = url.searchParams.get('category');
            window.history.replaceState({}, '', `index.html?category=${category}`);
            loadArticles(1, category);
        });
    });
}