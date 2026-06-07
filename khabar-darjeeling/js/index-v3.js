function imgUrl(id){
  return id ? `${window.ENDPOINT}/storage/buckets/article-image/files/${id}/view?project=${window.PROJECT_ID}` : '';
}

async function loadNews(){
  const data = await window.databases.listDocuments();
  const articles = data.documents || [];

  // Breaking ticker
  document.getElementById('breakingTicker').textContent = articles.slice(0,3).map(a=>a.title).join(' • ');

  // Featured
  const first = articles[0];
  if(first){
    document.getElementById('featuredStory').innerHTML = `
      <article class="featured-card">
        ${first.imageFileId ? `<img src="${imgUrl(first.imageFileId)}" alt="${first.title}" onerror="this.remove()">` : ''}
        <div class="featured-content">
          <h1>${first.title}</h1>
          <div class="meta">${first.location||'Darjeeling'} • ${new Date(first.$createdAt).toLocaleDateString('en-IN')}</div>
          <p>${(first.content||'').substring(0,200)}...</p>
        </div>
      </article>
    `;
  }

  // Grid
  document.getElementById('newsGrid').innerHTML = articles.slice(1).map(a=>`
    <article class="news-card">
      ${a.imageFileId ? `<img src="${imgUrl(a.imageFileId)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
      <h3>${a.title}</h3>
      <p>${(a.content||'').substring(0,100)}...</p>
    </article>
  `).join('');
}

loadNews();