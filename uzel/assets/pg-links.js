(async function(){
const {$,$$,esc,t,api,ic,B}=UZ;
const me=await UZ.boot('links');if(!me)return;
const p=me.page,pro=me.plan.paid,LIM=me.plan.limits.links;
const loc=v=>{if(!v)return '';const d=new Date(v),z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())+'T'+z(d.getHours())+':'+z(d.getMinutes())};
let rows=(p.links||[]).map(l=>({id:l.id,kind:l.kind||'link',title:l.title,url:l.url||'',desc:l.desc||'',enabled:l.enabled!==false,from:loc(l.from),to:loc(l.to),sch:!!(l.from||l.to)}));
let music={title:(p.music&&p.music.title)||'',url:(p.music&&p.music.url)||''};
let welcome=false;
try{const s=sessionStorage.getItem('uzel_starter');if(s&&!rows.some(r=>r.kind!=='header'&&r.url)){JSON.parse(s).forEach(x=>rows.push({id:'',kind:'link',title:x,url:'',desc:'',enabled:true,from:'',to:'',sch:false}));welcome=true}sessionStorage.removeItem('uzel_starter')}catch(e){}
const snap=()=>({rows:rows.map(r=>({k:r.kind,t:r.title,u:r.url,d:r.desc,e:r.enabled,f:r.from,o:r.to})),music});
let tr;
function rowHTML(r,i){
 const hd=r.kind==='header';
 return '<div class="lrow'+(hd?' hd':'')+'" data-i="'+i+'"><div class="mv"><button data-a="up" aria-label="'+esc(t('lk.up'))+'">'+ic('chevron-up')+'</button><button data-a="dn" aria-label="'+esc(t('lk.dn'))+'">'+ic('chevron-down')+'</button></div>'+
 '<input class="inp ti" data-f="title" maxlength="60" placeholder="'+esc(hd?t('lk.hd.ph'):t('lk.title'))+'" value="'+esc(r.title)+'" aria-label="'+esc(t('lk.title'))+'">'+
 (hd?'<div class="hint hn" style="margin:0">'+esc(t('lk.hd'))+'</div>':'<input class="inp url" data-f="url" maxlength="500" placeholder="https://..." value="'+esc(r.url)+'" aria-label="URL" inputmode="url" autocapitalize="off" spellcheck="false">')+
 '<div class="lacts">'+(hd?'':'<button class="ib" data-a="sch" aria-label="'+esc(t('lk.sch'))+'" title="'+esc(t('lk.sch'))+'" style="'+(r.sch||r.from||r.to?'color:var(--blue)':'')+'">'+ic('calendar-clock')+'</button>')+'<button class="sw'+(r.enabled?' on':'')+'" data-a="tg" role="switch" aria-checked="'+r.enabled+'" aria-label="'+esc(t('lk.show'))+'"></button><button class="ib" data-a="rm" aria-label="'+esc(t('remove'))+'">'+ic('trash-2')+'</button></div>'+
 (hd?'':'<input class="inp ld" data-f="desc" maxlength="80" placeholder="'+esc(t('lk.desc'))+'" value="'+esc(r.desc)+'" aria-label="'+esc(t('lk.desc'))+'">')+
 (!hd&&r.sch?'<div class="sch"><span>'+esc(t('lk.from'))+'</span><input type="datetime-local" data-f="from" value="'+esc(r.from)+'"><span>'+esc(t('lk.to'))+'</span><input type="datetime-local" data-f="to" value="'+esc(r.to)+'"></div>':'')+'</div>';
}
function draw(){
 const full=rows.length>=LIM;
 $('#list').innerHTML=rows.length?rows.map(rowHTML).join(''):'<div class="empty">'+esc(t('lk.empty'))+'</div>';
 $('#cnt').textContent=rows.length+' / '+LIM;
 $('#add').disabled=full;$('#addh').disabled=full;
 $('#lim').innerHTML=full&&!pro?'<p class="hint">'+esc(t('lk.limit',LIM,me.plan.pro.links))+' '+UZ.proLock('Pro')+'</p>':'';
 tr&&tr.check();
}
$('#view').innerHTML=UZ.head(t('nav.links'),t('lk.sub'))+'<div class="stack">'+
(welcome?'<div class="card" style="background:var(--b1);box-shadow:none"><h2>'+ic('party-popper','hic')+esc(t('lk.welcome'))+'</h2><p class="sub2">'+esc(t('lk.welcome.s'))+'</p></div>':'')+
'<div class="card"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px"><h2>'+ic('link','hic')+esc(t('lk.h'))+' <span class="counter" id="cnt" style="margin-left:8px"></span></h2></div><div id="list"></div><div id="lim"></div><div class="addrow"><button class="btn" id="add">'+ic('plus')+esc(t('lk.add'))+'</button><button class="btn g" id="addh">'+ic('heading')+esc(t('lk.addh'))+'</button></div></div>'+
'<div class="card"><h2>'+ic('music','hic')+esc(t('lk.music'))+'</h2><p class="sub2" style="margin-bottom:16px">'+esc(t('lk.music.s'))+'</p><div class="row2"><input class="inp" id="mt" maxlength="60" placeholder="'+esc(t('lk.music.t'))+'" value="'+esc(music.title)+'" aria-label="'+esc(t('lk.music.t'))+'"><input class="inp" id="mu" maxlength="500" placeholder="Ссылка на трек или плейлист: Spotify, Apple Music, YouTube, VK" value="'+esc(music.url)+'" aria-label="URL" inputmode="url"></div></div></div>';
tr=UZ.tracker(snap,async()=>{
 const toISO=v=>v?new Date(v).toISOString():'';
 const links=rows.filter(r=>r.title.trim()||r.url.trim()).map(r=>Object.assign({id:r.id,kind:r.kind,title:r.title,url:r.url,desc:r.desc,enabled:r.enabled},r.kind==='header'?{}:{from:toISO(r.from),to:toISO(r.to)}));
 const np=await UZ.savePage({links,music:(music.title||music.url)?music:null});
 rows=(np.links||[]).map(l=>({id:l.id,kind:l.kind||'link',title:l.title,url:l.url||'',desc:l.desc||'',enabled:l.enabled!==false,from:loc(l.from),to:loc(l.to),sch:!!(l.from||l.to)}));draw();
});
draw();if(welcome)tr.touch();
const L=$('#list');
L.addEventListener('input',e=>{const row=e.target.closest('.lrow'),f=e.target.dataset.f;if(!row||!f)return;rows[+row.dataset.i][f]=e.target.value;tr.check()});
L.addEventListener('click',async e=>{
 const b=e.target.closest('[data-a]'),row=e.target.closest('.lrow');if(!b||!row)return;const i=+row.dataset.i,a=b.dataset.a;
 if(a==='up'&&i>0){[rows[i-1],rows[i]]=[rows[i],rows[i-1]];draw()}
 else if(a==='dn'&&i<rows.length-1){[rows[i+1],rows[i]]=[rows[i],rows[i+1]];draw()}
 else if(a==='tg'){rows[i].enabled=!rows[i].enabled;draw()}
 else if(a==='rm'){rows.splice(i,1);draw()}
 else if(a==='sch'){if(!pro){if(await UZ.confirm({title:t('lk.sch.pro'),text:t('lk.sch.pro.s'),ok:t('plans.see')}))location.href=B+'/app/plan';return}rows[i].sch=!rows[i].sch;if(!rows[i].sch){rows[i].from='';rows[i].to=''}draw()}
});
$('#add').onclick=()=>{rows.push({id:'',kind:'link',title:'',url:'',desc:'',enabled:true,from:'',to:'',sch:false});draw();const x=$$('.lrow')[rows.length-1];x&&$('input',x).focus()};
$('#addh').onclick=()=>{rows.push({id:'',kind:'header',title:'',url:'',desc:'',enabled:true,from:'',to:'',sch:false});draw();const x=$$('.lrow')[rows.length-1];x&&$('input',x).focus()};
$('#mt').oninput=e=>{music.title=e.target.value;tr.check()};$('#mu').oninput=e=>{music.url=e.target.value;tr.check()};
})();
