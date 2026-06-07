const API = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT = 'khabardarjeeling';
const DB = 'Khabar_db';
const COL = 'articles';

const img = id => id? `${API}/storage/buckets/article-image/files/${id}/view?project=${PROJECT}` : '';

async function init(){
  try{
    const url = `${API}/databases/${DB}/collections/${COL}/documents?limit=25`;
    const res = await fetch(url, { headers: {'X-Appwrite-Project': PROJECT }});
    const {documents=[]} = await res.json();

    // sort newest first client-side (avoids CSP/400 issues)
    const arts = documents.sort((a,b)=> new Date(b.$createdAt) - new Date(a.$createdAt));

    document.getElementById('loader')?.remove();
    document.getElementById('ticker').textContent = arts.slice(0,4).map(a=>a.title).join(' • ');

    if(arts[0]){
      const f = arts[0];
      document.getElementById('featured').innerHTML = `
        <article class="featured-card">
          ${f.imageFileId?`<img src="${img(f.imageFileId)}" alt="">`:''}
          <div>
            <h1>${f.title}</h1>
            <p>${(f.content||'').slice(0,220)}...</p>
          </div>
        </article>`;
    }

    document.getElementById('grid').innerHTML = arts.slice(1).map(a=>`
      <article class="card">
        ${a.imageFileId?`<img src="${img(a.imageFileId)}" alt="" loading="lazy">`:''}
        <h3>${a.title}</h3>
        <p>${(a.content||'').slice(0,100)}...</p>
      </article>
    `).join('');

  }catch(e){
    document.getElementById('ticker').textContent = 'Unable to load news';
    document.getElementById('loader')?.remove();
  }
}
init();