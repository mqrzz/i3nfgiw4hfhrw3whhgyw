(async function(){
const {$,esc,t,api,ic,B}=UZ;
let me=await UZ.boot('plan');if(!me)return;
$('#view').classList.add('paidv');
const box=document.createElement('div');$('#view').innerHTML='';$('#view').appendChild(box);
const dt=d=>new Date(d).toLocaleDateString(UZ.lang==='en'?'en':'ru',{day:'numeric',month:'long',year:'numeric'});
async function run(){
 box.innerHTML='<div class="card paid"><div class="pk wait"><span class="spin"></span></div><h2>'+esc(t('pl.chk'))+'</h2><p class="sub2">'+esc(t('pl.chk.s'))+'</p></div>';
 let ok=false,none=false;
 for(let i=0;i<7&&!ok;i++){
  try{const r=await api('/me/plan/check',{method:'POST'});const f=await api('/me');me=Object.assign(me,f);UZ.me=me;
    ok=r.credited>0||(r.pending===0&&!!r.recent);if(!ok&&r.pending===0&&!r.recent){none=true;break}}catch(e){}
  if(!ok)await new Promise(r=>setTimeout(r,2500));
 }
 if(ok){
  const tier=me.plan.code,lim=me.plan.limits,n=t('pl.name.'+tier);
  const it=[t('pl.f.links',lim.links),t('pl.f.themes',lim.themes.length),t('pl.f.stats',lim.statsDays),t('pl.f.sched'),t('pl.f.badge'),t('pl.f.csv')].concat(tier==='business'?[t('pl.f.accent')]:[]);
  box.innerHTML='<div class="card paid ok"><div class="pk">'+ic('check')+'</div><h2>'+esc(t('pl.ok.t'))+'</h2><p class="pks">'+esc(t('pl.ok.s',n,me.plan.until?dt(me.plan.until):''))+'</p><p class="sub2">'+esc(t('pl.ok.d'))+'</p><div class="pun"><b>'+esc(t('pl.ok.u'))+'</b><ul>'+it.map(x=>'<li>'+ic('check')+'<span>'+esc(x)+'</span></li>').join('')+'</ul></div><div class="pbt"><a class="btn" href="'+B+'/app/design">'+esc(t('pl.ok.go'))+'</a><a class="btn g" href="'+B+'/app/">'+esc(t('pl.ok.home'))+'</a></div></div>';
 }else{
  box.innerHTML='<div class="card paid"><div class="pk wait">'+ic('clock')+'</div><h2>'+esc(t(none?'pl.none.t':'pl.wait.t'))+'</h2><p class="sub2">'+esc(t(none?'pl.none.s':'pl.wait.s'))+'</p><div class="pbt"><button class="btn" id="pagain">'+esc(t('pl.again'))+'</button><a class="btn g" href="'+B+'/app/plan">'+esc(t('pl.back'))+'</a></div></div>';
  $('#pagain').onclick=run;
 }
}
run();
})();
