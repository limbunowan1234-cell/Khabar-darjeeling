/* ==================== ARTICLE PAGE JAVASCRIPT ==================== */

let currentArticle = null;

document.addEventListener('DOMContentLoaded', async () => {
    setupThemeToggle();
    setupMobileMenu();
    await loadArticleFromURL();
    setupShareButtons();
    await loadRelatedArticles();
});

// Setup Theme Toggle
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
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.textContent = isDark ? '☀️' : '🌙';
        });
    }
}

// Setup Mobile Menu
function setupMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Load Article from URL
async function loadArticleFromURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId) {
            throw new Error('Article ID not found');
        }
        
        currentArticle = await getArticleById(articleId);
        
        if (!currentArticle) {
            throw new Error('Article not found');
        }
        
        // Increment views
        await incrementArticleViews(articleId);
        
        // Display article
        displayArticle(currentArticle);
        
        // Update meta tags for SEO
        updateMetaTags(currentArticle);
        
        // Load sidebar content
        await loadLatestSidebarNews();
        
    } catch (error) {
        console.error('Error loading article:', error);
        const articleHeader = document.getElementById('articleHeader');
        if (articleHeader) {
            articleHeader.innerHTML = '<p style="color: red;">Error loading article. Please try again later.</p>';
        }
    }
}

// Display Article
function displayArticle(article) {
    // Header
    const articleHeader = document.getElementById('articleHeader');
    if (articleHeader) {
        const pubDate = formatDate(article.publishedAt);
        const categoryObj = CATEGORIES.find(c => c.id === article.category);
        
        articleHeader.innerHTML = `
            <div class="article-meta">
                <span class="article-category">${categoryObj?.name || article.category}</span>
                <span>📅 ${pubDate}</span>
                <span>📍 ${article.location}</span>
                <span>👤 ${article.authorName}</span>
            </div>
            <h1>${escapeHtml(article.title)}</h1>
        `;
    }
    
    // Featured Image
    const featuredImage = document.getElementById('featuredImage');
    if (featuredImage) {
        const imageUrl = getImagePreviewUrl(article.imageFileId);
        featuredImage.innerHTML = `<img src="${imageUrl}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.5rem;">`;
    }
    
    // Body
    const articleBody = document.getElementById('articleBody');
    if (articleBody) {
        articleBody.innerHTML = `<p>${escapeHtml(article.content).replace(/\n/g, '</p><p>')}</p>`;
    }
    
    // Article Info Sidebar
    const articleInfo = document.getElementById('articleInfo');
    if (articleInfo) {
        const pubDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        articleInfo.innerHTML = `
            <dt>Published</dt>
            <dd>${pubDate}</dd>
            <dt>Category</dt>
            <dd>${CATEGORIES.find(c => c.id === article.category)?.name}</dd>
            <dt>Location</dt>
            <dd>${article.location}</dd>
            <dt>Author</dt>
            <dd>${article.authorName}</dd>
            <dt>Source</dt>
            <dd>${article.source || 'Khabar Darjeeling'}</dd>
            <dt>Views</dt>
            <dd>${article.views || 0}</dd>
        `;
    }
}

// Update Meta Tags for SEO
function updateMetaTags(article) {
    // Title
    document.title = `${article.title} - Khabar Darjeeling`;
    
    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
    }
    metaDescription.content = article.content.substring(0, 160);
    
    // OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || createMetaTag('og:title');
    ogTitle.content = article.title;
    
    const ogDescription = document.querySelector('meta[property="og:description"]') || createMetaTag('og:description');
    ogDescription.content = article.content.substring(0, 160);
    
    const ogImage = document.querySelector('meta[property="og:image"]') || createMetaTag('og:image');
    ogImage.content = getImageDownloadUrl(article.imageFileId);
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_CONFIG.url}/article.html?id=${article.$id}`;
    
    // JSON-LD Schema
    const schema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "description": article.content.substring(0, 160),
        "image": getImageDownloadUrl(article.imageFileId),
        "datePublished": article.publishedAt,
        "author": {
            "@type": "Person",
            "name": article.authorName
        },
        "publisher": {
            "@type": "Organization",
            "name": SITE_CONFIG.name,
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_CONFIG.url}/logo.png`
            }
        }
    };
    
    const schemaScript = document.getElementById('articleSchema');
    if (schemaScript) {
        schemaScript.textContent = JSON.stringify(schema);
    }
}

// Create Meta Tag
function createMetaTag(property) {
    const tag = document.createElement('meta');
    if (property.includes('og:')) {
        tag.setAttribute('property', property);
    } else {
        tag.name = property;
    }
    document.head.appendChild(tag);
    return tag;
}

// Setup Share Buttons
function setupShareButtons() {
    const url = window.location.href;
    const title = currentArticle?.title || document.title;
    
    // WhatsApp
    const whatsappBtn = document.getElementById('shareWhatsApp');
    if (whatsappBtn) {
        whatsappBtn.href = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        whatsappBtn.target = '_blank';
    }
    
    // Facebook
    const facebookBtn = document.getElementById('shareFacebook');
    if (facebookBtn) {
        facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        facebookBtn.target = '_blank';
    }
    
    // Twitter
    const twitterBtn = document.getElementById('shareTwitter');
    if (twitterBtn) {
        twitterBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        twitterBtn.target = '_blank';
    }
    
    // Copy Link
    const copyBtn = document.getElementById('shareCopy');
    if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
            });
        });
    }
}

// Load Related Articles
async function loadRelatedArticles() {
    if (!currentArticle) return;
    
    try {
        const response = await getArticlesByCategory(currentArticle.category, 3, 0);
        const related = response.documents?.filter(a => a.$id !== currentArticle.$id) || [];
        
        const relatedList = document.getElementById('relatedList');
        if (!relatedList) return;
        
        if (related.length === 0) {
            relatedList.innerHTML = '<p style="grid-column: 1/-1;">No related articles found.</p>';
            return;
        }
        
        relatedList.innerHTML = related.map(article => {
            const imageUrl = getImagePreviewUrl(article.imageFileId);
            const pubDate = new Date(article.publishedAt).toLocaleDateString();
            
            return `
                <a href="article.html?id=${article.$id}" class="related-item">
                    <img src="${imageUrl}" alt="${article.title}" class="related-item-image" loading="lazy">
                    <div class="related-item-content">
                        <h5>${article.title}</h5>
                        <div class="related-item-date">${pubDate}</div>
                    </div>
                </a>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading related articles:', error);
    }
}

// Load Latest Sidebar News
async function loadLatestSidebarNews() {
    try {
        const response = await getApprovedArticles(5, 0);
        const latestNews = document.getElementById('latestSidebarNews');
        
        if (!latestNews) return;
        
        if (!response.documents || response.documents.length === 0) {
            latestNews.innerHTML = '<p>No news available.</p>';
            return;
        }
        
        latestNews.innerHTML = response.documents.map(article => {
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
        
    } catch (error) {
        console.error('Error loading sidebar news:', error);
    }
}

// Format Date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
