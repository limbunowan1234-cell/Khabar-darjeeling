// DEBUG post.js
(() => {
  const ENDPOINT='https://nyc.cloud.appwrite.io/v1',PROJECT='khabardarjeeling',DB='Khabar_db',COL='articles',H={'X-Appwrite-Project':PROJECT};
  const api=(p,o={})=>fetch(`${ENDPOINT}${p}`,{...o,headers:{...H,...(o.headers||{})},credentials:'include'});
  const $=id=>document.getElementById(id);

  (async()=>{
    try{
      const r=await api('/account');
      const data=await r.json();
      if(!r.ok) throw new Error(data.message);
      alert('POST PAGE: Logged in as '+data.email); // DEBUG
      $('authorName').textContent=data.name;
      $('gatekeeperLoader').style.display='none';
      window.CURRENT_USER=data;
    }catch(e){
      alert('POST PAGE: Not logged in, redirecting. Error: '+e.message);
      location.href='login.html';
    }
  })();
})();