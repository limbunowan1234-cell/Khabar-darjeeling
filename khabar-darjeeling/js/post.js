const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT = 'khabardarjeeling';
const DB = 'khabardarjeeling_db';
const COL = 'articles';
const BUCKET = 'article_images';

const jwt = localStorage.getItem('kd_jwt');
if (!jwt) {
  alert('Please login first');
  location.href = '/login.html';
}

const H = {
  'X-Appwrite-Project': PROJECT,
  'X-Appwrite-JWT': jwt,
  'Content-Type': 'application/json'
};

const api = (path, opts={}) => fetch(`${ENDPOINT}${path}`, {...opts, headers:{...H,...(opts.headers||{})}});

document.getElementById('postForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Posting...';

  try {
    // Get user info
    const me = await api('/account').then(r=>r.json());

    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value;
    const file = document.getElementById('image').files[0];

    if (!file) throw new Error('Select an image');

    // 1. Upload image
    const fd = new FormData();
    fd.append('fileId', 'unique()');
    fd.append('file', file);
    const up = await fetch(`${ENDPOINT}/storage/buckets/${BUCKET}/files`, {
      method:'POST',
      headers:{'X-Appwrite-Project':PROJECT,'X-Appwrite-JWT':jwt},
      body: fd
    }).then(r=>r.json());

    // 2. Create article
    const doc = {
      title, content, category, location,
      imageFileId: up.$id,
      authorName: me.name || me.email.split('@')[0],
      authorId: me.$id,
      status: 'pending',
      publishedAt: new Date().toISOString()
    };

    await api(`/databases/${DB}/collections/${COL}/documents`, {
      method:'POST',
      body: JSON.stringify({documentId:'unique()', data:doc, permissions:["read(\"any\")"]})
    });

    alert('✅ Posted! Waiting for admin approval');
    location.href = '/';

  } catch(err) {
    alert('Error: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Post Article';
  }
});