(async function(){
const {$,$$,esc,t,api,ic,B}=UZ;
const me=await UZ.boot('links');if(!me)return;
const p=me.page,pro=me.plan.paid,LIM=me.plan.limits.links;
const loc=v=>{if(!v)return '';const d=new Date(v),z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())+'T'+z(d.getHours())+':'+z(d.getMinutes())};
const mk=l=>({id:l.id,kind:l.kind||'link',title:l.title||'',url:l.url||'',desc:l.desc||'',text:l.text||'',price:l.price||'',pin:!!l.pin,enabled:l.enabled!==false,from:loc(l.from),to:loc(l.to),sch:!!(l.from||l.to)});
const blank=k=>({id:'',kind:k,title:'',url:'',desc:'',text:'',price:'',pin:false,enabled:true,from:'',to:'',sch:false});
const KI={text:'type',faq:'circle-help',price:'receipt',video:'play',map:'map-pin'};
let rows=(p.links||[]).map(mk);
let music={title:(p.music&&p.music.title)||'',url:(p.music&&p.music.url)||''};
let welcome=false;
try{const s=sessionStorage.getItem('uzel_starter');if(s&&!rows.some(r=>r.kind!=='header'&&r.url)){JSON.parse(s).forEach(x=>{const b=blank('link');b.title=x;rows.push(b)});welcome=true}sessionStorage.removeItem('uzel_starter')}catch(e){}
const snap=()=>({rows:rows.map(r=>({k:r.kind,t:r.title,u:r.url,d:r.desc,x:r.text,p:r.price,n:r.pin,e:r.enabled,f:r.from,o:r.to})),music});
let tr;
function blkHTML(r,i){
 const k=r.kind,ph=n=>esc(t(n));
 const inp=(f,n,v,extra)=>'<input class="inp '+f+'" data-f="'+f+'" maxlength="'+(extra||120)+'" placeholder="'+ph(n)+'" value="'+esc(v)+'" aria-label="'+ph(n)+'">';
 const ta=(n,v)=>'<textarea class="inp tx" data-f="text" maxlength="'+(k==='faq'?600:800)+'" placeholder="'+ph(n)+'" aria-label="'+ph(n)+'" rows="3">'+esc(v)+'</textarea>';
 let body='';
 if(k==='text')body=inp('title','lk.title',r.title,60).replace(ph('lk.title'),ph('lk.hd.ph'))+ta('lk.ph.text',r.text);
 else if(k==='faq')body=inp('title','lk.ph.q',r.title,120)+ta('lk.ph.a',r.text);
 else if(k==='price')body=inp('title','lk.ph.service',r.title,60)+inp('price','lk.ph.price',r.price,24)+inp('desc','lk.desc',r.desc,80);
 else if(k==='video')body=inp('title','lk.title',r.title,60)+'<input class="inp url" data-f="url" maxlength="300" placeholder="'+ph('lk.ph.video')+'" value="'+esc(r.url)+'" aria-label="URL" inputmode="url" autocapitalize="off" spellcheck="false"><p class="hint" style="margin:0">'+ph('lk.hint.video')+'</p>';
 else if(k==='map')body=inp('title','lk.ph.map',r.title,60)+'<input class="inp url" data-f="url" maxlength="500" placeholder="https://maps..." value="'+esc(r.url)+'" aria-label="URL" inputmode="url" autocapitalize="off" spellcheck="false">'+inp('desc','lk.ph.addr',r.desc,80);
 return '<div class="lrow blk" data-i="'+i+'"><div class="kd">'+ic(KI[k])+'<span>'+ph('lk.k.'+k)+'</span></div><div class="bf">'+body+'</div><div class="mv"><button data-a="up" aria-label="'+esc(t('lk.up'))+'">'+ic('chevron-up')+'</button><button data-a="dn" aria-label="'+esc(t('lk.dn'))+'">'+ic('chevron-down')+'</button></div><div class="lacts"><button class="sw'+(r.enabled?' on':'')+'" data-a="tg" role="switch" aria-checked="'+r.enabled+'" aria-label="'+esc(t('lk.show'))+'"></button><button class="ib" data-a="rm" aria-label="'+esc(t('remove'))+'">'+ic('trash-2')+'</button></div></div>';
}
function rowHTML(r,i){
 if(KI[r.kind]&&r.kind!=='map'||r.kind==='map')return blkHTML(r,i);
 const hd=r.kind==='header';
 return '<div class="lrow'+(hd?' hd':'')+'" data-i="'+i+'"><div class="mv"><button data-a="up" aria-label="'+esc(t('lk.up'))+'">'+ic('chevron-up')+'</button><button data-a="dn" aria-label="'+esc(t('lk.dn'))+'">'+ic('chevron-down')+'</button></div>'+
 '<input class="inp ti" data-f="title" maxlength="60" placeholder="'+esc(hd?t('lk.hd.ph'):t('lk.title'))+'" value="'+esc(r.title)+'" aria-label="'+esc(t('lk.title'))+'">'+
 (hd?'<div class="hint hn" style="margin:0">'+esc(t('lk.hd'))+'</div>':'<input class="inp url" data-f="url" maxlength="500" placeholder="https://..." value="'+esc(r.url)+'" aria-label="URL" inputmode="url" autocapitalize="off" spellcheck="false">')+
 '<div class="lacts">'+(hd?'':'<button class="ib" data-a="pin" aria-label="'+esc(t('lk.pin'))+'" title="'+esc(t('lk.pin'))+'" style="'+(r.pin?'color:var(--blue)':'')+'">'+ic('pin')+'</button><button class="ib" data-a="sch" aria-label="'+esc(t('lk.sch'))+'" title="'+esc(t('lk.sch'))+'" style="'+(r.sch||r.from||r.to?'color:var(--blue)':'')+'">'+ic('calendar-clock')+'</button>')+'<button class="sw'+(r.enabled?' on':'')+'" data-a="tg" role="switch" aria-checked="'+r.enabled+'" aria-label="'+esc(t('lk.show'))+'"></button><button class="ib" data-a="rm" aria-label="'+esc(t('remove'))+'">'+ic('trash-2')+'</button></div>'+
 (hd?'':'<input class="inp ld" data-f="desc" maxlength="80" placeholder="'+esc(t('lk.desc'))+'" value="'+esc(r.desc)+'" aria-label="'+esc(t('lk.desc'))+'">')+
 (!hd&&r.sch?'<div class="sch"><span>'+esc(t('lk.from'))+'</span><input type="datetime-local" data-f="from" value="'+esc(r.from)+'"><span>'+esc(t('lk.to'))+'</span><input type="datetime-local" data-f="to" value="'+esc(r.to)+'"></div>':'')+'</div>';
}
function draw(){
 const full=rows.length>=LIM;
 $('#list').innerHTML=rows.length?rows.map(rowHTML).join(''):'<div class="empty">'+esc(t('lk.empty'))+'</div>';
 $('#cnt').textContent=rows.length+' / '+LIM;
 $('#add').disabled=full;$('#addh').disabled=full;$('#addm').disabled=full;
 $('#lim').innerHTML=full&&!pro?'<p class="hint">'+esc(t('lk.limit',LIM,me.plan.pro.links))+' '+UZ.proLock('Pro')+'</p>':'';
 tr&&tr.check();
}
$('#view').innerHTML=UZ.head(t('nav.links'),t('lk.sub'))+'<div class="stack">'+
(welcome?'<div class="card" style="background:var(--b1);box-shadow:none"><h2>'+ic('party-popper','hic')+esc(t('lk.welcome'))+'</h2><p class="sub2">'+esc(t('lk.welcome.s'))+'</p></div>':'')+
'<div class="card"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px"><h2>'+ic('link','hic')+esc(t('lk.h'))+' <span class="counter" id="cnt" style="margin-left:8px"></span></h2></div><div id="list"></div><div id="lim"></div><div class="addrow"><button class="btn" id="add">'+ic('plus')+esc(t('lk.add'))+'</button><button class="btn g" id="addh">'+ic('heading')+esc(t('lk.addh'))+'</button><button class="btn g" id="addm" aria-expanded="false">'+ic('plus')+esc(t('lk.more'))+'</button></div><div class="kmenu" id="km" hidden>'+['text','faq','price','video','map'].map(k=>'<button class="kbtn" data-k="'+k+'">'+ic(KI[k])+'<span>'+esc(t('lk.k.'+k))+'</span></button>').join('')+'</div></div>'+
'<div class="card"><h2>'+ic('music','hic')+esc(t('lk.music'))+'</h2><p class="sub2" style="margin-bottom:16px">'+esc(t('lk.music.s'))+'</p><div class="row2"><input class="inp" id="mt" maxlength="60" placeholder="'+esc(t('lk.music.t'))+'" value="'+esc(music.title)+'" aria-label="'+esc(t('lk.music.t'))+'"><input class="inp" id="mu" maxlength="500" placeholder="Ссылка на трек или плейлист: Spotify, Apple Music, YouTube, VK" value="'+esc(music.url)+'" aria-label="URL" inputmode="url"></div></div></div>';
tr=UZ.tracker(snap,async()=>{
 const toISO=v=>v?new Date(v).toISOString():'';
 const links=rows.filter(r=>r.title.trim()||r.url.trim()||r.text.trim()||r.price.trim()).map(r=>Object.assign({id:r.id,kind:r.kind,title:r.title,url:r.url,desc:r.desc,text:r.text,price:r.price,pin:r.pin,enabled:r.enabled},(r.kind==='link')?{from:toISO(r.from),to:toISO(r.to)}:{}));
 const np=await UZ.savePage({links,music:(music.title||music.url)?music:null});
 rows=(np.links||[]).map(mk);draw();
});
draw();if(welcome)tr.touch();
const L=$('#list');
L.addEventListener('input',e=>{if(e.target.matches('textarea'))e.target.style.height='auto';const row=e.target.closest('.lrow'),f=e.target.dataset.f;if(!row||!f)return;rows[+row.dataset.i][f]=e.target.value;tr.check()});
L.addEventListener('click',async e=>{
 const b=e.target.closest('[data-a]'),row=e.target.closest('.lrow');if(!b||!row)return;const i=+row.dataset.i,a=b.dataset.a;
 if(a==='up'&&i>0){[rows[i-1],rows[i]]=[rows[i],rows[i-1]];draw()}
 else if(a==='dn'&&i<rows.length-1){[rows[i+1],rows[i]]=[rows[i],rows[i+1]];draw()}
 else if(a==='pin'){const was=rows[i].pin;rows.forEach(x=>x.pin=false);rows[i].pin=!was;draw()}
 else if(a==='tg'){rows[i].enabled=!rows[i].enabled;draw()}
 else if(a==='rm'){rows.splice(i,1);draw()}
 else if(a==='sch'){if(!pro){if(await UZ.confirm({title:t('lk.sch.pro'),text:t('lk.sch.pro.s'),ok:t('plans.see')}))location.href=B+'/app/plan';return}rows[i].sch=!rows[i].sch;if(!rows[i].sch){rows[i].from='';rows[i].to=''}draw()}
});
$('#add').onclick=()=>{rows.push(blank('link'));draw();const x=$$('.lrow')[rows.length-1];x&&$('input',x).focus()};
$('#addh').onclick=()=>{rows.push(blank('header'));draw();const x=$$('.lrow')[rows.length-1];x&&$('input',x).focus()};
$('#addm').onclick=()=>{const m=$('#km');m.hidden=!m.hidden;$('#addm').setAttribute('aria-expanded',String(!m.hidden))};
$('#km').onclick=e=>{const b=e.target.closest('[data-k]');if(!b||rows.length>=LIM)return;rows.push(blank(b.dataset.k));$('#km').hidden=true;$('#addm').setAttribute('aria-expanded','false');draw();const x=$$('.lrow')[rows.length-1];x&&($('input,textarea',x)||{focus(){}}).focus();x&&x.scrollIntoView({block:'center',behavior:'smooth'})};
$('#mt').oninput=e=>{music.title=e.target.value;tr.check()};$('#mu').oninput=e=>{music.url=e.target.value;tr.check()};
})();
