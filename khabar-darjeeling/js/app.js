const ENDPOINT='https://nyc.cloud.appwrite.io/v1';
const PROJECT='khabardarjeeling';

async function load(){
  // NO queries with quotes - avoids the 400 error
  const url = `${ENDPOINT}/databases/Khabar_db/collections/articles/documents?limit=20`;
  const r = await fetch(url, {headers:{'X-Appwrite-Project':PROJECT}});
  const data = await r.json();
  const arts = data.documents || [];

  document.getElementById('loader')?.remove();
  document.getElementById('ticker').textContent = arts.slice(0,3).map(a=>a.title).join(' • ') || 'No articles';

  if(arts[0]){
    const f=arts[0];
    document.getElementById('featured').innerHTML = `<article><h1>${f.title}</h1><p>${(f.content||'').substring(0,200)}...</p></article>`;
  }
  document.getElementById('grid').innerHTML = arts.slice(1).map(a=>`<article><h3>${a.title}</h3><p>${(a.content||'').substring(0,100)}...</p></article>`).join('');
}
load();