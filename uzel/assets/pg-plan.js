(async function(){
const {$,$$,esc,t,api,ic,B}=UZ;
let me=await UZ.boot('plan',{wide:true});if(!me)return;
if(new URLSearchParams(location.search).get('paid')){
 try{const r=await api('/me/plan/check',{method:'POST'});const fresh=await api('/me');me=Object.assign(me,fresh);UZ.me=me;
  UZ.toast(r.credited?t('pl.paid'):t('pl.pending'));
 }catch(e){UZ.toast(e.message,true)}
 history.replaceState(null,'',location.pathname);
}
const cur=me.plan.code,pr=me.plan.prices,rank={free:0,pro:1,business:2};
let per='year';
const price=(tier)=>tier==='free'?0:Math.round(+pr[tier+'_'+per].amount);
const L={free:me.plan.free,pro:me.plan.pro,business:me.plan.businessLimits};
const rows=[['pl.f.links',t=>L[t].links],['pl.f.themes',t=>L[t].themes.length],['pl.f.stats',t=>L[t].statsDays],['pl.f.form',()=>1],['pl.f.sched',t=>t!=='free'],['pl.f.badge',t=>t!=='free'],['pl.f.csv',t=>t!=='free'],['pl.f.accent',t=>t==='business'],['pl.f.sub',t=>t!=='free']];
const li=(tier)=>rows.map(r=>{const v=r[1](tier);return '<li class="'+(v?'':'no')+'">'+ic(v?'check':'x')+'<span>'+esc(t(r[0],v))+'</span></li>'}).join('');
const until=me.plan.until?new Date(me.plan.until).toLocaleDateString(UZ.lang==='en'?'en':'ru',{day:'numeric',month:'long',year:'numeric'}):null;
function card(tier){
 const name=tier==='free'?'Free':tier==='pro'?'Pro':t('pl.business'),who=t('pl.who.'+(tier==='business'?'biz':tier));
 const mine=cur===tier,lower=rank[cur]>rank[tier];
 let btn;
 if(mine&&tier==='free')btn='<button class="btn g" disabled>'+esc(t('pl.cur'))+'</button>';
 else if(tier==='free')btn='<button class="btn g" disabled>'+esc(t('pl.free.b'))+'</button>';
 else if(lower)btn='<button class="btn g" disabled>'+esc(t('pl.higher'))+'</button>';
 else btn='<button class="btn'+(tier==='business'?' dk':'')+'" data-buy="'+tier+'">'+esc(mine?t('pl.extend'):(cur==='pro'&&tier==='business'?t('pl.upgrade'):t('pl.buy')))+'</button>';
 const p=price(tier);
 return '<div class="plan'+(tier==='pro'?' pro':tier==='business'?' biz':'')+'"><div><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><h2>'+esc(name)+'</h2>'+(mine?'<span class="pill'+(tier==='free'?' gray':' ok')+'" style="'+(tier==='free'?'':'background:#ffffff26;color:#fff')+'">'+esc(t('pl.cur'))+'</span>':'')+'</div><p style="opacity:.75;font-size:15px;margin-top:6px">'+esc(who)+'</p><div class="pr" style="margin-top:14px">'+p+' ₽ <small>'+(tier==='free'?'':'/ '+esc(per==='year'?t('pl.year'):t('pl.month')))+'</small></div>'+(tier!=='free'&&per==='year'?'<p style="opacity:.8;font-size:14px;margin-top:4px">'+esc(t('pl.save',Math.round(+pr[tier+'_month'].amount*12-+pr[tier+'_year'].amount)))+'</p>':'')+'</div><ul>'+li(tier)+'</ul>'+(mine&&tier!=='free'?'<p style="opacity:.85;font-size:15px">'+esc(until?t('pl.until',until):t('pl.forever'))+'</p>':'')+btn+'</div>';
}
function draw(){
 $('#pl').innerHTML='<div style="display:flex;justify-content:center;margin-bottom:22px"><div class="seg" id="pp"><button data-p="month" class="'+(per==='month'?'on':'')+'">'+esc(t('pl.month'))+'</button><button data-p="year" class="'+(per==='year'?'on':'')+'">'+esc(t('pl.year'))+'</button></div></div><div class="plans3">'+['free','pro','business'].map(card).join('')+'</div>';
 $('#pp').onclick=e=>{const b=e.target.closest('[data-p]');if(b){per=b.dataset.p;draw()}};
 $$('[data-buy]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const r=await api('/me/plan/checkout',{method:'POST',body:{plan:b.dataset.buy+'_'+per}});if(r.url)location.href=r.url}catch(er){UZ.toast(er.message,true)}b.disabled=false});
}
$('#view').innerHTML=UZ.head(t('nav.plan'),t('pl.sub'))+'<div id="pl"></div><div class="card" style="margin-top:20px"><h2>'+esc(t('pl.sub.h'))+'</h2><p class="sub2">'+esc(t('pl.sub.s'))+'</p></div>';
draw();
})();
