// js/post.js — writes to YOUR 'articles' collection
(() => {
  const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
  const PROJECT = 'khabardarjeeling';
  const DB = 'Khabar_db';
  const COL = 'articles'; // <-- YOUR REAL TABLE
  const IMAGE_BUCKET = 'article-image';
  const H = { 'X-Appwrite-Project': PROJECT };

  const api = (p,o={})=>fetch(`${ENDPOINT}${p}`,{...o,headers:{...H,...(o.headers||{})},credentials:'include'});

  const $=id=>document.getElementById(id);
  const hideLoader=()=>{const l=$('gatekeeperLoader');if(l){l.style.opacity='0';setTimeout(()=>l.style.display='none',300)}};
  const showAlert=(m,t='success')=>{const a=$('alertBox');a.textContent=m;a.className=`alert ${t}`;a.style.display='block';if(t!=='error')setTimeout(()=>a.style.display='none',5000)};
  const getInitials=n=>(n||'?').split(' ').filter(Boolean).map(x=>x[0]).join('').toUpperCase().slice(0,2)||'?';
  const ytId=u=>{if(!u)return null;const m=u.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);return m?m[1]:null};

  // dark mode
  if(localStorage.getItem('theme')==='dark')document.body.classList.add('dark-mode');
  $('darkModeToggle')?.addEventListener('click',()=>{document.body.classList.toggle('dark-mode');localStorage.setItem('theme',document.body.classList.contains('dark-mode')?'dark':'light')});

  // counters
  $('title')?.addEventListener('input',e=>{const c=e.target.value.length;$('titleCounter').textContent=`${c} / 200 characters`});
  $('content')?.addEventListener('input',e=>{const c=e.target.value.length;$('contentCounter').textContent=`${c} / min 100 characters`});

  // image preview
  $('image')?.addEventListener('change',e=>{const f=e.target.files[0],p=$('imagePreview');if(!f){p.style.display='none';return}if(f.size>5*1024*1024){showAlert('Image exceeds 5MB','error');e.target.value='';return}const r=new FileReader();r.onload=ev=>{p.src=ev.target.result;p.style.display='block'};r.readAsDataURL(f)});

  // preview
  $('previewBtn')?.addEventListener('click',()=>{const t=$('title').value.trim(),c=$('content').value.trim();if(!t||!c)return showAlert('Fill title & content','error');const w=window.open('','_blank');w.document.write(`<h2>${t}</h2><p>${c}</p>`)});

  let user=null;
  // gatekeeper
  (async()=>{try{const r=await api('/account');if(!r.ok)throw 0;user=await r.json();$('authorName').textContent=user.name||user.email.split('@')[0];$('authorAvatar').textContent=getInitials(user.name);hideLoader()}catch{location.href='login.html'}})();

  // submit
  $('postForm')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const btn=$('submitBtn');btn.disabled=true;btn.textContent='Publishing...';
    try{
      const title=$('title').value.trim(), content=$('content').value.trim(), category=$('category').value, location=$('location').value.trim(), yt=$('youtubeUrl').value.trim(), isBreaking=$('isBreaking').checked, file=$('image').files[0];
      if(!title||!content||!category||!location)throw new Error('Fill all required fields');
      if(content.length<100)throw new Error('Content must be 100+ chars');

      let imageFileId=null;
      if(file){const fd=new FormData();fd.append('fileId','unique()');fd.append('file',file);const up=await api(`/storage/buckets/${IMAGE_BUCKET}/files`,{method:'POST',body:fd});if(!up.ok)throw new Error('Image upload failed');imageFileId=(await up.json()).$id}

      const doc={title,content,category,location,status:'published',authorName:user.name||'Reporter',authorEmail:user.email,submitterId:user.$id,imageFileId,youtube_id:ytId(yt),featured:isBreaking,views:0,createdAt:new Date().toISOString()};

      const res=await api(`/databases/${DB}/collections/${COL}/documents`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({documentId:'unique()',data:doc,permissions:['read("any")']})});
      if(!res.ok)throw new Error((await res.json()).message);

      showAlert('✅ Published! Live on homepage','success');
      setTimeout(()=>location.href='index.html',1200);
    }catch(err){showAlert(err.message,'error');btn.disabled=false;btn.innerHTML='Publish Now'}
  });
})();