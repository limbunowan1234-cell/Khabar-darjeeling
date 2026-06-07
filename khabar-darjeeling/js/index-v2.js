async function load(){
  const res = await fetch(`${window.ENDPOINT}/databases/Khabar_db/collections/articles/documents?queries[]=${encodeURIComponent('orderDesc("$createdAt")')}&queries[]=${encodeURIComponent('limit(20)')}`, {
    headers: { 'X-Appwrite-Project': 'khabardarjeeling' }
  });
  const data = await res.json();
  const arts = data.documents || [];

  // breaking ticker
  document.getElementById('breakingTicker').textContent = arts.slice(0,3).map(a=>a.title).join(' • ');

  // featured
  const f = arts[0];
  if(f){
    const img = f.imageFileId? `<img src="${window.ENDPOINT}/storage/buckets/article-image/files/${f.imageFileId}/view?project=khabardarjeeling" style="width:100%;max-height:320px;object-fit:cover;border-radius:8px;margin-bottom:12px" onerror="this.style.display='none'">` : '';
    document.getElementById('featuredStory').innerHTML = `${img}<h2 style="margin:8px 0">${f.title}</h2><p style="color:#666">${f.location||''} • ${new Date(f.$createdAt).toLocaleDateString()}</p><p>${(f.content||'').substring(0,180)}...</p>`;
  }

  // grid
  document.getElementById('newsGrid').innerHTML = arts.slice(1).map(a=>`
    <div style="background:#fff;padding:12px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
      <h4 style="margin:0 0 6px">${a.title}</h4>
      <p style="margin:0;color:#555;font-size:14px">${(a.content||'').substring(0,90)}...</p>
    </div>
  `).join('');
}
document.addEventListener('DOMContentLoaded', load);