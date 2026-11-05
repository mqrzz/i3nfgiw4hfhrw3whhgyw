(function(){
const {$,$$,esc,t,api,ic,B}=UZ;
const next=(()=>{const n=new URLSearchParams(location.search).get('next');return n&&/^\/[A-Za-z0-9\/_\-.?=&]*$/.test(n)&&!n.startsWith('//')?n:null})();
document.title=t('login.title')+' · '+t('brand');
document.body.className='auth-body';
document.body.innerHTML='<div class="split">'+UZ.showcase()+'<main class="formside"><div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><a class="lg" href="'+B+'/">'+UZ.LOGO+t('brand')+'</a><div class="seg" id="lg"><button data-l="ru" class="'+(UZ.lang==='ru'?'on':'')+'">RU</button><button data-l="en" class="'+(UZ.lang==='en'?'on':'')+'">EN</button></div></div>'+
'<h1 id="h">'+esc(t('login.h1'))+'</h1><p class="lead2" id="p">'+esc(t('login.p'))+'</p>'+
'<div id="s1"><label class="sr" for="email">Email</label><input class="inp" id="email" type="email" inputmode="email" placeholder="you@mail.com" autocomplete="email" autocapitalize="off" spellcheck="false"><div class="err" id="e1" role="alert"></div><button class="btn" id="send" style="width:100%;margin-top:6px">'+esc(t('login.get'))+'</button><p class="hint" style="text-align:center;margin-top:16px">'+t('login.terms',B)+'</p></div>'+
'<div id="s2" style="display:none"><div class="codes" id="codes"></div><div class="err" id="e2" role="alert"></div><button class="btn" id="verify" style="width:100%;margin-top:6px">'+esc(t('login.enter'))+'</button><button class="btn g" id="back" style="width:100%;margin-top:10px">'+esc(t('login.other'))+'</button><p class="hint" id="rs" style="text-align:center;margin-top:14px"></p></div></div></main></div>';
$('#lg').onclick=e=>{const b=e.target.closest('[data-l]');if(b)UZ.setLang(b.dataset.l)};
const codes=$('#codes');codes.innerHTML=Array.from({length:6},(_,i)=>'<input inputmode="numeric" maxlength="1" aria-label="'+(i+1)+'" autocomplete="'+(i?'off':'one-time-code')+'">').join('');
const ci=$$('input',codes);
ci.forEach((el,i)=>{
 el.addEventListener('input',()=>{el.value=el.value.replace(/\D/g,'');if(el.value&&ci[i+1])ci[i+1].focus();if(ci.every(x=>x.value))$('#verify').click()});
 el.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!el.value&&ci[i-1])ci[i-1].focus()});
 el.addEventListener('paste',e=>{const s=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,6);if(s.length>1){e.preventDefault();s.split('').forEach((c,k)=>ci[k]&&(ci[k].value=c));ci[Math.min(s.length,5)].focus();if(s.length===6)$('#verify').click()}});
});
let tm;
function countdown(sec){clearInterval(tm);const r=$('#rs');let n=sec;const tick=()=>{if(n<=0){clearInterval(tm);r.innerHTML='<button class="btn g sm" id="again">'+esc(t('login.resend'))+'</button>';$('#again').onclick=()=>send(true);return}r.textContent=t('login.wait',n);n--};tick();tm=setInterval(tick,1000)}
async function send(again){
 const email=$('#email').value.trim();$('#e1').textContent='';
 if(!/^\S+@\S+\.\S+$/.test(email)){$('#e1').textContent=t('login.bad');return}
 const b=$('#send');b.disabled=true;
 try{const r=await api('/auth/send-code',{method:'POST',body:{email,lang:UZ.lang}});
  $('#s1').style.display='none';$('#s2').style.display='block';$('#h').textContent=t('login.h2');$('#p').textContent=t('login.sent',email);ci.forEach(x=>x.value='');ci[0].focus();countdown(r.wait||45)
 }catch(e){$('#e1').textContent=e.message}
 b.disabled=false;
}
$('#send').onclick=()=>send();
$('#email').addEventListener('keydown',e=>{if(e.key==='Enter')send()});
$('#back').onclick=()=>{clearInterval(tm);$('#s2').style.display='none';$('#s1').style.display='block';$('#h').textContent=t('login.h1');$('#p').textContent=t('login.p');$('#email').focus()};
$('#verify').onclick=async()=>{
 const code=ci.map(x=>x.value).join('');$('#e2').textContent='';if(code.length<6)return;
 const b=$('#verify');b.disabled=true;
 try{await api('/auth/verify',{method:'POST',body:{email:$('#email').value.trim(),code}});
  let me=null;try{me=await api('/me')}catch(e){}
  location.href=B+(me&&me.page?(next||'/app/'):'/app/start');
 }catch(e){$('#e2').textContent=e.message;ci.forEach(x=>x.value='');ci[0].focus()}
 b.disabled=false;
};
api('/me').then(me=>{location.replace(B+(me.page?(next||'/app/'):'/app/start'))}).catch(()=>{});
const pre=new URLSearchParams(location.search).get('slug');if(pre)try{sessionStorage.setItem('uzel_slug',pre.slice(0,30))}catch(e){}
$('#email').focus();
})();
