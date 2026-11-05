(async function(){
const {$,esc,t,api,ic,B,nf}=UZ;
const me=await UZ.boot('home');if(!me)return;
const p=me.page,pro=me.plan.paid;
const url=p.url||me.pageBase+p.slug;
let st=null;try{st=await api('/me/stats?days=7')}catch(e){}
const real=(p.links||[]).filter(l=>l.kind!=='header'&&l.url);
const todo=[
 [!!p.avatar,'home.t.photo','/app/profile'],[!!(p.bio||'').trim(),'home.t.bio','/app/profile'],[real.length>=3,'home.t.links','/app/links'],
 [(p.socials||[]).length>0,'home.t.soc','/app/profile'],[!!p.published,'home.t.pub','/app/profile'],
];
const done=todo.filter(x=>x[0]).length,pct=Math.round(done/todo.length*100),C=2*Math.PI*34;
const ring='<div class="ring"><svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="34" fill="none" stroke="#dce9ff" stroke-width="9"/><circle cx="42" cy="42" r="34" fill="none" stroke="#06f" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-pct/100))+'"/></svg><b>'+pct+'%</b></div>';
const tot=st?st.totals:{views:0,clicks:0};const ctr=tot.views?Math.round(tot.clicks/tot.views*100):0;
const q=[['/app/profile','user','nav.profile'],['/app/links','link','nav.links'],['/app/design','palette','nav.design'],['/app/form','inbox','nav.form'],['/app/stats','chart-no-axes-column','nav.stats'],['/app/preview','eye','preview']];
$('#view').innerHTML=UZ.head(t('home.hi',(me.user.name||'').split(' ')[0]||''),t('home.sub'))+
'<div class="stack"><div class="card"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><h2>'+esc(t('home.page'))+'</h2><span class="pill '+(p.published&&!p.hidden?'ok':'gray')+'">'+esc(p.hidden?t('home.hidden'):p.published?t('home.live'):t('home.draft'))+'</span></div>'+
'<div class="link-card"><b>'+esc(url.replace(/^https?:\/\//,''))+'</b><button class="btn g sm" id="cp">'+ic('copy')+esc(t('copy'))+'</button><a class="btn sm" href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(t('open'))+ic('arrow-up-right')+'</a></div>'+
'<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><a class="btn g sm" href="/api/uzel/qr/'+esc(p.slug)+'?dl=1" download>'+ic('qr-code')+'QR</a><a class="btn g sm" href="'+B+'/app/preview">'+ic('eye')+esc(t('preview'))+'</a></div></div>'+
'<div class="kpis"><div class="card kpi"><small>'+esc(t('st.views'))+'</small><b>'+nf(tot.views)+'</b></div><div class="card kpi"><small>'+esc(t('st.clicks'))+'</small><b>'+nf(tot.clicks)+'</b></div><div class="card kpi"><small>'+esc(t('st.leads'))+'</small><b>'+nf(st?st.leads:0)+'</b></div></div>'+
(done<todo.length?'<div class="card"><div class="prog">'+ring+'<div><h2>'+esc(t('home.prog'))+'</h2><p class="sub2">'+esc(t('home.prog.s',done,todo.length))+'</p></div></div><div class="todo">'+todo.map(x=>'<a class="'+(x[0]?'done':'')+'" href="'+B+x[2]+'"><span class="ck">'+ic('check')+'</span><span>'+esc(t(x[1]))+'</span></a>').join('')+'</div></div>':'')+
'<div class="quick">'+q.map(x=>'<a href="'+B+x[0]+'"><span class="ic">'+ic(x[1])+'</span>'+esc(t(x[2]))+'</a>').join('')+'</div>'+
(pro?'':'<div class="promo"><div style="flex:1 1 260px"><h2>'+esc(t('home.pro'))+'</h2><p>'+esc(t('home.pro.s'))+'</p></div><a class="btn" href="'+B+'/app/plan">'+esc(t('home.pro.btn'))+'</a></div>')+'</div>';
$('#cp').onclick=()=>UZ.copy(url);
})();
