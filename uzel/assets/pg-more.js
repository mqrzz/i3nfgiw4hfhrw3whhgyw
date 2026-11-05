(async function(){
const {$,esc,t,ic,B}=UZ;
const me=await UZ.boot('more');if(!me)return;
const unread=me.unread||0,pro=me.plan.paid;
const rows=[['/app/form','inbox','nav.form',unread?'<span class="pill bad" style="padding:4px 10px">'+unread+'</span>':''],['/app/stats','chart-no-axes-column','nav.stats',''],['/app/preview','eye','preview',''],['/app/plan','crown','nav.plan',pro?'<span class="pill pro" style="padding:4px 10px">Pro</span>':''],['/app/security','shield-check','nav.security','']];
$('#view').innerHTML=UZ.head(t('tab.more'),'')+'<div class="more">'+rows.map(r=>'<a class="row" href="'+B+r[0]+'"><span class="ic">'+ic(r[1])+'</span>'+esc(t(r[2]))+'<span class="go">'+(r[3]||ic('chevron-right'))+'</span></a>').join('')+'<button class="row" id="lo"><span class="ic">'+ic('log-out')+'</span>'+esc(t('logout'))+'</button></div>';
$('#lo').onclick=UZ.logout;
})();
