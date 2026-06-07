// js/admin.js — CSP-clean FIXED for 'posts' collection
(function () {
    const ADMIN_EMAIL = 'nowanad@gmail.com';
    const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
    const PROJECT = 'khabardarjeeling';
    const DB = 'Khabar_db';
    const COL = 'posts'; // <-- FIXED: was 'articles'
    const H = { 'X-Appwrite-Project': PROJECT };

    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const loginError = document.getElementById('loginError');

    const api = (path, opts={}) => fetch(`${ENDPOINT}${path}`, {
        ...opts,
        headers: { ...H, ...(opts.headers||{}) },
        credentials: 'include'
    });

    function showError(msg){ if(!loginError) return; loginError.textContent=msg; loginError.className='status-box error'; loginError.style.display='block'; }
    function clearError(){ if(!loginError) return; loginError.textContent=''; loginError.style.display='none'; }

    window.showTab = function(tabName){
        document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(i=>i.classList.remove('active'));
        document.getElementById(tabName)?.classList.add('active');
        if(window.event?.target) window.event.target.classList.add('active');
        if(tabName==='dashboard') loadDashboard();
        if(tabName==='published') loadPublishedArticles();
    };

    async function checkExistingSession(){
        try{
            const r = await api('/account');
            if(r.ok) showAdminPanel(await r.json());
            else if(loginScreen) loginScreen.style.display='flex';
        }catch{ if(loginScreen) loginScreen.style.display='flex'; }
    }

    if(loginForm){
        loginForm.addEventListener('submit', async e=>{
            e.preventDefault(); clearError();
            const email=document.getElementById('email').value.trim();
            const password=document.getElementById('password').value;
            try{
                const r = await api('/account/sessions/email', {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({email,password})
                });
                if(!r.ok) throw new Error('Invalid credentials');
                const user = await (await api('/account')).json();
                showAdminPanel(user);
            }catch(err){ showError('Login failed: '+(err.message||'Unknown')); }
        });
    }

    if(logoutBtn){
        logoutBtn.addEventListener('click', async ()=>{
            await api('/account/sessions/current',{method:'DELETE'});
            location.reload();
        });
    }

    function showAdminPanel(user){
        if(user.email !== ADMIN_EMAIL){
            alert('Access denied. Admins only.');
            location.href='index.html'; return;
        }
        if(loginScreen) loginScreen.style.display='none';
        if(adminPanel) adminPanel.style.display='block';
        if(logoutBtn) logoutBtn.style.display='inline-block';
        const u=document.getElementById('adminUser'); if(u) u.textContent=user.email;
        loadDashboard();
    }

    async function loadDashboard(){
        try{
            const r = await api(`/databases/${DB}/collections/${COL}/documents?queries[]=limit(100)`);
            const data = await r.json();
            const published = data.documents.filter(a=>a.status==='published').length;
            document.getElementById('totalArticles').textContent = data.total ?? data.documents.length;
            document.getElementById('publishedCount').textContent = published;
        }catch(e){ console.error(e); }
    }

    async function loadPublishedArticles(){
        const list=document.getElementById('publishedArticlesList');
        if(!list) return; list.innerHTML='Loading...';
        try{
            const q = [
                `equal("status","published")`,
                `orderDesc("$createdAt")`,
                `limit(50)`
            ].map(s=>`queries[]=${encodeURIComponent(s)}`).join('&');
            const r = await api(`/databases/${DB}/collections/${COL}/documents?${q}`);
            const data = await r.json();

            list.innerHTML = data.documents.map(a=>`
                <div class="article-card">
                    ${a.imageFileId ? `<img src="${ENDPOINT}/storage/buckets/article-image/files/${a.imageFileId}/view?project=${PROJECT}" alt="">` : ''}
                    <div class="article-content">
                        <h3>${escapeHtml(a.title||'Untitled')}</h3>
                        <p style="margin:5px 0;font-size:13px;color:#666;">
                            <strong>Location:</strong> ${escapeHtml(a.location||'—')} |
                            <strong>Author:</strong> ${escapeHtml(a.authorName||a.submitterName||'Anonymous')} |
                            <strong>Category:</strong> ${escapeHtml(a.category||'general')}
                        </p>
                        <p style="font-size:14px;">${escapeHtml((a.content||'').substring(0,150))}...</p>
                        <div style="margin-top:12px;display:flex;gap:15px;align-items:center;flex-wrap:wrap;border-top:1px solid #eee;padding-top:10px">
                            <label><input type="checkbox" class="featured-checkbox" onchange="toggleFeatured('${a.$id}',this.checked,this)" ${a.featured?'checked':''}> ⭐ Featured</label>
                            <label><input type="checkbox" onchange="toggleTopNews('${a.$id}',this.checked)" ${a.isTopNews?'checked':''}> 🔥 Top News</label>
                            <button style="margin-left:auto;background:#dc3545;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer" onclick="deleteArticle('${a.$id}')">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `).join('') || '<p style="padding:15px">No posts yet</p>';
        }catch(e){ list.innerHTML=`<p style="color:red;padding:15px">Error: ${e.message}</p>`; }
    }

    window.toggleFeatured = async (id,checked,el)=>{
        if(checked && document.querySelectorAll('.featured-checkbox:checked').length>3){
            alert('Only 3 featured allowed'); el.checked=false; return;
        }
        await api(`/databases/${DB}/collections/${COL}/documents/${id}`,{
            method:'PATCH',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({data:{featured:checked}}) // <-- FIXED: was isFeatured
        });
    };

    window.toggleTopNews = async (id,checked)=>{
        await api(`/databases/${DB}/collections/${COL}/documents/${id}`,{
            method:'PATCH',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({data:{isTopNews:checked}})
        });
    };

    window.deleteArticle = async id=>{
        if(!confirm('Delete permanently?')) return;
        await api(`/databases/${DB}/collections/${COL}/documents/${id}`,{method:'DELETE'});
        loadPublishedArticles(); loadDashboard();
    };

    function escapeHtml(t){ const d=document.createElement('div'); d.textContent=t||''; return d.innerHTML; }

    checkExistingSession();
})();