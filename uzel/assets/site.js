/* маркетинговые страницы «Узла» */
(function(){
'use strict';
const B=window.UZ_BASE||'',$=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
// мобильное меню
const bg=$('#bgr'),ms=$('#msheet');
if(bg&&ms){bg.onclick=()=>{const on=ms.classList.toggle('on');bg.setAttribute('aria-expanded',on)};document.addEventListener('click',e=>{if(!e.target.closest('#msheet,#bgr'))ms.classList.remove('on')});ms.onclick=e=>{if(e.target.closest('a'))ms.classList.remove('on')}}
// появление при прокрутке
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -40px'}):null;
$$('.rv').forEach(el=>io?io.observe(el):el.classList.add('in'));
// форма «занять адрес»
$$('form.claim').forEach(f=>{
 const inp=$('input',f);
 inp.addEventListener('input',()=>{inp.value=inp.value.toLowerCase().replace(/[^a-z0-9-]/g,'')});
 f.addEventListener('submit',e=>{e.preventDefault();const v=inp.value.trim();location.href=B+'/app/login'+(v?'?slug='+encodeURIComponent(v):'')});
 // подсказка в поле: листаем примеры
 const ex=(inp.dataset.ex||'').split(',').filter(Boolean);if(ex.length&&!matchMedia('(prefers-reduced-motion:reduce)').matches){let i=0;setInterval(()=>{if(document.activeElement!==inp&&!inp.value){i=(i+1)%ex.length;inp.placeholder=ex[i]}},2200)}
});
// живое демо
const demo=$('#demo');
if(demo){
 const st={theme:'blue',shape:'soft'};
 const render=()=>{const pv=$('.pv',demo);pv.className='pv t-'+st.theme+' s-'+st.shape;$$('[data-th]',demo).forEach(b=>b.classList.toggle('on',b.dataset.th===st.theme));$$('[data-sh]',demo).forEach(b=>b.classList.toggle('on',b.dataset.sh===st.shape))};
 demo.addEventListener('click',e=>{const a=e.target.closest('[data-th]'),b=e.target.closest('[data-sh]');if(a)st.theme=a.dataset.th;if(b)st.shape=b.dataset.sh;if(a||b)render()});
 render();
}
// якорная прокрутка с учётом плавающей шапки
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=$(a.getAttribute('href'));if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+scrollY-90,behavior:'smooth'})}}));
// язык: запоминаем выбор
$$('.lang a').forEach(a=>a.addEventListener('click',()=>{try{localStorage.setItem('uzel_lang',a.dataset.l)}catch(e){}}));
})();

;/* geserd-footer */
(function(){var R=Math.PI/180,rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function eob(x){var c=1.70158,d=c+1;return 1+d*Math.pow(x-1,3)+c*Math.pow(x-1,2)}
function cl(x){return Math.min(1,Math.max(0,x))}
document.querySelectorAll('.gs-foot').forEach(function(f){
var m=f.querySelector('.gs-mark'),core=m.querySelector('circle'),A=[].map.call(m.querySelectorAll('path'),function(p){return{p:p,a:+p.dataset.a,l:+p.dataset.l}}),
t0=null,ang=0,tg=0,sm=0;
if(rm)return;
if('IntersectionObserver' in window){new IntersectionObserver(function(e,o){if(e[0].isIntersecting){t0=performance.now();o.disconnect()}},{threshold:.3}).observe(f)}else t0=performance.now();
f.addEventListener('mousemove',function(e){var r=m.getBoundingClientRect();ang=Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2));tg=1});
f.addEventListener('mouseleave',function(){tg=0});
function draw(u){sm+=(tg-sm)*.08;core.setAttribute('r',Math.max(0,5*eob(cl((u-.1)/.5))));
A.forEach(function(o,i){var p=cl((u-.2-.035*((i*7)%12))/.75),s=p>0?eob(p):0;
if(p>=1){s*=1+.03*Math.sin(u*1.6-i*.52);s*=1+.22*sm*Math.pow(Math.max(0,Math.cos(o.a*R-ang)),2)}
o.p.setAttribute('d','M50 50L'+(50+Math.cos(o.a*R)*o.l*s).toFixed(2)+' '+(50+Math.sin(o.a*R)*o.l*s).toFixed(2))})}
draw(0);(function tick(now){if(t0!==null)draw((now-t0)/1000);requestAnimationFrame(tick)})(0)})})();
