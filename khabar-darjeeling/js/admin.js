const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT = 'khabardarjeeling';
const DB = 'khabardarjeeling_db';
const COL = 'articles';

const jwt = localStorage.getItem('kd_jwt');
if (!jwt) location.href = '/login.html';

const H = {
  'X-Appwrite-Project': PROJECT,
  'X-Appwrite-JWT': jwt,
  'Content-Type': 'application/json'
};

const api = (p,o={}) => fetch(`${ENDPOINT}${p}`,{...o, headers:{...H,...(o.headers||{})}});

(async () => {
  // Verify admin
  const me = await api('/account').then(r=>r.json());
  if (me.email.toLowerCase()!== 'nowanad@gmail.com') {
    document.body.innerHTML = '<h2 style="padding:40px;text-align:center">Access denied</h2>';
    return;
  }

  loadPending();
})();

async function loadPending() {
  const q = encodeURIComponent('queries[]=' + JSON.stringify({method:'equal',attribute:'status',values:['pending']}));
  const res = await api(`/databases/${DB}/collections/${COL}/documents?${q}`).then(r=>r.json());
  const box = document.getElementById('pendingList');
  if (!res.documents.length) {
    box.innerHTML = '<p>No pending articles</p>';
    return;
  }
  box.innerHTML = res.documents.map(d=>`
    <div style="border:1px solid #ddd;padding:16px;margin:12px 0;border-radius:8px">
      <h3>${d.title}</h3>
      <p style="color:#666;font-size:14px">By ${d.authorName} • ${d.category}</p>
      <p>${d.content.substring(0,150)}...</p>
      <button onclick="approve('${d.$id}')" style="background:#2e7d32;color:#fff;border:none;padding:8px 16px;border-radius:6px;margin-right:8px;cursor:pointer">Approve</button>
      <button onclick="reject('${d.$id}')" style="background:#d32f2f;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer">Reject</button>
    </div>
  `).join('');
}

window.approve = async (id) => {
  await api(`/databases/${DB}/collections/${COL}/documents/${id}`, {
    method:'PATCH',
    body: JSON.stringify({data:{status:'approved'}})
  });
  loadPending();
};

window.reject = async (id) => {
  await api(`/databases/${DB}/collections/${COL}/documents/${id}`, {
    method:'DELETE'
  });
  loadPending();
};