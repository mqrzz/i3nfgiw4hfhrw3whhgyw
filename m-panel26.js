/* m-panel26.js — общее меню админки Antviz.
   Подключается как обычный (не module) <script src="/m-panel26.js">
   на каждой странице /admin/*. Строит:
   - десктопный сайдбар слева (>760px) и сдвигает контент через margin-left на body
   - мобильное выезжающее меню (<=760px), которое открывает уже существующая
     кнопка-гамбургер (#mTrigger) через window.openMPanel26()
   Бейджи (navBadgeOrders/Tickets/Chats) рендерятся с теми же id, что и раньше,
   так что existing-скрипты каждой страницы просто находят их и обновляют —
   переделывать ничего на страницах не нужно. */
(function(){
  if (window.__mPanel26Loaded) return;
  window.__mPanel26Loaded = true;

  var NAV = [
    {section:'Основное'},
    {href:'/admin', label:'Дашборд', badge:null, icon:'grid', exact:true},
    {href:'/admin/orders', label:'Заказы', badge:'navBadgeOrders', icon:'orders'},
    {section:'Клиенты'},
    {href:'/admin/tickets', label:'Обслуживание', badge:'navBadgeTickets', icon:'tickets'},
    {href:'/admin/chats', label:'Чаты', badge:'navBadgeChats', icon:'chats'},
    {href:'/admin/bans', label:'Баны', badge:null, icon:'bans'},
    {href:'/admin/promos', label:'Промокоды', badge:null, icon:'promos'},
    {section:'Система'},
    {href:'/admin/reviews', label:'Отзывы', badge:null, icon:'reviews'}
  ];

  var ICONS = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    orders:'<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
    tickets:'<path d="M2 9a3 3 0 010-6h20a3 3 0 010 6"/><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6"/><path d="M6 12h12"/>',
    chats:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
    bans:'<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/>',
    promos:'<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/>',
    reviews:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    logout:'<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>',
    close:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    logo:'<path d="M10 2L3 7v11h5v-5h4v5h5V7L10 2z"/>'
  };

  var rawPath = location.pathname.replace(/\/+$/,'') || '/admin';
  function isActive(item){
    if(item.exact) return rawPath === item.href;
    return rawPath === item.href || rawPath.indexOf(item.href + '/') === 0;
  }

  function svg(name){ return '<svg viewBox="0 0 24 24">'+ICONS[name]+'</svg>'; }

  function navHtml(){
    return NAV.map(function(item){
      if(item.section) return '<div class="m26-sec">'+item.section+'</div>';
      var active = isActive(item);
      var badge = item.badge ? '<span class="m26-badge" id="'+item.badge+'" style="display:none"></span>' : '';
      return '<a href="'+item.href+'" class="m26-item'+(active?' active':'')+'">'+svg(item.icon)+'<span>'+item.label+'</span>'+badge+'</a>';
    }).join('');
  }

  var style = document.createElement('style');
  style.textContent =
    '.m26-side{display:none;position:fixed;top:0;left:0;bottom:0;width:236px;background:var(--card,#fff);border-right:1px solid var(--line,#e6e8ec);z-index:250;flex-direction:column}'+
    '@media(min-width:761px){.m26-side{display:flex}body{margin-left:236px}}'+
    '.m26-logo{padding:22px 18px 16px;display:flex;align-items:center;gap:11px;text-decoration:none;flex-shrink:0}'+
    '.m26-logo .lm{width:34px;height:34px;border-radius:11px;background:var(--green,#1ede7b);display:flex;align-items:center;justify-content:center;flex-shrink:0}'+
    '.m26-logo .lm svg{width:18px;height:18px;fill:var(--dark,#14171c)}'+
    '.m26-logo .ln{font-family:var(--font);font-weight:500;font-size:.98rem;color:var(--text,#14171c);letter-spacing:-.02em}'+
    '.m26-logo .lb{margin-left:auto;font-size:.58rem;font-weight:500;letter-spacing:.07em;text-transform:uppercase;background:var(--red-soft,#fdeae7);color:var(--red,#e8634f);padding:.16rem .5rem;border-radius:7px}'+
    '.m26-nav{flex:1;overflow-y:auto;padding:6px 12px;display:flex;flex-direction:column;gap:2px}'+
    '.m26-sec{font-family:var(--font);font-size:.6rem;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:var(--muted2,#aeb4bf);padding:14px 10px 5px;margin-top:4px}'+
    '.m26-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:var(--r-sm,14px);text-decoration:none;color:var(--muted,#818997);font-family:var(--font);font-size:.86rem;font-weight:400;transition:background .12s,color .12s;position:relative;border:none;background:none;width:100%;text-align:left;cursor:pointer}'+
    '.m26-item:hover{background:var(--bg,#f3f4f7);color:var(--text,#14171c)}'+
    '.m26-item.active{background:var(--green-soft,#e5faee);color:var(--green-d,#0f9950);font-weight:500}'+
    '.m26-item svg{width:17px;height:17px;flex-shrink:0;stroke:currentColor;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}'+
    '.m26-badge{position:absolute;right:10px;background:var(--red,#e8634f);color:#fff;font-size:.6rem;font-weight:500;min-width:17px;height:17px;border-radius:50px;display:flex;align-items:center;justify-content:center;padding:0 4px}'+
    '.m26-foot{padding:12px;border-top:1px solid var(--line,#e6e8ec);flex-shrink:0}'+
    '.m26-foot .m26-item{color:var(--red,#e8634f)}'+
    '.m26-overlay{display:none;position:fixed;inset:0;background:rgba(10,12,16,.45);z-index:400;opacity:0;transition:opacity .2s}'+
    '.m26-overlay.show{display:block;opacity:1}'+
    '.m26-drawer{position:fixed;top:0;left:0;bottom:0;width:82vw;max-width:300px;background:var(--card,#fff);z-index:410;display:flex;flex-direction:column;transform:translateX(-100%);transition:transform .22s cubic-bezier(.2,.8,.2,1);box-shadow:var(--sh-lg,0 28px 64px rgba(20,23,30,.16))}'+
    '.m26-drawer.open{transform:translateX(0)}'+
    '.m26-drawer-head{display:flex;align-items:center;padding:16px 14px 16px 18px;flex-shrink:0}'+
    '.m26-drawer-head .m26-logo{padding:0;flex:1}'+
    '.m26-dclose{width:36px;height:36px;border-radius:var(--r-sm,14px);border:none;background:var(--bg,#f3f4f7);color:var(--text,#14171c);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}'+
    '.m26-dclose svg{width:16px;height:16px;stroke:currentColor;stroke-width:2;fill:none}'+
    'body.m26-lock{overflow:hidden}'+
    '@media(min-width:761px){.m26-overlay,.m26-drawer{display:none!important}}';
  document.head.appendChild(style);

  // ---------- DESKTOP SIDEBAR ----------
  var aside = document.createElement('aside');
  aside.className = 'm26-side';
  aside.innerHTML =
    '<a href="/admin" class="m26-logo"><span class="lm">'+svg('logo')+'</span><span class="ln">Antviz</span><span class="lb">Admin</span></a>'+
    '<nav class="m26-nav">'+navHtml()+'</nav>'+
    '<div class="m26-foot"><button class="m26-item" id="m26LogoutDesktop">'+svg('logout')+'<span>Выйти</span></button></div>';
  document.body.insertBefore(aside, document.body.firstChild);

  // ---------- MOBILE DRAWER ----------
  var overlay = document.createElement('div');
  overlay.className = 'm26-overlay';
  var drawer = document.createElement('div');
  drawer.className = 'm26-drawer';
  drawer.innerHTML =
    '<div class="m26-drawer-head"><span class="m26-logo"><span class="lm">'+svg('logo')+'</span><span class="ln">Antviz</span><span class="lb">Admin</span></span><button class="m26-dclose" id="m26Close">'+svg('close')+'</button></div>'+
    '<nav class="m26-nav">'+navHtml()+'</nav>'+
    '<div class="m26-foot"><button class="m26-item" id="m26LogoutMobile">'+svg('logout')+'<span>Выйти</span></button></div>';
  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  function openDrawer(){ drawer.classList.add('open'); overlay.classList.add('show'); document.body.classList.add('m26-lock'); }
  function closeDrawer(){ drawer.classList.remove('open'); overlay.classList.remove('show'); document.body.classList.remove('m26-lock'); }
  overlay.addEventListener('click', closeDrawer);
  document.getElementById('m26Close').addEventListener('click', closeDrawer);
  drawer.addEventListener('click', function(e){ if(e.target.closest('a.m26-item')) closeDrawer(); });
  window.openMPanel26 = openDrawer;
  window.closeMPanel26 = closeDrawer;

  // ---------- LOGOUT ----------
  // Каждая страница определяет свой window.doLogout() в собственном
  // <script type="module">, который выполняется ПОЗЖЕ этого файла (модули
  // всегда отложенные, обычные скрипты — нет). Поэтому проверяем наличие
  // функции не при подключении, а в момент клика.
  function handleLogout(){
    if (typeof window.doLogout === 'function') window.doLogout();
    else { fetch('https://antviz.ru/api/auth/logout', {method:'POST', credentials:'include'}).catch(function(){}).then(function(){ location.href='/'; }); }
  }
  document.getElementById('m26LogoutDesktop').addEventListener('click', handleLogout);
  document.getElementById('m26LogoutMobile').addEventListener('click', handleLogout);

  // ---------- СИНХРОНИЗАЦИЯ БЕЙДЖЕЙ В МОБИЛЬНОЕ МЕНЮ ----------
  // id должен быть уникален в документе, поэтому реальные бейджи (которые
  // ищут скрипты страниц через getElementById) существуют только в
  // десктопном сайдбаре. Для мобильного дровера зеркалим их состояние.
  NAV.forEach(function(item){
    if(!item.badge) return;
    var master = document.getElementById(item.badge);
    var mirror = drawer.querySelectorAll('.m26-badge')[0]; // placeholder, replaced below
  });
  // Проще: находим пары по порядку — бейджи в NAV идут в одном и том же
  // порядке в обоих списках (desktop и mobile), т.к. рендерятся из одного
  // navHtml().
  (function syncBadges(){
    var badgeItems = NAV.filter(function(i){ return i.badge; });
    var desktopBadges = aside.querySelectorAll('.m26-badge');
    var mobileBadges = drawer.querySelectorAll('.m26-badge');
    badgeItems.forEach(function(item, idx){
      var master = desktopBadges[idx];
      var mirror = mobileBadges[idx];
      if(!master || !mirror) return;
      var mo = new MutationObserver(function(){
        mirror.style.display = master.style.display;
        mirror.textContent = master.textContent;
      });
      mo.observe(master, {attributes:true, attributeFilter:['style'], childList:true, characterData:true, subtree:true});
    });
  })();
})();
