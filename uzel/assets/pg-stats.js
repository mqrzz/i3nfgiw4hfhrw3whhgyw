(async function(){
const {$,$$,esc,t,api,ic,B,nf}=UZ;
const me=await UZ.boot('stats',{wide:true});if(!me)return;
const max=me.plan.limits.statsDays,pro=me.plan.paid;
let days=Math.min(14,max),d=null;
$('#view').innerHTML=UZ.head(t('nav.stats'),t('st.sub'),'<div class="seg" id="sg"></div>')+'<div class="stack" id="body"><div class="empty"><span class="spin"></span></div></div>';
const dev={mobile:t('st.mobile'),desktop:t('st.desktop'),tablet:t('st.tablet')};
function seg(){$('#sg').innerHTML=[7,14,30,90,365].map(x=>'<button data-d="'+x+'" class="'+(x===days?'on':'')+'"'+(x>max?' title="Pro"':'')+'>'+x+' '+esc(t('st.d'))+(x>max?ic('lock'):'')+'</button>').join('')}
const srcIc=UZ.srcIc;
function devIc(x){return ic(x==='mobile'?'smartphone':x==='tablet'?'tablet':'monitor')}
function bars(list,key,val,fmt,icf){const m=Math.max(1,...list.map(x=>x[val]));return list.length?'<div class="rows">'+list.map(x=>'<div class="r"><span>'+(icf?icf(x[key]):'')+esc(fmt?fmt(x[key]):x[key])+'</span><div class="meter"><i style="width:'+Math.round(x[val]/m*100)+'%"></i></div><em>'+nf(x[val])+'</em></div>').join('')+'</div>':'<div class="empty">'+esc(t('st.none'))+'</div>'}
function draw(){
 const tot=d.totals,ctr=tot.views?Math.round(tot.clicks/tot.views*100):0,m=Math.max(1,...d.series.map(x=>x.views));
 const lab=s=>new Date(s+'T00:00:00').toLocaleDateString(UZ.lang,{day:'numeric',month:'short'});
 $('#body').innerHTML='<div class="kpis" style="grid-template-columns:repeat(4,1fr)"><div class="card kpi"><small>'+ic('eye','hic')+esc(t('st.views'))+'</small><b>'+nf(tot.views)+'</b></div><div class="card kpi"><small>'+ic('mouse-pointer-click','hic')+esc(t('st.clicks'))+'</small><b>'+nf(tot.clicks)+'</b></div><div class="card kpi"><small>'+ic('percent','hic')+'CTR</small><b>'+ctr+'%</b></div><div class="card kpi"><small>'+ic('inbox','hic')+esc(t('st.leads'))+'</small><b>'+nf(d.leads)+'</b></div></div>'+
 '<div class="card"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><h2>'+ic('chart-line','hic')+esc(t('st.dyn'))+'</h2><span class="hint" style="margin:0"><i class="dot" style="background:var(--b2)"></i> '+esc(t('st.views'))+' &nbsp; <i class="dot" style="background:var(--blue)"></i> '+esc(t('st.clicks'))+'</span></div><div class="chart">'+d.series.map(x=>'<div class="col"><div class="tip">'+esc(lab(x.day))+': '+x.views+' / '+x.clicks+'</div><div class="bar" style="height:'+Math.round(x.views/m*100)+'%"><div class="bar c" style="height:'+(x.views?Math.round(x.clicks/x.views*100):0)+'%;margin-top:auto;border-radius:6px 6px 3px 3px;min-height:'+(x.clicks?3:0)+'px"></div></div></div>').join('')+'</div><div class="axis"><span>'+esc(lab(d.series[0].day))+'</span><span>'+esc(lab(d.series[d.series.length-1].day))+'</span></div></div>'+
 '<div class="grid2"><div class="card"><h2>'+ic('flame','hic')+esc(t('st.top'))+'</h2>'+bars(d.links,'title','clicks',null,()=>ic('link'))+'</div><div class="card"><h2>'+ic('compass','hic')+esc(t('st.src'))+'</h2>'+bars(d.refs,'ref','views',r=>r==='Прямые заходы'?t('st.direct'):r,srcIc)+'</div></div>'+
 '<div class="card"><h2>'+ic('smartphone','hic')+esc(t('st.dev'))+'</h2>'+bars(d.devices,'device','views',x=>dev[x]||x,devIc)+'</div>'+
 (pro?'':'<div class="promo"><div style="flex:1 1 260px"><h2>'+ic('crown','hic')+esc(t('st.pro'))+'</h2><p>'+esc(t('st.pro.s'))+'</p></div><a class="btn" href="'+B+'/app/plan">'+esc(t('home.pro.btn'))+'</a></div>')+
 '<p class="hint">'+esc(t('st.note'))+'</p>';
}
async function load(){seg();try{d=await api('/me/stats?days='+days);draw()}catch(e){$('#body').innerHTML='<div class="empty">'+esc(e.message)+'</div>'}}
$('#sg').onclick=async e=>{const b=e.target.closest('[data-d]');if(!b)return;const x=+b.dataset.d;if(x>max){if(await UZ.confirm({title:t('st.lock'),text:t('st.lock.s'),ok:t('plans.see')}))location.href=B+'/app/plan';return}days=x;load()};
load();
})();
