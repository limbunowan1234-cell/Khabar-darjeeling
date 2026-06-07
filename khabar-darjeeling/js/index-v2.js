async function load(){
  try{
    const url = `${window.ENDPOINT}/databases/Khabar_db/collections/articles/documents?limit=20`;
    const res = await fetch(url, { headers: { 'X-Appwrite-Project': 'khabardarjeeling' }});
    const data = await res.json();
    console.log('Appwrite response:', data);
    
    const arts = data.documents || [];
    document.getElementById('breakingTicker').textContent = arts.length ? arts[0].title : 'Found '+arts.length+' docs (check status field)';
    document.getElementById('newsGrid').innerHTML = arts.map(a=>`<div style="padding:10px;border-bottom:1px solid #eee"><b>${a.title}</b></div>`).join('');
  }catch(e){
    document.getElementById('breakingTicker').textContent = 'Fetch error: '+e;
    console.error(e);
  }
}
document.addEventListener('DOMContentLoaded', load);