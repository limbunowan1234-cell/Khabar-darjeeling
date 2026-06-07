// js/index.js?v=134 - forces loaders off, no categories, no Eruda
const PROJECT_ID = 'khabardarjeeling';
const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const DEFAULT_COLOR = '#c41e3a';

function hideAllLoaders() {
  // 1) HTML loader
  document.getElementById('gatekeeperLoader')?.remove();
  // 2) old auth overlay
  document.querySelectorAll('div, p, span').forEach(el => {
    if (el.textContent && el.textContent.includes('Checking authentication')) {
      el.closest('div[style*="position:fixed"], body > div')?.remove();
    }
  });
}

function getAppwriteObjects() {
  return {
    databases: window.databases || window.database,
    Query: window.Query,
    APPWRITE_DATABASE_ID: window.APPWRITE_DB_ID || window.APPWRITEDBID,
    APPWRITE_COLLECTION_ID: window.APPWRITE_COLLECTION_ID || window.APPWRITECOLLECTIONID
  };
}

function safeText(v){ return v==null ? '' : String(v); }
function safeDate(v){ const d=new Date(v); return isNaN(d.getTime()) ? 'Date unknown' : d.toLocaleDateString(); }

function getImageUrl(id){
  if(!id || ['Text','null','undefined','<URL>'].includes(id)) return '';
  if(String(id).startsWith('http')) return id;
  const bucket = window.APPWRITE_BUCKET_ID || 'article-image';
  return `${ENDPOINT}/storage/buckets/${bucket}/files/${id}/view?project=${PROJECT_ID}`;
}

async function loadArticles(){
  try{
    const {databases,Query,APPWRITE_DATABASE_ID,APPWRITE_COLLECTION_ID}=getAppwriteObjects();
    if(!databases||!Query||!APPWRITE_DATABASE_ID||!APPWRITE_COLLECTION_ID) throw new Error('Appwrite not initialized');

    const res = await databases.listDocuments(APPWRITE_DATABASE_ID,APPWRITE_COLLECTION_ID,[
      Query.equal('status','approved'),
      Query.orderDesc('$createdAt'),
      Query.limit(20)
    ]);
    const articles = res.documents || [];

    // breaking ticker
    const breakingTicker = document.getElementById('breakingTicker');
    if (breakingTicker) {
      breakingTicker.textContent = articles.slice(0,3).map(a=>safeText(a.title)).join(' • ') || 'No breaking news';
    }

    // featured story
    const featuredElement = document.getElementById('featuredStory');
    if (featuredElement) {
      if (articles.length === 0) {
        featuredElement.innerHTML = '<p>No featured story available.</p>';
      } else {
        const featured = articles[0];
        const imgUrl = getImageUrl(featured.imageFileId || featured.imageUrl);
        const title = safeText(featured.title);
        const location = safeText(featured.location);
        const content = safeText(featured.content).substring(0,200);
        
        featuredElement.innerHTML = `
          ${imgUrl ? `<img src="${imgUrl}" alt="${title}" style="width:100%;height:400px;object-fit:cover;border-bottom:4px solid ${DEFAULT_COLOR};">` : ''}
          <div style="padding:30px;">
            <h2>${title}</h2>
            <p class="meta">${location} • ${safeDate(featured.submittedAt || featured.$createdAt)}</p>
            <p>${content}${safeText(featured.content).length > 200 ? '...' : ''}</p>
          </div>
        `;
      }
    }

    // news grid
    const newsGrid = document.getElementById('newsGrid');
    if (newsGrid) {
      newsGrid.innerHTML = articles.map(article => {
        const imgUrl = getImageUrl(article.imageFileId || article.imageUrl);
        const title = safeText(article.title);
        const location = safeText(article.location);
        const content = safeText(article.content);
        
        return `
          <div class="news-card" style="border-top:4px solid ${DEFAULT_COLOR};">
            ${imgUrl ? `<img src="${imgUrl}" alt="${title}">` : ''}
            <div class="news-card-content">
              <h4>${title}</h4>
              <p class="meta">${location} • ${safeDate(article.submittedAt || article.$createdAt)}</p>
              <p>${content.substring(0,100)}${content.length > 100 ? '...' : ''}</p>
            </div>
          </div>
        `;
      }).join('');
    }

  }catch(e){
    console.error('Load failed:',e);
    const newsGrid = document.getElementById('newsGrid');
    if (newsGrid) newsGrid.innerHTML='<p>Error loading news. Please refresh.</p>';
  }finally{
    hideAllLoaders(); // always remove loaders
  }
}

document.addEventListener('DOMContentLoaded', loadArticles);

// theme toggle (matches your HTML)
document.getElementById('themeToggle')?.addEventListener('click', function () {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  this.textContent = isDark ? '☀️' : '🌙';
});