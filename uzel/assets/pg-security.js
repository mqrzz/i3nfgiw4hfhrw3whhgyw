(async function(){
const {$,$$,esc,t,api,ic,B}=UZ;
const me=await UZ.boot('security');if(!me)return;
let sess=me.sessions;
function draw(){
 $('#ss').innerHTML=sess.map(s=>'<div class="sess"><div class="d"><b>'+esc(s.device)+(s.current?' <span class="pill ok" style="padding:3px 10px;font-size:12px">'+esc(t('sc.this'))+'</span>':'')+'</b><small>'+esc(s.ip)+' · '+esc(UZ.ago(s.last_seen_at))+'</small></div>'+(s.current?'':'<button class="btn g sm" data-id="'+s.id+'">'+esc(t('sc.end'))+'</button>')+'</div>').join('');
}
$('#view').innerHTML=UZ.head(t('nav.security'),t('sc.sub'))+'<div class="stack">'+
'<div class="card"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:8px"><h2>'+esc(t('sc.dev'))+'</h2><button class="btn g sm" id="all">'+esc(t('sc.all'))+'</button></div><div id="ss"></div></div>'+
'<div class="card"><div class="opt"><div><h3>'+esc(t('sc.digest'))+'</h3><p>'+esc(t('sc.digest.h',me.user.email))+'</p></div><button class="sw'+(me.digest?' on':'')+'" id="dg" role="switch" aria-checked="'+!!me.digest+'" aria-label="'+esc(t('sc.digest'))+'"></button></div></div>'+
'<div class="card"><h2>'+esc(t('sc.lang'))+'</h2><p class="sub2" style="margin-bottom:16px">'+esc(t('sc.lang.s'))+'</p><div class="seg" id="lg"><button data-l="ru" class="'+(UZ.lang==='ru'?'on':'')+'">Русский</button><button data-l="en" class="'+(UZ.lang==='en'?'on':'')+'">English</button></div></div>'+
'<div class="card"><h2>'+esc(t('sc.data'))+'</h2><p class="sub2" style="margin:6px 0 16px">'+esc(t('sc.data.s'))+'</p><a class="btn g" href="/api/uzel/me/export" download>'+ic('download')+esc(t('sc.export'))+'</a></div>'+
'<div class="card danger"><h2 style="color:var(--bad)">'+esc(t('sc.del'))+'</h2><p class="sub2" style="margin:6px 0 16px">'+esc(t('sc.del.s'))+'</p><button class="btn bad" id="del">'+ic('trash-2')+esc(t('sc.del.b'))+'</button></div></div>';
draw();
$('#ss').onclick=async e=>{const b=e.target.closest('[data-id]');if(!b)return;try{await api('/sessions/'+b.dataset.id,{method:'DELETE'});sess=sess.filter(s=>String(s.id)!==b.dataset.id);draw();UZ.toast(t('sc.ended'))}catch(er){UZ.toast(er.message,true)}};
$('#all').onclick=async()=>{if(await UZ.confirm({title:t('sc.all'),text:t('sc.all.s'),ok:t('sc.all.ok')})){try{await api('/auth/logout-all',{method:'POST'});location.href=B+'/app/login'}catch(e){UZ.toast(e.message,true)}}};
$('#dg').onclick=async e=>{const b=e.currentTarget,v=!b.classList.contains('on');try{await api('/me/settings',{method:'PUT',body:{digest:v}});b.classList.toggle('on',v);b.setAttribute('aria-checked',v);UZ.toast(t('saved'))}catch(er){UZ.toast(er.message,true)}};
$('#lg').onclick=e=>{const b=e.target.closest('[data-l]');if(b)UZ.setLang(b.dataset.l)};
$('#del').onclick=async()=>{if(await UZ.confirm({title:t('sc.del'),text:t('sc.del.c'),ok:t('sc.del.ok'),danger:true})){try{await api('/me',{method:'DELETE'});location.href=B+'/'}catch(e){UZ.toast(e.message,true)}}};
})();
