(async function(){
const {$,esc,t,api,ic,B}=UZ;
document.title=t('pl.ok.t')+' · '+t('brand');
document.body.className='paidbody';
const root=document.createElement('main');root.className='paidwrap';
document.body.innerHTML='';document.body.appendChild(root);
const dt=d=>new Date(d).toLocaleDateString(UZ.lang,{day:'numeric',month:'long',year:'numeric'});
const shell=inner=>{root.innerHTML='<a class="paidlogo" href="'+B+'/app/" aria-label="'+esc(t('brand'))+'">'+UZ.LOGO+'<b>'+esc(t('brand')).toLowerCase()+'</b></a><div class="card paid">'+inner+'</div>'};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function run(){
 shell('<div class="pk wait"><span class="spin"></span></div><h2>'+ic('loader','hic')+esc(t('pl.chk'))+'</h2><p class="sub2">'+esc(t('pl.chk.s'))+'</p>');
 let state='none';
 for(let i=0;i<8;i++){
  let r;
  try{r=await api('/me/plan/check',{method:'POST'})}catch(e){if(e.status===401){location.replace(B+'/app/login?next='+encodeURIComponent('/app/paid'));return}await wait(2500);continue}
  const l=r.latest;
  if(!l){state='none';break}
  if(l.status==='succeeded'){state='ok';break}
  if(l.status==='canceled'){state='canceled';break}
  state='wait';await wait(2500);
 }
 if(state==='ok'){
  let me;try{me=await api('/me')}catch(e){me=null}
  const tier=me?me.plan.code:'pro',lim=me&&me.plan.limits,n=t('pl.name.'+tier);
  const it=lim?[t('pl.f.links',lim.links),t('pl.f.themes',lim.themes.length),t('pl.f.stats',lim.statsDays),t('pl.f.sched'),t('pl.f.badge'),t('pl.f.csv')].concat(tier==='business'?[t('pl.f.accent')]:[]):[];
  shell('<div class="pk">'+ic('check')+'</div><h2>'+ic('circle-check','hic')+esc(t('pl.ok.t'))+'</h2><p class="pks">'+esc(t('pl.ok.s',n,me&&me.plan.until?dt(me.plan.until):''))+'</p><p class="sub2">'+esc(t('pl.ok.d'))+'</p>'+(it.length?'<div class="pun"><b>'+esc(t('pl.ok.u'))+'</b><ul>'+it.map(x=>'<li>'+ic('check')+'<span>'+esc(x)+'</span></li>').join('')+'</ul></div>':'')+'<div class="pbt"><a class="btn" href="'+B+'/app/design">'+esc(t('pl.ok.go'))+'</a><a class="btn g" href="'+B+'/app/">'+esc(t('pl.ok.home'))+'</a></div>');
 }else if(state==='canceled'){
  shell('<div class="pk bad">'+ic('x')+'</div><h2>'+ic('circle-x','hic')+esc(t('pl.cancel.t'))+'</h2><p class="sub2">'+esc(t('pl.cancel.s'))+'</p><div class="pbt"><a class="btn" href="'+B+'/app/plan">'+esc(t('pl.back'))+'</a></div>');
 }else{
  const none=state==='none';
  shell('<div class="pk wait">'+ic('clock')+'</div><h2>'+esc(t(none?'pl.none.t':'pl.wait.t'))+'</h2><p class="sub2">'+esc(t(none?'pl.none.s':'pl.wait.s'))+'</p><div class="pbt"><button class="btn" id="pagain">'+esc(t('pl.again'))+'</button><a class="btn g" href="'+B+'/app/plan">'+esc(t('pl.back'))+'</a></div>');
  $('#pagain').onclick=run;
 }
}
run();
})();
