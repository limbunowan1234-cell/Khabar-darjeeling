// js/index.js?v=134 - no Eruda, no categories, loaders off
const PROJECT_ID = 'khabardarjeeling';
const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const DEFAULT_COLOR = '#c41e3a';

function hideAllLoaders() {
  document.getElementById('gatekeeperLoader')?.remove();
}

function getAppwriteObjects() {
  return {
    databases: window.databases,
    Query: window.Query,
    APPWRITE_DATABASE_ID: window.APPWRITE_DB_ID,
    APPWRITE_COLLECTION_ID: window.APPWRITE_COLLECTION_ID
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
    if(!databases) throw new Error('Appwrite not ready');
    const res = await databases.listDocuments(APPWRITE_DATABASE_ID,APPWRITE_COLLECTION_ID,[
      Query.equal('status','approved'),
      Query.orderDesc('$createdAt'),
      Query.limit(20)
    ]);
    const articles = res.documents || [];
    document.getElementById('breakingTicker').textContent = articles.slice(0,3).map(a=>safeText(a.title)).join(' • ') || 'No breaking news';
    
    const featured = document.getElementById('featuredStory');
    if (featured && articles[0]) {
      const f = articles[0];
      const img = getImageUrl(f.imageFileId || f.imageUrl);
      featured.innerHTML = `${img ? `<img src="${img}" style="width:100%;height:300px;object-fit:cover;">` : ''}<div style="padding:20px;"><h2>${safeText(f.title)}</h2><p>${safeText(f.location)} • ${safeDate(f.$createdAt)}</p><p>${safeText(f.content).substring(0,200)}</p></div>`;
    }
    
    const grid = document.getElementById('newsGrid');
    if (grid) {
      grid.innerHTML = articles.map(a => {
        const img = getImageUrl(a.imageFileId || a.imageUrl);
        return `<div class="news-card" style="border-top:4px solid ${DEFAULT_COLOR};">${img?`<img src="${img}">`:''}<div style="padding:15px;"><h4>${safeText(a.title)}</h4><p>${safeText(a.content).substring(0,100)}...</p></div></div>`;
      }).join('');
    }
  }catch(e){
    console.error(e);
  }finally{
    hideAllLoaders();
  }
}
document.addEventListener('DOMContentLoaded', loadArticles);