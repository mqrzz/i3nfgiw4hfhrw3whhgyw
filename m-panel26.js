/* m-panel26.js — общее меню админки Antviz, в стиле Vantage design-system.
   Плавающая capsule-навигация (blur-стекло), приклеенная в левый верхний
   угол с отступом. И на десктопе, и на мобильной — одно и то же поведение:
   клик по капсуле разворачивает список разделов вниз, тот же blur
   наследуется панелью. Никакого постоянного сайдбара — контенту не нужно
   резервировать место, просто отступ сверху под капсулу.
   Подключается как обычный (не module) <script src="/m-panel26.js">. */
(function(){
  if (window.__mPanel26Loaded) return;
  window.__mPanel26Loaded = true;

  var NAV = [
    {href:'/admin', label:'Дашборд', badge:null, icon:'grid', exact:true},
    {href:'/admin/orders', label:'Заказы', badge:'navBadgeOrders', icon:'orders'},
    {href:'/admin/tickets', label:'Обслуживание', badge:'navBadgeTickets', icon:'tickets'},
    {href:'/admin/chats', label:'Чаты', badge:'navBadgeChats', icon:'chats'},
    {href:'/admin/users', label:'Клиенты', badge:null, icon:'users'},
    {href:'/admin/promos', label:'Промокоды', badge:null, icon:'promos'},
    {href:'/admin/reviews', label:'Отзывы', badge:null, icon:'reviews'},
    {href:'/admin/enterprise', label:'Крупные проекты', badge:'navBadgeEnterprise', icon:'enterprise'},
    {href:'/admin/system', label:'Система', badge:null, icon:'system'}
  ];

  var ICONS = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    orders:'<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
    tickets:'<path d="M2 9a3 3 0 010-6h20a3 3 0 010 6"/><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6"/><path d="M6 12h12"/>',
    chats:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
    users:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
    promos:'<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/>',
    reviews:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    enterprise:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M3 12h18"/>',
    system:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    logout:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
    chevron:'<polyline points="6 9 12 15 18 9"/>'
  };

  var rawPath = location.pathname.replace(/\/+$/,'') || '/admin';
  function isActive(item){
    if(item.exact) return rawPath === item.href;
    return rawPath === item.href || rawPath.indexOf(item.href + '/') === 0;
  }
  function svg(name,cls){ return '<svg'+(cls?' class="'+cls+'"':'')+' viewBox="0 0 24 24">'+ICONS[name]+'</svg>'; }

  // ---------- отступ под капсулу вместо постоянного сайдбара ----------
  var style = document.createElement('style');
  style.textContent =
    'body{padding-top:78px}'+
    '@media(max-width:640px){body{padding-top:74px}}'+
    '.m26-cap{position:fixed;top:16px;left:16px;z-index:300;width:264px;max-width:calc(100vw - 32px);'+
      'background:rgba(244,244,242,.72);backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%);'+
      'border:1px solid rgba(255,255,255,.7);border-radius:26px;box-shadow:0 10px 34px rgba(18,18,18,.09);overflow:hidden;'+
      'transition:border-radius .6s cubic-bezier(.65,0,.35,1)}'+
    '.m26-cap.open{border-radius:22px}'+
    '.m26-trigger{display:flex;align-items:center;gap:10px;width:100%;padding:11px 14px 11px 12px;border:none;background:none;cursor:pointer;font-family:inherit;text-align:left}'+
    '.m26-lm{width:32px;height:32px;border-radius:10px;background:#121212;display:flex;align-items:center;justify-content:center;flex-shrink:0}'+
    '.m26-lm svg{width:17px;height:17px;fill:#f4f4f2}'+
    '.m26-tname{flex:1;min-width:0;font-size:.9rem;font-weight:600;color:#121212;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
    '.m26-tdot{width:7px;height:7px;border-radius:50%;background:#e8634f;flex-shrink:0;margin-right:2px;display:none}'+
    '.m26-tdot.show{display:block}'+
    '.m26-chev{width:16px;height:16px;stroke:#6b6b68;stroke-width:2;fill:none;flex-shrink:0;transition:transform .4s cubic-bezier(.65,0,.35,1)}'+
    '.m26-cap.open .m26-chev{transform:rotate(180deg)}'+
    '.m26-drop{max-height:0;opacity:0;overflow:hidden;transition:max-height .6s cubic-bezier(.65,0,.35,1),opacity .45s ease}'+
    '.m26-drop.open{max-height:520px;opacity:1;overflow-y:auto}'+
    '.m26-list{padding:2px 8px 8px}'+
    '.m26-item{display:flex;align-items:center;gap:11px;padding:10px 10px;border-radius:14px;text-decoration:none;color:#6b6b68;font-family:inherit;font-size:.87rem;font-weight:500;position:relative;border:none;background:none;width:100%;text-align:left;cursor:pointer;border-top:1px solid rgba(18,18,18,.07)}'+
    '.m26-list a.m26-item:first-child, .m26-list button.m26-item:first-child{border-top:none}'+
    '.m26-item:hover{color:#121212}'+
    '.m26-item.active{color:#121212;font-weight:700}'+
    '.m26-item svg{width:16px;height:16px;flex-shrink:0;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}'+
    '.m26-badge{margin-left:auto;background:#e8634f;color:#fff;font-size:.62rem;font-weight:600;min-width:17px;height:17px;border-radius:50px;display:flex;align-items:center;justify-content:center;padding:0 4px}'+
    '.m26-out{margin-top:2px;color:#e8634f}';
  document.head.appendChild(style);

  // ---------- capsule ----------
  var cap = document.createElement('div');
  cap.className = 'm26-cap';
  var itemsHtml = NAV.map(function(item){
    var active = isActive(item);
    var badge = item.badge ? '<span class="m26-badge" id="'+item.badge+'" style="display:none"></span>' : '';
    return '<a href="'+item.href+'" class="m26-item'+(active?' active':'')+'">'+svg(item.icon)+'<span>'+item.label+'</span>'+badge+'</a>';
  }).join('') + '<button class="m26-item m26-out" id="m26Logout">'+svg('logout')+'<span>Выйти</span></button>';

  cap.innerHTML =
    '<button class="m26-trigger" id="m26Trigger">'+
      '<span class="m26-lm"><svg viewBox="0 0 20 20"><path d="M10 2L3 7v11h5v-5h4v5h5V7L10 2z"/></svg></span>'+
      '<span class="m26-tdot" id="m26Dot"></span>'+
      '<span class="m26-tname">Antviz Admin</span>'+
      svg('chevron','m26-chev')+
    '</button>'+
    '<div class="m26-drop" id="m26Drop"><nav class="m26-list">'+itemsHtml+'</nav></div>';
  document.body.insertBefore(cap, document.body.firstChild);

  var trigger = document.getElementById('m26Trigger');
  var drop = document.getElementById('m26Drop');
  function toggleNav(){ cap.classList.toggle('open'); drop.classList.toggle('open'); }
  function closeNav(){ cap.classList.remove('open'); drop.classList.remove('open'); }
  trigger.addEventListener('click', toggleNav);
  document.addEventListener('click', function(e){
    if(!cap.contains(e.target)) closeNav();
  });
  cap.addEventListener('click', function(e){ if(e.target.closest('a.m26-item')) closeNav(); });

  // ---------- logout ----------
  // Каждая страница определяет window.doLogout() в своём <script type="module">,
  // который выполняется ПОЗЖЕ этого файла (модули всегда отложенные, обычные
  // скрипты — нет). Поэтому проверяем функцию не при подключении, а в момент клика.
  document.getElementById('m26Logout').addEventListener('click', function(){
    closeNav();
    if (typeof window.doLogout === 'function') window.doLogout();
    else fetch('https://antviz.ru/api/auth/logout', {method:'POST', credentials:'include'}).catch(function(){}).then(function(){ location.href='/'; });
  });

  // ---------- агрегатная точка на капсуле, если где-то есть непрочитанное ----------
  (function watchBadges(){
    var badgeEls = NAV.filter(function(i){return i.badge;}).map(function(i){ return document.getElementById(i.badge); });
    var dot = document.getElementById('m26Dot');
    function recalc(){
      var any = badgeEls.some(function(b){ return b && b.style.display !== 'none' && b.textContent.trim() !== ''; });
      dot.classList.toggle('show', any);
    }
    badgeEls.forEach(function(b){
      if(!b) return;
      var mo = new MutationObserver(recalc);
      mo.observe(b, {attributes:true, attributeFilter:['style'], childList:true, characterData:true, subtree:true});
    });
    recalc();
  })();
})();
