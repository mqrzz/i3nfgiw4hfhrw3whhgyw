(async function(){
const {$,$$,esc,t,api,ic,B,nf}=UZ;
const me=await UZ.boot('home');if(!me)return;
const p=me.page,pro=me.plan.paid;
const url=p.url||me.pageBase+p.slug;
const live=p.published&&!p.hidden;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const [st0,lr]=await Promise.all([api('/me/stats?days=14').catch(()=>null),api('/me/leads').catch(()=>({leads:[],unread:0}))]);
let st=st0,leads=lr.leads||[];
const series0=st?st.series:[];
const sum=(a,k)=>a.reduce((s,x)=>s+(x[k]||0),0);
const last7=series0.slice(-7),prev7=series0.slice(0,-7).slice(-7);
const v7=sum(last7,'views'),vp=sum(prev7,'views');
const tot=st?st.totals:{views:0,clicks:0};
const fresh=!tot.views;

/* ---- чек-лист ---- */
const real=(p.links||[]).filter(l=>l.kind!=='header'&&l.url);
const todo=[[!!p.avatar,'home.t.photo','/app/profile'],[!!(p.bio||'').trim(),'home.t.bio','/app/profile'],[real.length>=3,'home.t.links','/app/links'],[(p.socials||[]).length>0,'home.t.soc','/app/profile'],[!!p.published,'home.t.pub','/app/profile']];
const done=todo.filter(x=>x[0]).length,pct=Math.round(done/todo.length*100),C=2*Math.PI*34;

/* ---- герой ---- */
let delta='';
if(!fresh&&vp>0){const d=Math.round((v7-vp)/vp*100);delta=d>0?'<span class="dl up">'+ic('trending-up')+esc(t('hm.up',d))+'</span>':d<0?'<span class="dl dn">'+ic('trending-down')+esc(t('hm.down',-d))+'</span>':'<span class="dl">'+ic('minus')+esc(t('hm.flat'))+'</span>';}
else if(fresh)delta='<span class="dl">'+esc(t('hm.new'))+'</span>';
function spark(a){
  if(!a.length||!sum(a,'views'))return '<svg class="spark" viewBox="0 0 280 56" preserveAspectRatio="none" aria-hidden="true"><path d="M0 46 L280 46" stroke="#ffffff55" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" fill="none" vector-effect="non-scaling-stroke"/></svg>';
  const m=Math.max(...a.map(x=>x.views),1),n=a.length;
  const pts=a.map((x,i)=>[i/(n-1)*280,50-x.views/m*42]);
  const d=pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' ');
  return '<svg class="spark" viewBox="0 0 280 56" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><path d="'+d+' L280 56 L0 56 Z" fill="url(#sg)"/><path d="'+d+'" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
}
const lead0=leads.find(l=>!l.read)||leads[0];
const chip=lead0?'<a class="hchip" href="'+B+'/app/form"><span class="cav" style="background:'+UZ.gradient(lead0.name||lead0.contact)+'">'+esc(UZ.initials(lead0.name||lead0.contact))+'</span><span class="ct2"><b>'+esc(lead0.read?(lead0.name||lead0.contact):t('hm.msg'))+'</b><em>'+esc((lead0.name?lead0.name+': ':'')+(lead0.message||lead0.contact))+'</em></span></a>':'';
const hero='<section class="hm-hero"><div class="hl"><span class="pill hp '+(live?'ok':'gray')+'">'+(live?'<i class="lv"></i>':'')+esc(p.hidden?t('home.hidden'):p.published?t('home.live'):t('home.draft'))+'</span>'+
 '<h1>'+esc(t('home.hi',(me.user.name||'').split(' ')[0]||''))+'</h1>'+
 '<div class="hbig"><b id="cnt">'+(reduce?nf(v7):'0')+'</b><span>'+esc(t('hm.week'))+'</span></div><div class="dlr">'+delta+'</div>'+spark(series0.slice(-14))+
 '<div class="lks"><b title="'+esc(url)+'">'+esc(url.replace(/^https?:\/\//,''))+'</b><div class="la"><button class="hb" id="cp" aria-label="'+esc(t('copy'))+'">'+ic('copy')+'<span>'+esc(t('copy'))+'</span></button><button class="hb" id="qr" aria-label="QR">'+ic('qr-code')+'<span>QR</span></button><a class="hb wh" href="'+esc(url)+'" target="_blank" rel="noopener">'+'<span>'+esc(t('open'))+'</span>'+ic('arrow-up-right')+'</a></div></div></div>'+
 '<div class="hr"><div class="phw">'+UZ.phone(UZ.pv(p,1))+'</div>'+chip+'</div></section>';

/* ---- график ---- */
function chartCard(){
  const seg='<div class="seg" id="rng">'+[7,14].concat(pro?[30]:[]).map(n=>'<button data-n="'+n+'"'+(n===14?' class="on"':'')+'>'+esc(t('hm.d',n))+'</button>').join('')+'</div>';
  return '<div class="card c-chart"><div class="chh"><h2>'+ic('chart-line','hic')+esc(t('hm.chart'))+'</h2>'+seg+'</div><div class="ck3" id="ck3"></div><div id="chbox"></div></div>';
}
function smooth(pts){let d='M'+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],mx=(a[0]+b[0])/2;d+=' C'+mx.toFixed(1)+' '+a[1].toFixed(1)+' '+mx.toFixed(1)+' '+b[1].toFixed(1)+' '+b[0].toFixed(1)+' '+b[1].toFixed(1);}return d;}
let cache={14:series0};
function drawChart(n){
  const all=cache[n]||cache[14]||[];const a=n>all.length?all:all.slice(-n);
  const V=sum(a,'views'),Cc=sum(a,'clicks'),conv=V?Math.round(Cc/V*100):0;
  $('#ck3').innerHTML='<div><small>'+esc(t('st.views'))+'</small><b>'+nf(V)+'</b></div><div><small>'+esc(t('st.clicks'))+'</small><b>'+nf(Cc)+'</b></div><div><small>'+esc(t('hm.conv'))+'</small><b>'+conv+'%</b></div>';
  const box=$('#chbox');
  if(!V){box.innerHTML='<div class="empty chempty">'+ic('chart-no-axes-column')+'<p>'+esc(t('hm.chart.none'))+'</p></div>';return;}
  const W=600,H=200,m=Math.max(...a.map(x=>x.views),1),k=a.length;
  const X=i=>i/(k-1)*W,Y=v=>H-8-v/m*(H-30);
  const pv=a.map((x,i)=>[X(i),Y(x.views)]),pc=a.map((x,i)=>[X(i),Y(x.clicks)]);
  const dv=smooth(pv);
  box.innerHTML='<div class="cv" id="cv"><svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06f" stop-opacity=".28"/><stop offset="1" stop-color="#06f" stop-opacity="0"/></linearGradient></defs>'+
   [0,1,2,3].map(i=>'<line x1="0" x2="'+W+'" y1="'+(10+i*(H-30)/3).toFixed(1)+'" y2="'+(10+i*(H-30)/3).toFixed(1)+'" stroke="#0b0b0d12" vector-effect="non-scaling-stroke"/>').join('')+
   '<path d="'+dv+' L'+W+' '+H+' L0 '+H+' Z" fill="url(#cg)"/><path d="'+dv+'" fill="none" stroke="#06f" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/><path d="'+smooth(pc)+'" fill="none" stroke="#0b0b0d" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>'+
   '<i class="xh"></i><i class="dt dv"></i><i class="dt dc"></i><div class="tp2"></div></div><div class="axis"><span>'+fd(a[0].day)+'</span><span>'+fd(a[Math.floor(k/2)].day)+'</span><span>'+fd(a[k-1].day)+'</span></div><div class="lgd"><span><i style="background:#06f"></i>'+esc(t('st.views'))+'</span><span><i class="dkd"></i>'+esc(t('st.clicks'))+'</span></div>';
  const cv=$('#cv'),xh=$('.xh',cv),d1=$('.dv',cv),d2=$('.dc',cv),tp=$('.tp2',cv);
  const hide=()=>{xh.style.opacity=d1.style.opacity=d2.style.opacity=tp.style.opacity=0;};hide();
  const mv=e=>{const r=cv.getBoundingClientRect();let i=Math.round((e.clientX-r.left)/r.width*(k-1));i=Math.max(0,Math.min(k-1,i));const x=i/(k-1)*100;
    xh.style.left=d1.style.left=d2.style.left=x+'%';d1.style.top=(pv[i][1]/H*100)+'%';d2.style.top=(pc[i][1]/H*100)+'%';
    tp.innerHTML='<b>'+fd(a[i].day)+'</b>'+esc(t('st.views'))+' '+nf(a[i].views)+'<br>'+esc(t('st.clicks'))+' '+nf(a[i].clicks);tp.style.left=Math.max(14,Math.min(86,x))+'%';
    xh.style.opacity=d1.style.opacity=d2.style.opacity=tp.style.opacity=1;};
  cv.addEventListener('pointermove',mv);cv.addEventListener('pointerdown',mv);cv.addEventListener('pointerleave',hide);
}
function fd(s){return new Date(s+'T00:00:00').toLocaleDateString(UZ.lang,{day:'numeric',month:'short'});}

/* ---- заявки ---- */
function reqCard(){
  const nw=leads.filter(l=>!l.read).length;
  const fOn=p.ext&&p.ext.form&&p.ext.form.enabled;
  let body;
  if(leads.length)body='<div class="rl">'+leads.slice(0,3).map(l=>'<a class="ri'+(l.read?'':' nw')+'" href="'+B+'/app/form"><span class="cav" style="background:'+UZ.gradient(l.name||l.contact)+'">'+esc(UZ.initials(l.name||l.contact))+'</span><span class="rt"><b>'+esc(l.name||l.contact)+'</b><em>'+esc(l.message||l.contact)+'</em></span><small>'+esc(UZ.ago(l.created_at))+'</small></a>').join('')+'</div><a class="btn g sm wfull" href="'+B+'/app/form">'+esc(t('hm.req.all'))+ic('chevron-right')+'</a>';
  else body='<div class="empty rempty">'+ic('inbox')+'<b>'+esc(t('hm.req.none'))+'</b><p>'+esc(t('hm.req.none.s'))+'</p>'+(fOn?'':'<a class="btn sm" href="'+B+'/app/form">'+esc(t('hm.req.on'))+'</a>')+'</div>';
  return '<div class="card c-req"><div class="chh"><h2>'+ic('inbox','hic')+esc(t('hm.req'))+'</h2>'+(nw?'<span class="pill bad">'+esc(t('hm.req.n',nw))+'</span>':'')+'</div>'+body+'</div>';
}
/* ---- топ ссылок ---- */
function topCard(){
  const L=st?st.links:[];let body;
  if(!L.length)body='<div class="empty">'+esc(t('hm.top.none'))+'</div>';
  else{const m=Math.max(...L.map(x=>x.clicks),1);const row=(x,i)=>'<div class="r'+(i>=5?' ex':'')+'"><span>'+ic('link')+esc(x.title)+'</span><div class="meter"><i style="width:'+Math.max(6,x.clicks/m*100)+'%"></i></div><em>'+nf(x.clicks)+'</em></div>';
    body='<div class="rows" id="tl">'+L.slice(0,12).map(row).join('')+'</div>'+(L.length>5?'<button class="btn g sm wfull" id="tm">'+esc(t('hm.more'))+ic('chevron-down')+'</button>':'');}
  return '<div class="card c-top"><div class="chh"><h2>'+ic('flame','hic')+esc(t('hm.top'))+'</h2></div>'+body+'</div>';
}
/* ---- источники ---- */
function srcCard(){
  const R=st?st.refs:[],D=st?st.devices:[];let body='';
  if(!R.length)body='<div class="empty">'+esc(t('hm.src.none'))+'</div>';
  else{const m=Math.max(...R.map(x=>x.views),1);body='<div class="rows">'+R.slice(0,5).map(x=>'<div class="r"><span>'+UZ.srcIc(x.ref)+esc(x.ref==='Прямые заходы'?t('st.direct'):x.ref)+'</span><div class="meter"><i style="width:'+Math.max(6,x.views/m*100)+'%"></i></div><em>'+nf(x.views)+'</em></div>').join('')+'</div>';
    const tv=D.reduce((s,x)=>s+x.views,0),mob=D.filter(x=>x.device==='mobile').reduce((s,x)=>s+x.views,0),mp=tv?Math.round(mob/tv*100):0;
    if(tv)body+='<div class="dev"><div class="db"><i style="width:'+mp+'%"></i></div><div class="dl2"><span>'+ic('smartphone')+esc(t('hm.mob'))+' '+mp+'%</span><span>'+ic('monitor')+esc(t('hm.pc'))+' '+(100-mp)+'%</span></div></div>';}
  return '<div class="card c-src"><div class="chh"><h2>'+ic('compass','hic')+esc(t('hm.src'))+'</h2></div>'+body+'</div>';
}
/* ---- чек-лист ---- */
function todoCard(){
  if(done===todo.length)return '';
  const ring='<div class="ring"><svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="34" fill="none" stroke="#dce9ff" stroke-width="9"/><circle cx="42" cy="42" r="34" fill="none" stroke="#06f" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-pct/100))+'"/></svg><b>'+pct+'%</b></div>';
  return '<div class="card c-todo"><div class="prog">'+ring+'<div><h2>'+ic('list-checks','hic')+esc(t('hm.todo'))+'</h2><p class="sub2">'+esc(t('hm.todo.s',done,todo.length))+'</p></div></div><div class="todo">'+todo.map(x=>'<a class="'+(x[0]?'done':'')+'" href="'+B+x[2]+'"><span class="ck">'+ic('check')+'</span><span>'+esc(t(x[1]))+'</span></a>').join('')+'</div></div>';
}
const promo=pro?'':'<div class="promo"><div style="flex:1 1 260px"><h2>'+ic('crown','hic')+esc(t('home.pro'))+'</h2><p>'+esc(t('home.pro.s'))+'</p></div><a class="btn" href="'+B+'/app/plan">'+esc(t('home.pro.btn'))+'</a></div>';

const todoFirst=fresh&&done<todo.length;
const row2=todoFirst?todoCard()+reqCard():chartCard()+reqCard();
const row3=(todoFirst?chartCard():todoCard())+topCard()+srcCard();
$('#view').classList.add('hm');
$('#view').innerHTML=hero+'<div class="hg"><div class="r2">'+row2+'</div><div class="r3">'+row3+'</div></div>'+promo;

/* ---- поведение ---- */
$('#cp').onclick=()=>UZ.copy(url);
async function qrPoster(){
  const en=UZ.lang==='en',W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
  try{await Promise.all([document.fonts.load('800 60px Unbounded'),document.fonts.load('600 30px "Golos Text"')]);}catch(e){}
  const svg=await (await fetch('/api/uzel/qr/'+encodeURIComponent(p.slug))).text();
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));});
  const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#0a1f5c');bg.addColorStop(.55,'#0047c2');bg.addColorStop(1,'#0066ff');g.fillStyle=bg;g.fillRect(0,0,W,H);
  const rr=(x,y,w,h,r)=>{g.beginPath();g.roundRect(x,y,w,h,r);};
  g.fillStyle='#ffffff';
  [[10,6,50,12,.6],[0,26,64,12,1],[18,46,38,12,.35]].forEach(([x,y,w,h,o])=>{g.globalAlpha=o;rr(84+x*1.1,78+y*1.1,w*1.1,h*1.1,7);g.fill();});g.globalAlpha=1;
  g.font='800 46px Unbounded, sans-serif';g.textBaseline='middle';g.fillText(en?'uzel':'узел',84+64*1.1+22,128);
  g.textBaseline='alphabetic';g.font='800 74px Unbounded, sans-serif';g.fillStyle='#fff';
  const head=en?['Scan to','open the page']:['Наведите камеру,','чтобы открыть'];g.fillText(head[0],84,300);g.fillText(head[1],84,388);
  g.save();g.shadowColor='#00000066';g.shadowBlur=60;g.shadowOffsetY=24;g.fillStyle='#fff';rr(140,450,800,800,56);g.fill();g.restore();
  g.drawImage(img,180,490,720,720);
  g.fillStyle='#fff';g.font='800 44px Unbounded, sans-serif';
  let nm=p.name||'';while(g.measureText(nm).width>W-168&&nm.length>3)nm=nm.slice(0,-2);if(nm!==(p.name||''))nm=nm.trimEnd()+'…';
  g.textAlign='center';g.fillText(nm,W/2,1312);g.textAlign='left';
  return cv;
}
$('#qr').onclick=async()=>{
  if(!live){UZ.toast(t('home.draft'),true);return;}
  const m=document.createElement('div');m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
  m.innerHTML='<div class="box qrb"><h3>'+ic('qr-code','hic')+esc(t('hm.qr'))+'</h3><p>'+esc(t('hm.qr.s'))+'</p><div class="qrp"><span class="spin"></span></div><div class="acts"><button class="btn g" data-c>'+esc(t('hm.close'))+'</button><button class="btn" id="qdl" disabled>'+ic('download')+esc(t('hm.dl'))+'</button></div><a class="qsv" href="/api/uzel/qr/'+esc(p.slug)+'?dl=1" download>'+esc(t('hm.dl.svg'))+'</a></div>';
  const cl=()=>{m.remove();document.removeEventListener('keydown',kd);};const kd=e=>{if(e.key==='Escape')cl();};
  m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-c]'))cl();});document.addEventListener('keydown',kd);document.body.appendChild(m);
  try{const cv=await qrPoster();const box=$('.qrp',m);box.innerHTML='';const im=new Image();im.alt='QR';im.src=cv.toDataURL('image/png');box.appendChild(im);
    const b=$('#qdl',m);b.disabled=false;b.onclick=()=>cv.toBlob(bl=>{const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='uzel-'+p.slug+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);},'image/png');
  }catch(e){$('.qrp',m).innerHTML='<img alt="QR" src="/api/uzel/qr/'+esc(p.slug)+'">';UZ.toast(t('err.generic'),true);}
};
const tm=$('#tm');if(tm)tm.onclick=()=>{const o=$('#tl').classList.toggle('open');tm.innerHTML=esc(t(o?'hm.less':'hm.more'))+ic(o?'chevron-up':'chevron-down');};
if($('#chbox')){
  drawChart(14);
  $$('#rng button').forEach(b=>b.onclick=async()=>{const n=+b.dataset.n;$$('#rng button').forEach(x=>x.classList.toggle('on',x===b));
    if(n===30&&!cache[30]){try{const r=await api('/me/stats?days=30');cache[30]=r.series;}catch(e){UZ.toast(e.message,true);return;}}
    drawChart(n);});
}
if(!reduce){const el=$('#cnt'),t0=performance.now(),D=1100;const f=now=>{const k=Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,4);el.textContent=nf(Math.round(v7*e));if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);}
})();
