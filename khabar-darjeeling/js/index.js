import { categoryThemes } from './categoryConfig.js';

const PROJECT_ID = 'khabardarjeeling';
const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';

function getAppwriteObjects() {
  return {
    databases: window.databases || window.database,
    Query: window.Query,
    APPWRITE_DATABASE_ID: window.APPWRITE_DB_ID || window.APPWRITEDBID,
    APPWRITE_COLLECTION_ID: window.APPWRITE_COLLECTION_ID || window.APPWRITECOLLECTIONID
  };
}

function safeText(value) {
  return value == null ? '' : String(value);
}

function safeDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? 'Date unknown' : d.toLocaleDateString();
}

function getImageUrl(id) {
  if (!id || id === 'Text' || id === 'null' || id === 'undefined' || id === '<URL>') return '';
  if (String(id).startsWith('http')) return id;
  return `${ENDPOINT}/storage/buckets/article-image/files/${id}/view?project=${PROJECT_ID}`;
}

async function loadArticles() {
  try {
    const { databases, Query, APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID } = getAppwriteObjects();

    if (!databases || !Query || !APPWRITE_DATABASE_ID || !APPWRITE_COLLECTION_ID) {
      throw new Error('Appwrite not initialized');
    }

    const response = await databases.listDocuments(APPWRITE_DATABASE_ID, APPWRITE_COLLECTION_ID, [
      Query.equal('status', 'approved'),
      Query.orderDesc('$createdAt'),
      Query.limit(20)
    ]);

    const articles = response.documents || [];

    const breakingTicker = document.getElementById('breakingTicker');
    if (breakingTicker) {
      const breakingNews = articles.slice(0, 3).map(a => safeText(a.title)).join(' • ');
      breakingTicker.textContent = breakingNews || 'No breaking news';
    }

    const featuredElement = document.getElementById('featuredStory');
    if (featuredElement) {
      if (articles.length === 0) {
        featuredElement.innerHTML = '<p>No featured story available.</p>';
      } else {
        const featured = articles[0];
        const featCategoryKey = safeText(featured.category).toLowerCase() || 'default';
        const featTheme = categoryThemes[featCategoryKey] || categoryThemes.default || { color: '#b81d24' };
        const imgUrl = getImageUrl(featured.imageFileId || featured.imageUrl);
        const title = safeText(featured.title);
        const location = safeText(featured.location);
        const category = safeText(featured.category);
        const content = safeText(featured.content).substring(0, 200);

        featuredElement.innerHTML = `
          ${imgUrl ? `<img src="${imgUrl}" alt="${title}" style="width:100%;height:400px;object-fit:cover;border-bottom:4px solid ${featTheme.color};">` : ''}
          <div style="padding:30px;">
            <span class="category-badge" style="background-color:${featTheme.color};color:white;">${category}</span>
            <h2>${title}</h2>
            <p class="meta">${location} • ${safeDate(featured.submittedAt || featured.$createdAt)}</p>
            <p>${content}${safeText(featured.content).length > 200 ? '...' : ''}</p>
          </div>
        `;
      }
    }

    const newsGrid = document.getElementById('newsGrid');
    if (newsGrid) {
      newsGrid.innerHTML = articles.map(article => {
        const categoryKey = safeText(article.category).toLowerCase() || 'default';
        const theme = categoryThemes[categoryKey] || categoryThemes.default || { color: '#b81d24' };
        const imgUrl = getImageUrl(article.imageFileId || article.imageUrl);
        const title = safeText(article.title);
        const location = safeText(article.location);
        const category = safeText(article.category);
        const content = safeText(article.content);

        return `
          <div class="news-card" style="border-top:4px solid ${theme.color};">
            ${imgUrl ? `<img src="${imgUrl}" alt="${title}">` : ''}
            <div class="news-card-content">
              <span class="category-badge" style="background-color:${theme.color};color:white;">${category}</span>
              <h4>${title}</h4>
              <p class="meta">${location} • ${safeDate(article.submittedAt || article.$createdAt)}</p>
              <p>${content.substring(0, 100)}${content.length > 100 ? '...' : ''}</p>
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

document.addEventListener('DOMContentLoaded', loadArticles);

document.getElementById('navToggle')?.addEventListener('click', function () {
  document.getElementById('navMenu')?.classList.toggle('active');
});

document.getElementById('themeToggle')?.addEventListener('click', function () {
  document.body.classList.toggle('dark-theme');
  this.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
});
