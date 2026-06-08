// DEBUG admin.js
(() => {
  const ADMIN='nowanad@gmail.com',ENDPOINT='https://nyc.cloud.appwrite.io/v1',PROJECT='khabardarjeeling',H={'X-Appwrite-Project':PROJECT};
  const api=(p,o={})=>fetch(`${ENDPOINT}${p}`,{...o,headers:{...H,...(o.headers||{})},credentials:'include'});

  (async()=>{
    const r=await api('/account');
    const u=await r.json();
    if(!r.ok){alert('ADMIN: Not logged in');location.href='login.html';return}
    alert('ADMIN: Your email is "'+u.email+'" | Required is "'+ADMIN+'"'); // DEBUG
    if(u.email.toLowerCase().trim()!==ADMIN.toLowerCase()){
      alert('ACCESS DENIED - emails do not match');
      return;
    }
    alert('ACCESS GRANTED - loading admin');
    document.getElementById('loginScreen').style.display='none';
    document.getElementById('adminPanel').style.display='block';
  })();
})();