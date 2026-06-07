async function load(){
  try{
    const res = await window.databases.listDocuments('Khabar_db','articles',[
      window.Query.equal('status','approved'),
      window.Query.orderDesc('$createdAt'),
      window.Query.limit(20)
    ]);
    const arts = res.documents||[];
    document.getElementById('breakingTicker').textContent = arts.map(a=>a.title).slice(0,3).join(' • ') || 'No news';
    document.getElementById('newsGrid').innerHTML = arts.map(a=>`<div style="padding:10px;border-bottom:1px solid #eee"><b>${a.title}</b><br>${(a.content||'').substring(0,80)}...</div>`).join('');
  }catch(e){
    document.getElementById('breakingTicker').textContent = 'Error: '+e.message;
  }
}
document.addEventListener('DOMContentLoaded', load);