function getImageUrl(id){
  if(!id) return '';
  return `${window.ENDPOINT}/storage/buckets/article-image/files/${id}/view?project=khabardarjeeling`;
}
function safe(t){return t||''}
function date(d){return new Date(d).toLocaleDateString()}

async function load(){
  try{
    const res = await window.databases.listDocuments('Khabar_db','articles',[
      window.Query.equal('status','approved'),
      window.Query.orderDesc('$createdAt'),
      window.Query.limit(20)
    ]);
    const arts = res.documents||[];

    document.getElementById('breakingTicker').textContent = arts.slice(0,3).map(a=>a.title).join(' • ') || 'No news';

    const f = arts[0];
    if(f){
      document.getElementById('featuredStory').innerHTML = `
        ${getImageUrl(f.imageFileId)?`<img src="${getImageUrl(f.imageFileId)}" style="width:100%;max-height:300px;object-fit:cover">`:''}
        <h2>${safe(f.title)}</h2><p>${safe(f.location)} • ${date(f.$createdAt)}</p>
      `;
    }

    document.getElementById('newsGrid').innerHTML = arts.map(a=>`
      <div style="border:1px solid #eee;padding:12px">
        <h4>${safe(a.title)}</h4>
        <p>${safe(a.content).substring(0,100)}...</p>
      </div>
    `).join('');

  }catch(e){
    document.getElementById('breakingTicker').textContent = 'Error: '+e.message;
  }
}
document.addEventListener('DOMContentLoaded', load);