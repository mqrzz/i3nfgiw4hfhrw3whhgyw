(async function(){
const {$,$$,esc,t,api,ic,B}=UZ;
const me=await UZ.boot('start',{noPage:true});if(!me)return;
if(me.page){location.replace(B+'/app/');return}
document.body.className='auth-body';document.title=t('start.title')+' · '+t('brand');
const TPL=[
 {id:'personal',icon:'user',theme:'blue',shape:'soft',links:['tpl.personal.l1','tpl.personal.l2','tpl.personal.l3']},
 {id:'business',icon:'store',theme:'warm',shape:'soft',form:true,headers:['tpl.business.h1'],links:['tpl.business.l1','tpl.business.l2','tpl.business.l3']},
 {id:'creator',icon:'music',theme:'dark',shape:'round',headers:['tpl.creator.h1'],links:['tpl.creator.l1','tpl.creator.l2','tpl.creator.l3']},
 {id:'shop',icon:'shopping-bag',theme:'mint',shape:'soft',form:true,links:['tpl.shop.l1','tpl.shop.l2','tpl.shop.l3']},
];
let sel='personal',slugOk=false,pre='';try{pre=sessionStorage.getItem('uzel_slug')||''}catch(e){}
const host=me.pageBase.replace(/^https?:\/\//,'');
document.body.innerHTML='<div class="split">'+UZ.showcase()+'<main class="formside"><div class="card" style="width:min(520px,100%)"><div class="steps"><i class="on"></i><i></i></div><a class="lg" href="'+B+'/" style="margin-top:14px">'+UZ.LOGO+t('brand')+'</a>'+
'<h1>'+esc(t('start.h1'))+'</h1><p class="lead2">'+esc(t('start.p'))+'</p>'+
'<div class="field"><label class="lbl" for="nm">'+ic('user','hic')+esc(t('start.name'))+'</label><input class="inp" id="nm" maxlength="60" placeholder="'+esc(t('start.name.ph'))+'" autocomplete="name"></div>'+
'<div class="field"><label class="lbl" for="sl">'+ic('link','hic')+esc(t('start.addr'))+'</label><div class="adr"><span>'+esc(host)+'</span><input id="sl" maxlength="30" placeholder="'+esc(t('start.addr.ph'))+'" autocapitalize="off" spellcheck="false" autocomplete="off"></div><div class="hint" id="sh">'+esc(t('start.addr.h'))+'</div></div>'+
'<div class="field"><span class="lbl">'+ic('layout-template','hic')+esc(t('start.tpl'))+'</span><div class="tpls" id="tp">'+TPL.map(x=>'<button class="tpl'+(x.id===sel?' on':'')+'" data-t="'+x.id+'"><span class="ic">'+ic(x.icon)+'</span><b>'+esc(t('tpl.'+x.id))+'</b><small>'+esc(t('tpl.'+x.id+'.d'))+'</small></button>').join('')+'</div></div>'+
'<div class="err" id="er" role="alert"></div><button class="btn" id="go" style="width:100%" disabled>'+esc(t('start.go'))+'</button></div></main></div>';
$('#nm').value=(me.user.name||'');
function slugify(s){const m={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ы:'y',э:'e',ю:'yu',я:'ya'};return String(s).toLowerCase().split('').map(c=>m[c]!==undefined?m[c]:c).join('').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,30)}
let touched=false;
if(pre){$('#sl').value=pre;touched=true}
$('#nm').addEventListener('input',()=>{if(!touched){$('#sl').value=slugify($('#nm').value);check()}});
$('#sl').addEventListener('input',()=>{touched=true;$('#sl').value=$('#sl').value.toLowerCase().replace(/[^a-z0-9-]/g,'');check()});
const check=UZ.debounce(async()=>{
 const v=$('#sl').value,h=$('#sh'),i=$('#sl').parentNode;slugOk=false;$('#go').disabled=true;
 if(!v){h.className='hint';h.textContent=t('start.addr.h');return}
 try{const r=await api('/slug/check?slug='+encodeURIComponent(v));slugOk=!!r.available;h.className='hint '+(r.available?'ok':'bad');h.textContent=r.available?t('start.free'):(r.reason||t('start.busy'))}catch(e){h.className='hint bad';h.textContent=e.message}
 $('#go').disabled=!slugOk||!$('#nm').value.trim();
},300);
$('#nm').addEventListener('input',()=>{$('#go').disabled=!slugOk||!$('#nm').value.trim()});
$('#tp').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;sel=b.dataset.t;$$('.tpl').forEach(x=>x.classList.toggle('on',x===b))};
$('#go').onclick=async()=>{
 const tp=TPL.find(x=>x.id===sel),b=$('#go');b.disabled=true;$('#er').textContent='';
 const links=(tp.headers||[]).map(k=>({kind:'header',title:t(k),enabled:true}));
 const body={name:$('#nm').value.trim(),slug:$('#sl').value,theme:tp.theme,shape:tp.shape,lang:UZ.lang,links,socials:[],published:true,form:{enabled:!!tp.form}};
 try{await api('/me/page',{method:'PUT',body});
  try{sessionStorage.setItem('uzel_starter',JSON.stringify(tp.links.map(k=>t(k))));sessionStorage.removeItem('uzel_slug')}catch(e){}
  location.href=B+'/app/links?welcome=1';
 }catch(e){$('#er').textContent=e.message;b.disabled=false}
};
if(pre)check();$('#nm').focus();
})();
