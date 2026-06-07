const ENDPOINT='https://nyc.cloud.appwrite.io/v1';
const PROJECT='khabardarjeeling';
const HEADERS={'X-Appwrite-Project':PROJECT};

const $=id=>document.getElementById(id);
const gatekeeper=$('gatekeeperLoader'),feedback=$('feedback');
const forms={login:$('loginForm'),signup:$('signupForm'),forgot:$('forgotForm')};

function setFeedback(t,m){feedback.className=`status-feedback ${t||''}`;feedback.textContent=m||''}
function showForm(n){Object.values(forms).forEach(f=>f.classList.add('hidden'));forms[n].classList.remove('hidden');setFeedback('','')}
function togglePwd(i,b){const e=$(i);e.type=e.type==='password'?'text':'password';$(b).textContent=e.type==='password'?'👁':'🙈'}

// ALWAYS hide loader after 1.5s even if JS fails
setTimeout(()=>gatekeeper?.classList.add('hide'),1500);

async function checkAuth(){
  try{
    const r=await fetch(`${ENDPOINT}/account`,{method:'GET',headers:HEADERS,credentials:'include'});
    if(r.ok){ location.href='index.html'; return; }
  }catch(e){ console.log('auth check failed',e); }
  gatekeeper.classList.add('hide');
}

async function login(e){
  e.preventDefault();
  const email=$('loginEmail').value.trim(),pwd=$('loginPassword').value,btn=$('loginBtn');
  btn.disabled=true; setFeedback('error','Verifying...');
  try{
    const r=await fetch(`${ENDPOINT}/account/sessions/email`,{
      method:'POST',
      headers:{...HEADERS,'Content-Type':'application/json'},
      credentials:'include',
      body:JSON.stringify({email,password:pwd})
    });
    if(!r.ok) throw new Error(await r.text());
    setFeedback('success','✓ Login successful!'); 
    setTimeout(()=>location.href='index.html',600);
  }catch(err){ setFeedback('error','Incorrect email or password.'); btn.disabled=false; }
}

async function signup(e){
  e.preventDefault();
  const name=$('signupName').value.trim(),email=$('signupEmail').value.trim(),pwd=$('signupPassword').value,cf=$('signupPasswordConfirm').value,btn=$('signupBtn');
  if(pwd!==cf) return setFeedback('error','Passwords do not match.');
  btn.disabled=true; setFeedback('error','Creating...');
  try{
    const r=await fetch(`${ENDPOINT}/account`,{method:'POST',headers:{...HEADERS,'Content-Type':'application/json'},body:JSON.stringify({userId:'unique()',email,password:pwd,name})});
    if(!r.ok) throw new Error((await r.json()).message);
    setFeedback('success','✓ Account created! Please log in.'); showForm('login');
  }catch(err){ setFeedback('error',err.message.includes('already')?'Email already registered.':'Could not create.'); btn.disabled=false; }
}

async function forgot(e){
  e.preventDefault();
  const email=$('forgotEmail').value.trim(),btn=$('forgotBtn');
  btn.disabled=true; setFeedback('error','Sending...');
  try{
    await fetch(`${ENDPOINT}/account/recovery`,{method:'POST',headers:{...HEADERS,'Content-Type':'application/json'},body:JSON.stringify({email,url:'https://khabardarjeeling.space/reset-password.html'})});
    setFeedback('success','✓ Reset link sent.');
  }catch{ setFeedback('error','Could not send.'); } finally{ btn.disabled=false; }
}

// wire up
$('darkModeToggle').onclick=()=>{document.body.classList.toggle('dark-mode');localStorage.setItem('theme',document.body.classList.contains('dark-mode')?'dark':'light')};
$('loginPasswordToggle').onclick=()=>togglePwd('loginPassword','loginPasswordToggle');
$('signupPasswordToggle').onclick=()=>togglePwd('signupPassword','signupPasswordToggle');
$('signupPasswordConfirmToggle').onclick=()=>togglePwd('signupPasswordConfirm','signupPasswordConfirmToggle');
$('signupLink').onclick=()=>showForm('signup');
$('loginLinkFromSignup').onclick=()=>showForm('login');
$('forgotLink').onclick=e=>{e.preventDefault();showForm('forgot')};
$('backToLoginFromForgot').onclick=()=>showForm('login');
forms.login.onsubmit=login; forms.signup.onsubmit=signup; forms.forgot.onsubmit=forgot;

if(localStorage.getItem('theme')==='dark') document.body.classList.add('dark-mode');
showForm('login');
checkAuth();