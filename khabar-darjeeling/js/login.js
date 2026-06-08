async function signup(e){
  e.preventDefault();
  const name=$('signupName').value.trim(),
        email=$('signupEmail').value.trim(),
        pwd=$('signupPassword').value,
        cf=$('signupPasswordConfirm').value,
        btn=$('signupBtn');
  if(pwd!==cf) return setFeedback('error','Passwords do not match.');
  if(pwd.length<8) return setFeedback('error','Password must be at least 8 characters.');
  btn.disabled=true; setFeedback('','Creating...');

  // Generate a unique ID (timestamp + random)
  const userId='user_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);

  try{
    const r=await fetch(`${ENDPOINT}/account`,{
      method:'POST',
      headers:{...HEADERS,'Content-Type':'application/json'},
      body:JSON.stringify({userId, email, password:pwd, name})
    });
    const data=await r.json();
    if(!r.ok) throw new Error(data.message||'Signup failed');

    // Auto-login after signup
    const s=await fetch(`${ENDPOINT}/account/sessions/email`,{
      method:'POST',
      headers:{...HEADERS,'Content-Type':'application/json'},
      credentials:'include',
      body:JSON.stringify({email,password:pwd})
    });
    if(!s.ok) throw new Error('Account created but login failed. Please log in.');
    setFeedback('success','✓ Account created! Redirecting...');
    setTimeout(()=>location.href='index.html',1200);
  }catch(err){
    btn.disabled=false;
    setFeedback('error', err.message.includes('already')
      ? 'Email already registered. Please log in.'
      : err.message||'Could not create account.');
  }
}
