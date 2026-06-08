const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT = 'khabardarjeeling';
const DB = 'khabardarjeeling_db';
const COL = 'articles';
const BUCKET = 'article_images';

const session = localStorage.getItem('kd_jwt');
if (!session) {
  alert('Please login first');
  location.href = '/login.html';
}

const H = {
  'X-Appwrite-Project': PROJECT,
  'X-Appwrite-Session': session
};

const api = (path, opts={}) => fetch(`${ENDPOINT}${path}`, {
 ...opts,
  headers: {...H, 'Content-Type':'application/json',...(opts.headers||{})}
});

document.getElementById('postForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Posting...';

  try {
    const me = await fetch(`${ENDPOINT}/account`, {headers:H}).then(r=>r.json());

    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const category = document.getElementById('category').value;
    const locationVal = document.getElementById('location').value;
    const file = document.getElementById('image').files[0];

    if(!title ||!content ||!file) throw new Error('Fill all fields');

    // Upload image
    const fd = new FormData();
    fd.append('fileId', 'unique()');
    fd.append('file', file);
    const upRes = await fetch(`${ENDPOINT}/storage/buckets/${BUCKET}/files`, {
      method:'POST',
      headers: {'X-Appwrite-Project': PROJECT, 'X-Appwrite-Session': session},
      body: fd
    });
    if(!upRes.ok) throw new Error('Image upload failed');
    const up = await upRes.json();

    // Create article
    const doc = {
      title, content, category,
      location: locationVal,
      imageFileId: up.$id,
      authorName: me.name || me.email.split('@')[0],
      authorId: me.$id,
      status: 'pending',
      publishedAt: new Date().toISOString()
    };

    const createRes = await api(`/databases/${DB}/collections/${COL}/documents`, {
      method:'POST',
      body: JSON.stringify({
        documentId: 'unique()',
        data: doc,
        permissions: ['read("any")']
      })
    });

    if(!createRes.ok) throw new Error('Failed to save article');

    alert('✅ Posted! Waiting for admin approval');
    location.href = '/';

  } catch(err) {
    alert('Error: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Post Article';
  }
});