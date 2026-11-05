(async function(){
const {$,$$,esc,t,api,ic,B}=UZ;
const me=await UZ.boot('form');if(!me)return;
const p=me.page,pro=me.plan.paid,f0=(p.ext&&p.ext.form)||{};
const S={webhook:f0.webhook||'',enabled:!!f0.enabled,title:f0.title||t('fm.title.def'),button:f0.button||t('fm.btn.def'),notify:f0.notify!==false};
let leads=[];
$('#view').innerHTML=UZ.head(t('nav.form'),t('fm.sub'))+'<div class="stack">'+
'<div class="card"><div class="opt"><div><h3>'+esc(t('fm.on'))+'</h3><p>'+esc(t('fm.on.h'))+'</p></div><button class="sw'+(S.enabled?' on':'')+'" id="en" role="switch" aria-checked="'+S.enabled+'" aria-label="'+esc(t('fm.on'))+'"></button></div>'+
'<div id="cfg" style="margin-top:22px;'+(S.enabled?'':'display:none')+'"><div class="row2"><div class="field"><label class="lbl" for="ft">'+esc(t('fm.title'))+'</label><input class="inp" id="ft" maxlength="60" value="'+esc(S.title)+'"></div><div class="field"><label class="lbl" for="fb">'+esc(t('fm.btn'))+'</label><input class="inp" id="fb" maxlength="30" value="'+esc(S.button)+'"></div></div>'+
'<div class="opt"><div><h3>'+esc(t('fm.notify'))+'</h3><p>'+esc(t('fm.notify.h',me.user.email))+'</p></div><button class="sw'+(S.notify?' on':'')+'" id="nt" role="switch" aria-checked="'+S.notify+'" aria-label="'+esc(t('fm.notify'))+'"></button></div></div></div>'+
'<div class="card"><div class="opt" style="margin-bottom:16px"><div><h3>'+esc(t('fm.hook'))+' '+(pro?'':UZ.proLock('Pro'))+'</h3><p>'+esc(t('fm.hook.h'))+'</p></div></div><div class="field"><input class="inp" id="hk" maxlength="300" placeholder="https://hooks.example.com/..." value="'+esc(S.webhook)+'" aria-label="Webhook" inputmode="url" autocapitalize="off" spellcheck="false"'+(pro?'':' disabled')+'></div><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button class="btn g sm" id="hkt"'+(pro?'':' disabled')+'>'+ic('send')+esc(t('fm.hook.test'))+'</button><button class="btn g sm" id="hks">'+ic('copy')+esc(t('fm.hook.secret'))+'</button></div><p class="hint">'+esc(t('fm.hook.sig'))+'</p></div>'+
'<div class="card"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:18px"><h2>'+esc(t('fm.inbox'))+'</h2><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn g sm" id="ra">'+ic('check')+esc(t('fm.readall'))+'</button>'+(pro?'<a class="btn g sm" href="/api/uzel/me/leads.csv" download>'+ic('download')+'CSV</a>':'<a class="btn g sm" href="'+B+'/app/plan">'+ic('lock')+'CSV · Pro</a>')+'</div></div><div id="ls"><div class="empty"><span class="spin"></span></div></div></div></div>';
const tr=UZ.tracker(()=>S,async()=>{const np=await UZ.savePage({form:{enabled:S.enabled,title:S.title,button:S.button,notify:S.notify,webhook:S.webhook}})});
$('#en').onclick=e=>{S.enabled=!S.enabled;e.currentTarget.classList.toggle('on',S.enabled);e.currentTarget.setAttribute('aria-checked',S.enabled);$('#cfg').style.display=S.enabled?'':'none';tr.check()};
$('#nt').onclick=e=>{S.notify=!S.notify;e.currentTarget.classList.toggle('on',S.notify);e.currentTarget.setAttribute('aria-checked',S.notify);tr.check()};
$('#hk').oninput=e=>{S.webhook=e.target.value.trim();tr.check()};
$('#hks').onclick=()=>UZ.copy(((UZ.me.page.ext||{}).form||{}).secret||'');
$('#hkt').onclick=async e=>{if(tr.dirty()){UZ.toast(t('fm.hook.save'),true);return}const b=e.currentTarget;b.disabled=true;try{const r=await api('/me/webhook/test',{method:'POST'});UZ.toast(r.ok?t('fm.hook.ok'):t('fm.hook.fail',r.status),!r.ok)}catch(er){UZ.toast(er.message,true)}b.disabled=false};
$('#ft').oninput=e=>{S.title=e.target.value;tr.check()};$('#fb').oninput=e=>{S.button=e.target.value;tr.check()};
function draw(){
 $('#ls').innerHTML=leads.length?leads.map(l=>'<div class="inb'+(l.read?'':' new')+'" data-id="'+l.id+'"><div class="l"><b>'+esc(l.name||t('fm.noname'))+'</b> <span class="c">'+esc(l.contact)+'</span>'+(l.message?'<p>'+esc(l.message)+'</p>':'')+'<small>'+esc(UZ.ago(l.created_at))+'</small></div><div style="display:flex;flex-direction:column;gap:4px"><button class="ib" data-a="rd" aria-label="'+esc(l.read?t('fm.unread'):t('fm.read'))+'">'+ic(l.read?'mail':'check')+'</button><button class="ib" data-a="rm" aria-label="'+esc(t('remove'))+'">'+ic('trash-2')+'</button></div></div>').join(''):'<div class="empty">'+esc(t('fm.empty'))+'</div>';
}
async function load(){try{const r=await api('/me/leads');leads=r.leads;draw()}catch(e){$('#ls').innerHTML='<div class="empty">'+esc(e.message)+'</div>'}}
$('#ls').onclick=async e=>{const b=e.target.closest('[data-a]'),row=e.target.closest('.lead');if(!b||!row)return;const id=+row.dataset.id,l=leads.find(x=>x.id===id);
 try{if(b.dataset.a==='rd'){await api('/me/leads/'+id+'/read',{method:'POST',body:{read:!l.read}});l.read=!l.read}
 else if(await UZ.confirm({title:t('fm.del'),text:t('fm.del.s'),ok:t('remove'),danger:true})){await api('/me/leads/'+id,{method:'DELETE'});leads=leads.filter(x=>x.id!==id)}draw()}catch(er){UZ.toast(er.message,true)}};
$('#ra').onclick=async()=>{try{await api('/me/leads/read-all',{method:'POST'});leads.forEach(l=>l.read=true);draw()}catch(e){UZ.toast(e.message,true)}};
load();
})();
