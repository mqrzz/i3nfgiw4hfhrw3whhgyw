(async function(){
const {$,$$,esc,t,api,ic,B}=UZ;
const me=await UZ.boot('profile');if(!me)return;
const p=me.page,host=me.pageBase.replace(/^https?:\/\//,'');
const SOC=[['telegram','@username'],['instagram','username'],['tiktok','username'],['youtube','@channel'],['vk','id / name'],['github','username'],['x','username'],['whatsapp','+7…'],['discord','invite'],['spotify','user id'],['twitch','username'],['soundcloud','username'],['steam','id'],['pinterest','username']];
const ext=p.ext||{},info=ext.info||{};
const S={name:p.name,subtitle:p.subtitle||'',bio:p.bio||'',slug:p.slug,lang:ext.lang||'ru',published:!!p.published,phone:info.phone||'',email:info.email||'',address:info.address||'',soc:{}};
(p.socials||[]).forEach(s=>{S.soc[s.type]=s.url});
const mu0=p.music||{};S.music={title:mu0.title||'',artist:mu0.artist||'',url:mu0.url||'',cover:mu0.cover||'',audio:mu0.audio||''};S.interests=(ext.interests||[]).join(', ');S.thanks=ext.thanks||'';S.hello=ext.hello||'';S.location=ext.location||'';S.status=ext.status||'';
let avatar=p.avatar;
function avHTML(){return avatar?'<img src="/api/uzel/media/'+esc(avatar)+'?v='+Date.now()+'" alt="">':esc(UZ.initials(S.name))}
$('#view').innerHTML=UZ.head(t('nav.profile'),t('pf.sub'))+'<div class="stack">'+
'<div class="card"><div class="avrow"><div class="avbig" id="av" style="background:'+UZ.gradient(S.name)+'">'+avHTML()+'</div><div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn sm" id="up">'+ic('image')+esc(t('pf.photo'))+'</button><button class="btn g sm" id="rm" '+(avatar?'':'style="display:none"')+'>'+esc(t('remove'))+'</button></div><p class="hint">'+esc(t('pf.photo.h'))+'</p></div><input type="file" id="file" accept="image/png,image/jpeg,image/webp" hidden></div></div>'+
'<div class="card"><div class="field"><label class="lbl" for="nm">'+esc(t('pf.name'))+'</label><input class="inp" id="nm" maxlength="60" value="'+esc(S.name)+'"></div>'+
'<div class="field"><label class="lbl" for="sb">'+esc(t('pf.subtitle'))+'</label><input class="inp" id="sb" maxlength="80" placeholder="'+esc(t('pf.subtitle.ph'))+'" value="'+esc(S.subtitle)+'"></div>'+
'<div class="field"><label class="lbl" for="bio">'+esc(t('pf.bio'))+'<span class="counter" id="bc"></span></label><textarea class="ta" id="bio" maxlength="300" placeholder="'+esc(t('pf.bio.ph'))+'">'+esc(S.bio)+'</textarea></div></div>'+
'<div class="card"><h2>'+esc(t('pf.soc'))+'</h2><p class="sub2" style="margin-bottom:18px">'+esc(t('pf.soc.s'))+'</p><div class="socs">'+SOC.map(x=>'<label class="soc-i">'+(IC_B(x[0]))+'<input data-s="'+x[0]+'" placeholder="'+esc(x[1])+'" value="'+esc(shortSoc(x[0],S.soc[x[0]]))+'" aria-label="'+x[0]+'" autocapitalize="off" spellcheck="false"></label>').join('')+'</div></div>'+
MU()+'<div class="card"><h2>'+esc(t('pf.ct'))+'</h2><p class="sub2" style="margin-bottom:18px">'+esc(t('pf.ct.s'))+'</p><div class="stack" style="gap:12px"><label class="soc-i">'+ic('phone')+'<input data-i="phone" maxlength="20" placeholder="+7 900 000-00-00" value="'+esc(S.phone)+'" aria-label="'+esc(t('pf.phone'))+'"></label><label class="soc-i">'+ic('mail')+'<input data-i="email" maxlength="254" placeholder="'+esc(t('pf.email'))+'" value="'+esc(S.email)+'" aria-label="Email"></label><label class="soc-i">'+ic('map-pin')+'<input data-i="address" maxlength="120" placeholder="'+esc(t('pf.addr'))+'" value="'+esc(S.address)+'" aria-label="'+esc(t('pf.addr'))+'"></label></div></div>'+
'<div class="card"><div class="field"><label class="lbl" for="sl">'+esc(t('pf.slug'))+'</label><div class="adr"><span>'+esc(host)+'</span><input id="sl" maxlength="30" value="'+esc(S.slug)+'" autocapitalize="off" spellcheck="false"></div><div class="hint" id="sh"></div></div>'+
'<div class="field"><span class="lbl">'+esc(t('pf.lang'))+'</span><div class="seg" id="lg"><button data-l="ru" class="'+(S.lang==='ru'?'on':'')+'">Русский</button><button data-l="en" class="'+(S.lang==='en'?'on':'')+'">English</button></div><p class="hint">'+esc(t('pf.lang.h'))+'</p></div>'+
'<div class="opt field"><div><h3>'+esc(t('pf.pub'))+'</h3><p>'+esc(t('pf.pub.h'))+'</p></div><button class="sw'+(S.published?' on':'')+'" id="pub" role="switch" aria-checked="'+S.published+'" aria-label="'+esc(t('pf.pub'))+'"></button></div></div></div>';
function MU(){const m=S.music,inp=(ico,id,ml,ph,v)=>'<label class="soc-i">'+ic(ico)+'<input id="'+id+'" maxlength="'+ml+'" placeholder="'+esc(ph)+'" value="'+esc(v)+'" autocomplete="off"></label>';
return '<div class="card"><h2>'+esc(t('pf.mu'))+'</h2><p class="sub2" style="margin-bottom:18px">'+esc(t('pf.mu.s'))+'</p><div class="stack" style="gap:12px">'+inp('music','mt',60,t('pf.mu.t'),m.title)+inp('user','ma',60,t('pf.mu.a'),m.artist)+inp('link','mu',300,t('pf.mu.u'),m.url)+'<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button class="btn g sm" id="mc">'+ic('image')+esc(t('pf.mu.c'))+'</button><button class="btn g sm" id="mf">'+ic('music')+esc(t('pf.mu.f'))+'</button><span class="hint" id="mi">'+mInfo()+'</span></div><input type="file" id="mcf" accept="image/png,image/jpeg,image/webp" hidden><input type="file" id="mff" accept="audio/mpeg,.mp3" hidden></div><p class="hint" style="margin-top:12px">'+esc(t('pf.mu.r'))+'</p></div>'+
'<div class="card"><h2>'+esc(t('pf.it'))+'</h2><p class="sub2" style="margin-bottom:18px">'+esc(t('pf.it.s'))+'</p><div class="field"><label class="lbl" for="hl">'+esc(t('pf.hl'))+'</label><input class="inp" id="hl" maxlength="40" placeholder="'+esc(t('pf.hl.ph'))+'" value="'+esc(S.hello)+'"></div><div class="field"><label class="lbl" for="lc">'+esc(t('pf.loc'))+'</label><input class="inp" id="lc" maxlength="40" placeholder="'+esc(t('pf.loc.ph'))+'" value="'+esc(S.location)+'"></div><div class="field"><label class="lbl" for="stt">'+esc(t('pf.stt'))+'</label><input class="inp" id="stt" maxlength="24" placeholder="'+esc(t('pf.stt.ph'))+'" value="'+esc(S.status)+'"></div><div class="field"><label class="lbl" for="it">'+esc(t('pf.it.l'))+'</label><input class="inp" id="it" maxlength="220" placeholder="'+esc(t('pf.it.ph'))+'" value="'+esc(S.interests)+'"></div><div class="field"><label class="lbl" for="th">'+esc(t('pf.th.l'))+'</label><input class="inp" id="th" maxlength="60" placeholder="'+esc(t('pf.th.ph'))+'" value="'+esc(S.thanks)+'"></div></div>'}
function mInfo(){const m=S.music;return [m.cover?t('pf.mu.c')+': '+t('pf.mu.ok'):'',m.audio?'MP3: '+t('pf.mu.ok'):''].filter(Boolean).join(' · ')}
function IC_B(n){return (window.IC['b-'+n]||'')}
function shortSoc(type,u){if(!u)return '';const m={telegram:/^https:\/\/t\.me\//,instagram:/^https:\/\/instagram\.com\//,tiktok:/^https:\/\/tiktok\.com\/@/,youtube:/^https:\/\/youtube\.com\/@/,vk:/^https:\/\/vk\.com\//,github:/^https:\/\/github\.com\//,x:/^https:\/\/x\.com\//,whatsapp:/^https:\/\/wa\.me\//}[type];return m?u.replace(m,''):u}
const tr=UZ.tracker(()=>S,async()=>{
 const socials=SOC.map(x=>({type:x[0],value:S.soc[x[0]]||''})).filter(x=>x.value.trim());
 const mm=S.music,body={hello:S.hello.trim(),location:S.location.trim(),status:S.status.trim(),interests:S.interests.split(',').map(x=>x.trim()).filter(Boolean),thanks:S.thanks.trim(),music:(mm.title.trim()||mm.url.trim()||mm.audio)?{title:mm.title.trim(),artist:mm.artist.trim(),url:mm.url.trim(),cover:mm.cover,audio:mm.audio}:null,name:S.name,subtitle:S.subtitle,bio:S.bio,socials,info:{phone:S.phone,email:S.email,address:S.address},lang:S.lang,published:S.published};
 if(S.slug!==UZ.me.page.slug)body.slug=S.slug;
 const np=await UZ.savePage(body);S.slug=np.slug;$('#sl').value=np.slug;
});
const bc=()=>{$('#bc').textContent=S.bio.length+' / 300'};bc();
$('#nm').oninput=e=>{S.name=e.target.value;if(!avatar)$('#av').innerHTML=avHTML();$('#av').style.background=UZ.gradient(S.name);tr.check()};
$('#sb').oninput=e=>{S.subtitle=e.target.value;tr.check()};
$('#bio').oninput=e=>{S.bio=e.target.value;bc();tr.check()};
$$('[data-s]').forEach(i=>i.oninput=()=>{S.soc[i.dataset.s]=i.value;tr.check()});
$$('[data-i]').forEach(i=>i.oninput=()=>{S[i.dataset.i]=i.value;tr.check()});
$('#lg').onclick=e=>{const b=e.target.closest('[data-l]');if(!b)return;S.lang=b.dataset.l;$$('#lg button').forEach(x=>x.classList.toggle('on',x===b));tr.check()};
$('#pub').onclick=e=>{S.published=!S.published;e.currentTarget.classList.toggle('on',S.published);e.currentTarget.setAttribute('aria-checked',S.published);tr.check()};
const chk=UZ.debounce(async()=>{const h=$('#sh'),i=$('#sl').parentNode;
 if(S.slug===p.slug){h.className='hint';h.textContent='';return}
 try{const r=await api('/slug/check?slug='+encodeURIComponent(S.slug));h.className='hint '+(r.available?'ok':'bad');h.textContent=r.available?t('start.free'):(r.reason||t('start.busy'))}catch(e){h.className='hint bad';h.textContent=e.message}},300);
$('#sl').oninput=e=>{e.target.value=e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'');S.slug=e.target.value;chk();tr.check()};
const mset=(id,k)=>{$(id).oninput=e=>{S.music[k]=e.target.value;tr.check()}};mset('#mt','title');mset('#ma','artist');mset('#mu','url');
$('#hl').oninput=e=>{S.hello=e.target.value;tr.check()};$('#lc').oninput=e=>{S.location=e.target.value;tr.check()};$('#stt').oninput=e=>{S.status=e.target.value;tr.check()};
$('#it').oninput=e=>{S.interests=e.target.value;tr.check()};$('#th').oninput=e=>{S.thanks=e.target.value;tr.check()};
$('#mc').onclick=()=>$('#mcf').click();$('#mf').onclick=()=>$('#mff').click();
$('#mcf').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{
  const data=await new Promise((res,rej)=>{const im=new Image,u=URL.createObjectURL(f);im.onload=()=>{const m=768,k=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.9))};im.onerror=()=>rej(new Error(t('pf.photo.bad')));im.src=u});
  const r=await api('/me/music-file',{method:'POST',body:{kind:'cover',data}});S.music.cover=r.file;$('#mi').textContent=mInfo();tr.check()}catch(er){UZ.toast(er.message,true)}e.target.value=''};
$('#mff').onchange=async e=>{const f=e.target.files[0];if(!f)return;if(f.size>10*1024*1024){UZ.toast(t('pf.mu.big'),true);e.target.value='';return}try{
  const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).replace(/^data:[^;]*;/,'data:audio/mpeg;'));r.onerror=()=>rej(new Error('read'));r.readAsDataURL(f)});
  const r=await api('/me/music-file',{method:'POST',body:{kind:'audio',data}});S.music.audio=r.file;$('#mi').textContent=mInfo();tr.check()}catch(er){UZ.toast(er.message,true)}e.target.value=''};
$('#up').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
  const data=await new Promise((res,rej)=>{const im=new Image,u=URL.createObjectURL(f);im.onload=()=>{const m=1024,k=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.9))};im.onerror=()=>rej(new Error(t('pf.photo.bad')));im.src=u});
  const r=await api('/me/avatar',{method:'POST',body:{data}});avatar=r.avatar;$('#av').innerHTML=avHTML();$('#rm').style.display='';UZ.toast(t('pf.photo.ok'));
 }catch(er){UZ.toast(er.message,true)}
 e.target.value='';
};
$('#rm').onclick=async()=>{try{await api('/me/avatar',{method:'DELETE'});avatar=null;$('#av').innerHTML=avHTML();$('#rm').style.display='none'}catch(e){UZ.toast(e.message,true)}};
})();
