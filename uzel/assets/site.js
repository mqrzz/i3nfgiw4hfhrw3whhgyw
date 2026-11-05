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
