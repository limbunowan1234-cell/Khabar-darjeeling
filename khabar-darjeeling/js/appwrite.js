// js/index.js?v=130 - forces loaders off, no categories, no Eruda
const PROJECT_ID = 'khabardarjeeling';
const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const DEFAULT_COLOR = '#c41e3a';

function hideAllLoaders() {
  // 1) the HTML loader
  document.getElementById('gatekeeperLoader')?.remove();
  // 2) the auth overlay from appwrite.js (find by text)
  document.querySelectorAll('div, p, span').forEach(el => {
    if (el.textContent && el.textContent.includes('Checking authentication')) {
      el.closest('div[style*="position:fixed"], body > div')?.remove();
    }
  });
}

function getAppwriteObjects() { /* same as before */ 
  return {
    databases: window.databases || window.database,
    Query: window.Query,
    APPWRITE_DATABASE_ID: window.APPWRITE_DB_ID || window.APPWRITEDBID,
    APPWRITE_COLLECTION_ID: window.APPWRITE_COLLECTION_ID || window.APPWRITECOLLECTIONID
  };
}
function safeText(v){return v==null?'':String(v)}
function safeDate(v){const d=new Date(v);return isNaN(d)?'Date unknown':d.toLocaleDateString()}
function getImageUrl(id){if(!id||['Text','null','undefined','<URL>'].includes(id))return'';return id.startsWith('http')?id:`${ENDPOINT}/storage/buckets/article-image/files/${id}/view?project=${PROJECT_ID}`}

async function loadArticles(){
  try{
    const {databases,Query,APPWRITE_DATABASE_ID,APPWRITE_COLLECTION_ID}=getAppwriteObjects();
    if(!databases||!Query||!APPWRITE_DATABASE_ID||!APPWRITE_COLLECTION_ID) throw new Error('Appwrite not initialized');

    const res = await databases.listDocuments(APPWRITE_DATABASE_ID,APPWRITE_COLLECTION_ID,[
      Query.equal('status','approved'), Query.orderDesc('$createdAt'), Query.limit(20)
    ]);
    const articles=res.documents||[];

    document.getElementById('breakingTicker').textContent = articles.slice(0,3).map(a=>safeText(a.title)).join(' • ') || 'No breaking news';

    // featured + grid (same simplified code as before, using DEFAULT_COLOR)
    // ... [keep your existing rendering code here] ...

  }catch(e){
    console.error('Load failed:',e);
    document.getElementById('newsGrid').innerHTML='<p>Error loading news. Please refresh.</p>';
  }finally{
    hideAllLoaders(); // <-- THIS is the fix
  }
}

document.addEventListener('DOMContentLoaded', loadArticles);