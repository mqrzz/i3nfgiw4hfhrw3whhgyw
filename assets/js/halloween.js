(function(){
'use strict';
/* ===== НАСТРОЙКИ (меняйте здесь) ===== */
var CFG={
  until:'7 ноября',                       // до какой даты действует скидка
  tg:'antviz_official',                   // ваш Telegram
  prizes:[                                 // 8 секторов колеса, w = вес (чем больше, тем чаще выпадает)
    {t:'−5%',   m:'скидка 5%',  w:20},
    {t:'−10%',  m:'скидка 10%', w:12},
    {t:'Аудит', m:'бесплатный аудит сайта', w:12},
    {t:'−7%',   m:'скидка 7%',  w:18},
    {t:'−15%',  m:'скидка 15%', w:3},
    {t:'Правка',m:'одна дополнительная правка бесплатно', w:12},
    {t:'−5%',   m:'скидка 5%',  w:15},
    {t:'−10%',  m:'скидка 10%', w:8}
  ]
};
var KEY='antviz_hw26', IMG=(function(){var s=document.currentScript||document.querySelector('script[src*="halloween.js"]');var u=s?s.getAttribute('src'):'assets/js/halloween.js';return u.replace(/js\/halloween\.js.*$/,'img/halloween/');})();
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function im(n,c,w){return '<img'+(c?' class="'+c+'"':'')+' src="'+IMG+n+'.svg" alt=""'+(w?' width="'+w+'" height="'+w+'"':'')+' loading="lazy">';}
function store(v){try{if(v===undefined)return JSON.parse(localStorage.getItem(KEY)||'null');localStorage.setItem(KEY,JSON.stringify(v));}catch(e){return null;}}

/* ===== декор ===== */
var layer=el('div','hw-layer');layer.setAttribute('aria-hidden','true');
layer.innerHTML='<div class="hw-web l">'+im('web')+'</div><div class="hw-web r">'+im('web')+'</div>'+
 [[ '22s','0s','18vh','1'],['30s','9s','46vh','.8'],['26s','15s','72vh','1.15']].map(function(b){return '<div class="hw-bat" style="--d:'+b[0]+';--dl:'+b[1]+';--y0:'+b[2]+';--s:'+b[3]+';top:0">'+im('bat')+'</div>';}).join('');
document.body.appendChild(layer);
var sp=el('div','hw-spider',' <i></i>'+im('spider'));sp.setAttribute('aria-hidden','true');sp.style.position='absolute';document.body.appendChild(sp);
var foot=document.querySelector('footer.site-foot')||document.querySelector('footer:last-of-type');
if(foot){
  var row=el('div','hw-row');
  row.innerHTML='<div>'+[['pumpkin','p',78],['ghost','g',64],['pumpkin','p',110],['ghost','g',54],['pumpkin','p',90],['ghost','g',72],['pumpkin','p',70]].map(function(a,i){return im(a[0],a[2]?a[1]:'',a[2]).replace('<img','<img style="animation-delay:'+(i*.5)+'s"');}).join('')+'</div>';
  foot.parentNode.insertBefore(row,foot);
  var cr=el('small','hw-credit','Хэллоуин-графика: Twemoji, © Twitter/X и контрибьюторы, лицензия CC-BY 4.0');foot.appendChild(cr);
}

/* ===== колесо ===== */
var P=CFG.prizes,N=P.length,COLORS=['#ff6a00','#6a2fb0','#ff8f3d','#3b1a66','#ffa65e','#6a2fb0','#ff6a00','#3b1a66'];
var ov=el('div','hw-ov');ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Колесо Хэллоуина');
ov.innerHTML='<div class="hw-modal"><button class="hw-x" aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>'+
 '<h2>Колесо <em>Хэллоуина</em></h2><p>Одно вращение на человека. Выигрыш действует на новый проект до '+CFG.until+'.</p>'+
 '<div class="hw-wheel"><svg class="hw-ptr" viewBox="0 0 34 42"><path d="M17 42 2 14a17 17 0 1 1 30 0z" fill="#fff"/><circle cx="17" cy="15" r="6" fill="#ff6a00"/></svg><canvas width="760" height="760"></canvas><button class="hw-hub" type="button">Крутить</button></div>'+
 '<div class="hw-res"><div class="hw-prize"></div><p class="hw-msg"></p><div class="hw-code"><span class="hw-c"></span><button type="button" class="hw-cp">Копировать</button></div><a class="hw-go" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.7 19.5c-.2 1-.9 1.3-1.7.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13 1.8 11.5c-1-.3-1-1 .2-1.5L20.4 3c.9-.3 1.6.2 1.5 1.3z"/></svg>Забрать в Telegram</a><p class="hw-note">Это акция сайта antviz.ru: код называете при обсуждении проекта. Скидки не суммируются.</p></div></div>';
document.body.appendChild(ov);
var cv=ov.querySelector('canvas'),ctx=cv.getContext('2d'),hub=ov.querySelector('.hw-hub'),res=ov.querySelector('.hw-res');
var rot=0,spinning=false;
function draw(a){var W=cv.width,c=W/2,r=c-18,seg=Math.PI*2/N;ctx.clearRect(0,0,W,W);ctx.save();ctx.translate(c,c);
  ctx.beginPath();ctx.arc(0,0,c-4,0,7);ctx.fillStyle='#150b24';ctx.fill();
  ctx.rotate(a);
  for(var i=0;i<N;i++){ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,-Math.PI/2-seg/2+i*seg,-Math.PI/2+seg/2+i*seg);ctx.closePath();ctx.fillStyle=COLORS[i%COLORS.length];ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#150b24';ctx.stroke();
    ctx.save();ctx.rotate(i*seg);ctx.fillStyle='#fff';ctx.font='800 '+(P[i].t.length>4?40:54)+'px Unbounded, Golos Text, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.translate(0,-r*.70);var a2=i*seg;if(a2>Math.PI/2+.01&&a2<Math.PI*1.5-.01)ctx.rotate(Math.PI);ctx.fillText(P[i].t,0,0);ctx.restore();}
  for(var k=0;k<N;k++){ctx.save();ctx.rotate(k*seg+seg/2);ctx.beginPath();ctx.arc(0,-r+4,7,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.restore();}
  ctx.restore();}
function code(){var s='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',o='HW-';for(var i=0;i<4;i++)o+=s[Math.floor(Math.random()*s.length)];return o;}
function pick(){var t=0,i;P.forEach(function(p){t+=p.w;});var r=Math.random()*t;for(i=0;i<N;i++){r-=P[i].w;if(r<=0)return i;}return 0;}
function show(s){res.classList.add('on');res.querySelector('.hw-prize').textContent=P[s.i].t==='Аудит'?'Аудит в подарок':P[s.i].t==='Правка'?'Правка в подарок':'Скидка '+P[s.i].t.replace('−','');
  res.querySelector('.hw-msg').textContent='Ваш выигрыш: '+P[s.i].m+'. Покажите код при обсуждении проекта.';
  res.querySelector('.hw-c').textContent=s.c;
  var txt='Здравствуйте! На колесе Хэллоуина выпало: '+P[s.i].m+' (код '+s.c+'). Хочу обсудить проект.';
  res.querySelector('.hw-go').href='https://t.me/'+CFG.tg+'?text='+encodeURIComponent(txt);
  hub.textContent='Готово';hub.disabled=true;fab.querySelector('b').textContent='Ваш код '+s.c;fab.querySelector('small').textContent='Нажмите, чтобы открыть';}
function spin(){if(spinning||store())return;spinning=true;hub.disabled=true;var i=pick(),seg=Math.PI*2/N;
  var target=-(i*seg)+(Math.random()-.5)*seg*.55;var turns=reduce?1:6;var from=rot%(Math.PI*2);var end=from+(Math.PI*2)*turns+((target-from)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
  var dur=reduce?900:5200,t0=performance.now();
  (function f(now){var p=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-p,4);rot=from+(end-from)*e;draw(rot);if(p<1)requestAnimationFrame(f);else{spinning=false;var s={i:i,c:code()};store(s);show(s);}})(t0);}
hub.addEventListener('click',spin);
ov.querySelector('.hw-cp').addEventListener('click',function(){var t=res.querySelector('.hw-c').textContent,b=this;try{navigator.clipboard.writeText(t).then(function(){b.textContent='Скопировано';setTimeout(function(){b.textContent='Копировать';},1600);});}catch(e){}});
function open(){ov.classList.add('on');document.body.classList.add('hw-lock');draw(rot);var s=store();if(s){rot=-(s.i*Math.PI*2/N);draw(rot);show(s);}hub.focus({preventScroll:true});}
function close(){ov.classList.remove('on');document.body.classList.remove('hw-lock');try{sessionStorage.setItem('hw_seen','1');}catch(e){}}
ov.querySelector('.hw-x').addEventListener('click',close);ov.addEventListener('click',function(e){if(e.target===ov)close();});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('on'))close();});
var fab=el('button','hw-fab','<img src="'+IMG+'pumpkin.svg" alt=""><span><b>Колесо Хэллоуина</b><small>Скидка до 15%</small></span>');fab.type='button';fab.addEventListener('click',open);document.body.appendChild(fab);
var st=store();if(st){fab.querySelector('b').textContent='Ваш код '+st.c;fab.querySelector('small').textContent='Нажмите, чтобы открыть';}
var seen=false;try{seen=sessionStorage.getItem('hw_seen');}catch(e){}
if(!seen&&!st&&location.pathname.indexOf('/dokumenty/')<0)setTimeout(open,6000);
})();
