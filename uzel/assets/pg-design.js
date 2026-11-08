(async function(){
const {$,$$,esc,t,api,ic,B}=UZ;
const me=await UZ.boot('design',{wide:true});if(!me)return;
const p=me.page,pro=me.plan.paid,allowed=me.plan.limits.themes,ext=p.ext||{};
const biz=!!me.plan.business;
const STY=['classic','glass','bigname','neon','planet','editorial','chrome','xp','polaroid','soft'],SBG={glass:'forest',bigname:'night',neon:'rose',planet:'ocean',editorial:'statue',chrome:'chrome',xp:'xp',polaroid:'polaroid',soft:'paper'},BGL=['night','chrome','chrome2','sky','rose','planet','statue','polaroid','ocean','room','forest','orbit','clouds','dusk','xp','paper'];
const S={style:ext.style||'classic',bg:ext.bg||'',theme:p.theme,shape:ext.shape||'soft',hideBadge:!!ext.hideBadge,accent:ext.accent||''};
const ACC=['#0066ff','#0b0b0d','#e5484d','#f76b15','#30a46c','#8e4ec6','#d6409f','#12a594'];
const TH={light:['#f2f2f4','#fff','#fff'],dark:['#0b0b0d','#1e1b1d','#1e1b1d'],blue:['linear-gradient(160deg,#4d94ff,#0055e0)','#ffffff40','#ffffff40'],warm:['#ffe9d6','#fff7ef','#fff7ef'],mint:['#dff5e8','#f4fff8','#f4fff8'],sunset:['linear-gradient(160deg,#ff8a5b,#c2255c 60%,#5b21b6)','#ffffff40','#ffffff40'],graphite:['#26272b','#34353a','#34353a'],lilac:['#ece6ff','#faf8ff','#faf8ff']};
const SH=['soft','round','square'];
function prev(){if(S.style!=='classic')return UZ.phone('<div class="pvfw"><iframe class="pvf" title="preview" src="/api/uzel/me/preview?style='+S.style+'&bg='+encodeURIComponent(S.bg)+'&theme='+S.theme+'&t='+Date.now()+'"></iframe></div>','sm');return UZ.phone(UZ.pv(Object.assign({},p,{theme:S.theme,ext:Object.assign({},ext,{shape:S.shape,accent:S.accent})}),.78),'sm')}
function draw(){
 $('#sty').innerHTML=STY.map(k=>'<button class="stb'+(k==='classic'?' cl':'')+(S.style===k?' on':'')+'" data-y="'+k+'" style="'+(k==='classic'?'':'background-image:url('+B+'/assets/bg/'+SBG[k]+'.webp)')+'"><span>'+esc(t('sty.'+k))+'</span></button>').join('');
 $('#bgs').innerHTML='<button class="stb'+(S.bg===''?' on':'')+'" data-g="" style="background-image:url('+B+'/assets/bg/'+(SBG[S.style]||'night')+'.webp)"><span>'+esc(t('ds.bg.auto'))+'</span></button><button class="stb no'+(S.bg==='none'?' on':'')+'" data-g="none"><span>'+esc(t('ds.bg.none'))+'</span></button>'+BGL.map(k=>'<button class="stb'+(S.bg===k?' on':'')+'" data-g="'+k+'" style="background-image:url('+B+'/assets/bg/'+k+'.webp)"><span>'+esc(t('bg.'+k))+'</span></button>').join('');
 $('#ths').innerHTML=UZ.THEMES.map(k=>{const ok=allowed.includes(k);return '<button class="th'+(S.theme===k?' on':'')+'" data-t="'+k+'" aria-label="'+esc(t('th.'+k))+'"><div class="sw2" style="background:'+TH[k][0]+'"><i style="background:'+TH[k][1]+'"></i><i style="background:'+TH[k][2]+';width:70%"></i></div><b>'+esc(t('th.'+k))+'</b>'+(ok?'':'<span class="lk2">'+UZ.proLock('Pro')+'</span>')+'</button>'}).join('');
 $('#shp').innerHTML=SH.map(k=>'<button class="shp'+(S.shape===k?' on':'')+'" data-s="'+k+'"><i class="s-'+k+'"></i>'+esc(t('sh.'+k))+'</button>').join('');
 $('#acc').innerHTML=ACC.map(c=>'<button class="swc'+(S.accent===c?' on':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="'+c+'"></button>').join('')+'<label class="swc cust" title="'+esc(t('ds.accent'))+'"><input type="color" id="cc" value="'+(S.accent||'#0066ff')+'"></label><button class="btn g sm" id="ar"'+(S.accent?'':' disabled')+'>'+esc(t('ds.accent.reset'))+'</button>';
 $('#pvb').innerHTML=prev();
}
$('#view').innerHTML=UZ.head(t('nav.design'),t('ds.sub'),'<a class="btn g sm" href="'+B+'/app/preview">'+ic('eye')+esc(t('preview'))+'</a>')+
'<div class="dsg"><div class="stack"><div class="card"><h2>'+esc(t('ds.style'))+'</h2><p class="sub2" style="margin-bottom:18px">'+esc(t('ds.style.s'))+'</p><div class="stg" id="sty"></div></div><div class="card"><h2>'+esc(t('ds.bg'))+'</h2><p class="sub2" style="margin-bottom:18px">'+esc(t('ds.bg.s'))+'</p><div class="stg" id="bgs"></div></div><div class="card"><h2 style="margin-bottom:18px">'+esc(t('ds.theme'))+'</h2><div class="ths" id="ths"></div></div><div class="card"><h2 style="margin-bottom:18px">'+esc(t('ds.shape'))+'</h2><div class="shapes" id="shp"></div></div>'+
'<div class="card"><div class="opt" style="margin-bottom:16px"><div><h3>'+esc(t('ds.accent'))+' '+(biz?'':UZ.proLock(t('pl.business')))+'</h3><p>'+esc(t('ds.accent.h'))+'</p></div></div><div class="accs" id="acc"></div></div><div class="card"><div class="opt"><div><h3>'+esc(t('ds.badge'))+' '+(pro?'':UZ.proLock('Pro'))+'</h3><p>'+esc(t('ds.badge.h'))+'</p></div><button class="sw'+(S.hideBadge?' on':'')+'" id="hb" role="switch" aria-checked="'+S.hideBadge+'" aria-label="'+esc(t('ds.badge'))+'"></button></div></div></div><div class="pvbox" id="pvb"></div></div>';
const tr=UZ.tracker(()=>S,async()=>{await UZ.savePage({style:S.style,bg:S.bg,theme:S.theme,shape:S.shape,hideBadge:S.hideBadge,accent:S.accent})});
draw();
$('#sty').onclick=e=>{const b=e.target.closest('[data-y]');if(!b)return;S.style=b.dataset.y;draw();tr.check()};
$('#bgs').onclick=e=>{const b=e.target.closest('[data-g]');if(!b)return;S.bg=b.dataset.g;draw();tr.check()};
$('#ths').onclick=async e=>{const b=e.target.closest('[data-t]');if(!b)return;const k=b.dataset.t;
 if(!allowed.includes(k)){if(await UZ.confirm({title:t('ds.pro'),text:t('ds.pro.s'),ok:t('plans.see')}))location.href=B+'/app/plan';return}
 S.theme=k;draw();tr.check()};
const needBiz=async()=>{if(await UZ.confirm({title:t('ds.pro'),text:t('ds.accent.pro'),ok:t('plans.see')}))location.href=B+'/app/plan'};
$('#acc').onclick=async e=>{if(e.target.closest('#cc'))return;const b=e.target.closest('[data-c]'),r=e.target.closest('#ar');if(!b&&!r)return;if(!biz){needBiz();return}S.accent=r?'':b.dataset.c;draw();tr.check()};
$('#acc').addEventListener('input',e=>{if(e.target.id==='cc'){if(!biz){needBiz();return}S.accent=e.target.value;$('#pvb').innerHTML=prev();tr.check()}});
$('#acc').addEventListener('change',e=>{if(e.target.id==='cc')draw()});
$('#shp').onclick=e=>{const b=e.target.closest('[data-s]');if(!b)return;S.shape=b.dataset.s;draw();tr.check()};
$('#hb').onclick=async e=>{if(!pro){if(await UZ.confirm({title:t('ds.pro'),text:t('ds.badge.pro'),ok:t('plans.see')}))location.href=B+'/app/plan';return}S.hideBadge=!S.hideBadge;e.currentTarget.classList.toggle('on',S.hideBadge);e.currentTarget.setAttribute('aria-checked',S.hideBadge);tr.check()};
})();
