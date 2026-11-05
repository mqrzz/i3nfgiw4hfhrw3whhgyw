(async function(){
const {$,$$,esc,t,api,ic,B}=UZ;
const me=await UZ.boot('preview',{wide:true});if(!me)return;
const p=me.page,url=p.url||me.pageBase+p.slug;let dev='phone';
function draw(){
 const src='/api/uzel/me/preview?ts='+Date.now();
 $('#fr').innerHTML=dev==='phone'?'<div class="frame-ph"><iframe src="'+src+'" title="'+esc(t('preview'))+'"></iframe></div>':'<div class="frame-pc"><div class="bar"><i></i><i></i><i></i><span>'+esc(url.replace(/^https?:\/\//,''))+'</span></div><iframe src="'+src+'" title="'+esc(t('preview'))+'"></iframe></div>';
 $$('#dv button').forEach(b=>b.classList.toggle('on',b.dataset.d===dev));
}
$('#view').innerHTML=UZ.head(t('preview'),t('pv.sub'),'<div class="seg" id="dv"><button data-d="phone">'+ic('smartphone')+' '+esc(t('pv.phone'))+'</button><button data-d="pc">'+ic('monitor')+' '+esc(t('pv.pc'))+'</button></div><button class="btn g sm" id="rf">'+ic('refresh-cw')+esc(t('pv.refresh'))+'</button><a class="btn sm" href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(t('open'))+ic('arrow-up-right')+'</a>')+
(p.published&&!p.hidden?'':'<div class="card" style="margin-bottom:20px;background:#fff7e6;box-shadow:none"><b>'+esc(t('pv.draft'))+'</b></div>')+'<div class="pvwrap" id="fr"></div>';
$('#dv button').style.cssText='display:flex;align-items:center;gap:6px';$$('#dv button')[1].style.cssText='display:flex;align-items:center;gap:6px';
$('#dv').onclick=e=>{const b=e.target.closest('[data-d]');if(b){dev=b.dataset.d;draw()}};$('#rf').onclick=draw;draw();
})();
