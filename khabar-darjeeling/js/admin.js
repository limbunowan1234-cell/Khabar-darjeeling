const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT = 'khabardarjeeling';
const DB = 'khabardarjeeling_db';
const COL = 'articles';
const ADMIN_EMAIL = 'nowanad@gmail.com';

const session = localStorage.getItem('kd_jwt');
if (!session) {
  alert('Please login first');
  location.href = '/login.html';
}

const H = {
  'X-Appwrite-Project': PROJECT,
  'X-Appwrite-Session': session,
  'Content-Type': 'application/json'
};

const api = (path, opts={}) => fetch(`${ENDPOINT}${path}`, {
  ...opts,
  headers: {...H, ...(opts.headers||{})}
});

(async () => {
  try {
    // Verify admin
    const me = await fetch(`${ENDPOINT}/account`, {headers:H}).then(r=>r.json());
    
    if (me.email?.toLowerCase() !== ADMIN_EMAIL) {
      document.body.innerHTML = `
        <div style="padding:40px;text-align:center;font-family:system-ui">
          <h2>⛔ Access Denied</h2>
          <p>You are logged in as ${me.email}</p>
          <p>Only ${ADMIN_EMAIL} can access admin.</p>
          <a href="/" style="color:#c41e3a">Go Home</a>
        </div>`;
      return;
    }

    document.getElementById('adminEmail').textContent = me.email;
    loadPending();

  } catch(e) {
    localStorage.clear();
    location.href = '/login.html';
  }
})();

async function loadPending() {
  const list = document.getElementById('pendingList');
  list.innerHTML = '<p>Loading...</p>';
  
  try {
    const queries = [
      encodeURIComponent('queries[]') + '=' + encodeURIComponent(JSON.stringify({
        method: 'equal',
        attribute: 'status',
        values: ['pending']
      })),
      encodeURIComponent('queries[]') + '=' + encodeURIComponent(JSON.stringify({
        method: 'orderDesc',
        attribute: '$createdAt'
      }))
    ].join('&');

    const res = await api(`/databases/${DB}/collections/${COL}/documents?${queries}`).then(r=>r.json());
    
    if (!res.documents || res.documents.length === 0) {
      list.innerHTML = `
        <div style="text-align:center;padding:40px;background:#f5f5f5;border-radius:12px">
          <h3>✅ All caught up!</h3>
          <p>No pending articles</p>
        </div>`;
      return;
    }

    list.innerHTML = res.documents.map(d => `
      <div style="border:1px solid #e0e0e0;padding:20px;margin:16px 0;border-radius:12px;background:#fff">
        <div style="display:flex;gap:16px">
          <img src="https://nyc.cloud.appwrite.io/v1/storage/buckets/article_images/files/${d.imageFileId}/preview?project=${PROJECT}&width=120" 
               style="width:120px;height:80px;object-fit:cover;border-radius:8px" 
               onerror="this.style.display='none'">
          <div style="flex:1">
            <h3 style="margin:0 0 8px 0">${d.title}</h3>
            <p style="margin:0;color:#666;font-size:14px">
              By ${d.authorName} • ${d.category} • ${d.location || 'Darjeeling'}
            </p>
            <p style="margin:8px 0 0 0;color:#444;font-size:14px;line-height:1.4">
              ${d.content.substring(0, 150)}...
            </p>
          </div>
        </div>
        <div style="margin-top:16px;display:flex;gap:8px">
          <button onclick="approve('${d.$id}')" 
                  style="flex:1;background:#2e7d32;color:#fff;border:none;padding:12px;border-radius:8px;font-weight:600;cursor:pointer">
            ✓ Approve
          </button>
          <button onclick="reject('${d.$id}')" 
                  style="flex:1;background:#d32f2f;color:#fff;border:none;padding:12px;border-radius:8px;font-weight:600;cursor:pointer">
            ✗ Reject
          </button>
          <button onclick="viewArticle('${d.$id}')" 
                  style="background:#f5f5f5;border:1px solid #ddd;padding:12px 16px;border-radius:8px;cursor:pointer">
            👁️
          </button>
        </div>
      </div>
    `).join('');

  } catch(err) {
    list.innerHTML = `<p style="color:red">Error loading: ${err.message}</p>`;
  }
}

window.approve = async (id) => {
  if (!confirm('Approve this article?')) return;
  
  await api(`/databases/${DB}/collections/${COL}/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: { status: 'approved' } })
  });
  
  alert('✅ Approved!');
  loadPending();
};

window.reject = async (id) => {
  if (!confirm('Delete this article permanently?')) return;
  
  await api(`/databases/${DB}/collections/${COL}/documents/${id}`, {
    method: 'DELETE'
  });
  
  alert('🗑️ Deleted');
  loadPending();
};

window.viewArticle = (id) => {
  window.open(`/article.html?id=${id}`, '_blank');
};

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.clear();
  location.href = '/';
});