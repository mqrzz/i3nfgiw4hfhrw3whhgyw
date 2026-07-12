/**
 * sidebar.js — общая боковая панель личного кабинета Antviz
 * <script src="../sidebar.js" data-page="profile"></script>
 *
 * Подключается на всех страницах кабинета: profile, orders, sites,
 * support, tickets, notifications, settings. На ПК (≥981px) рисует
 * постоянный сайдбар слева с разделами и бейджами (активные заказы /
 * непрочитанные сообщения / истекающее обслуживание / непрочитанные
 * уведомления). На мобильных скрыт — там навигация через капсулу
 * nav.js (бургер) и обычный скролл страницы, без верхнего back-bar —
 * его каждая страница убирает сама.
 *
 * Подключается к уже существующему Firebase App той же логикой, что и
 * nav.js — ждёт getApps().length, не делает свой initializeApp(). 
 *
 * Каждая страница оборачивает свой контент в <div id="sbContent">...</div>
 * — sidebar.js найдёт этот узел и обернёт его вместе с собой в общий
 * флекс-контейнер. Если узел не найден — сайдбар просто вставляется
 * первым элементом body (страница сама отвечает за свою раскладку).
 */
(function () {
  const script = document.currentScript;
  const page   = script ? (script.getAttribute('data-page') || '') : '';
  const depth  = (window.location.pathname.replace(/\/+$/, '').match(/\//g) || []).length - 1;
  const b      = depth > 0 ? '../' : '';

  const CSS = `
    :root{
      --sb-w: 260px;
      --sb-gap: 16px;
    }

    /* Страница снова обычная — скроллится целиком, футер (подключается
       отдельным footer.js на каждой странице) остаётся в нормальном
       потоке документа под sb-shell. */
    html, body{ margin:0; background:#eceef1; }

    /* App-frame: серая рамка на весь экран. Сайдбар — часть этой рамки
       (тот же фон, без своей карточки), рабочая область — единственный
       элемент, который визуально выделяется. */
    .sb-shell{
      display:flex; align-items:stretch;
      height:100vh; width:100%;
    }

    /* Сайдбар — отдельная плавающая панель, та же оформа, что и
       рабочая область (свой фон, бордер, скругление), с таким же
       зазором от рамки сверху/снизу/слева, что и у .sb-content
       справа/сверху/снизу. Прилипает при скролле страницы
       (position:sticky). */
    .sb-nav{
      position:sticky; top:0; flex-shrink:0;
      width:var(--sb-w); height:calc(100vh - var(--sb-gap) * 2);
      background:var(--bg,#fff);
      border:1px solid var(--border,#dfe3e8);
      border-radius:32px;
      display:flex; flex-direction:column;
      margin:var(--sb-gap) var(--sb-gap) var(--sb-gap) var(--sb-gap);
      padding:8px 14px 20px;
      overflow-y:auto; overscroll-behavior:contain;
    }
    .sb-nav::-webkit-scrollbar{ width:0; }

    /* Лого/выход на главную сайта — раньше эту роль играла плавающая
       капсула nav.js, на десктопе в кабинете она теперь скрыта. */
    .sb-brand{
      display:flex; align-items:center; gap:10px;
      padding:8px 10px 20px; margin-bottom:8px;
      border-bottom:1px solid var(--border,#dfe3e8);
      text-decoration:none;
    }
    .sb-brand img{ width:26px; height:26px; border-radius:8px; object-fit:cover; flex-shrink:0; }
    .sb-brand span{ font-family:'Geologica','Inter','Arial',sans-serif; font-weight:500; font-size:1rem; letter-spacing:-.01em; color:var(--text,#191b1e); white-space:nowrap; overflow:hidden; }
    .sb-brand-row{ display:flex; align-items:center; gap:6px; padding:4px 4px 20px; margin-bottom:8px; border-bottom:1px solid var(--border,#dfe3e8); }
    .sb-brand-row .sb-brand{ padding:4px 6px; margin:0; border:none; flex:1; min-width:0; }

    /* Кнопка сворачивания текста — иконка-переключатель рядом с лого.
       Специально крупнее остальных элементов сайдбара — это главный
       переключатель режима, должен бросаться в глаза и легко ловиться
       курсором/пальцем. */
    .sb-collapse-btn{
      display:flex; align-items:center; justify-content:center;
      width:48px; height:48px; flex-shrink:0;
      border-radius:13px; border:none; background:none; cursor:pointer;
      color:var(--muted,#707a8a);
      transition:background .15s, color .15s;
    }
    .sb-collapse-btn:hover{ background:var(--bg,#fff); color:var(--text,#191b1e); }
    .sb-collapse-btn svg{ width:24px; height:24px; stroke:currentColor; stroke-width:1.7; fill:none; }
    .sb-collapse-btn .sb-ico-expand{ display:none; }

    .sb-nav-main{ display:flex; flex-direction:column; gap:3px; }
    .sb-nav-bottom{ display:flex; flex-direction:column; gap:3px; margin-top:auto; padding-top:14px; }

    .sb-link{
      position:relative;
      display:flex; align-items:center; gap:13px;
      padding:.6rem 1rem .6rem .6rem; border-radius:14px;
      color:var(--muted,#707a8a); text-decoration:none;
      font-family:'Geologica','Inter','Arial',sans-serif; font-weight:400; font-size:.92rem;
      background:none; border:none; cursor:pointer; width:100%; text-align:left;
      transition:background .15s, color .15s;
    }
    .sb-link-ico{
      width:36px; height:36px; flex-shrink:0; border-radius:11px;
      display:flex; align-items:center; justify-content:center;
      background:var(--bg2,#f2f4f7);
      transition:background .15s, color .15s, box-shadow .15s, transform .15s;
    }
    .sb-link-ico svg{ width:18px; height:18px; stroke:currentColor; stroke-width:1.8; flex-shrink:0; fill:none; }
    .sb-link:hover{ background:var(--bg2,#f2f4f7); color:var(--text,#191b1e); }
    .sb-link:hover .sb-link-ico:not([class*="sb-c-"]){ background:var(--bg,#fff); box-shadow:0 6px 14px -8px rgba(25,27,30,.2); }
    .sb-link.is-active{ background:var(--bg2,#f2f4f7); color:var(--text,#191b1e); font-weight:500; }
    .sb-link.is-active .sb-link-ico:not([class*="sb-c-"]){ background:var(--text,#191b1e); color:var(--green,#1ede7b); box-shadow:0 8px 18px -8px rgba(25,27,30,.4); }
    .sb-link-label{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    /* Цветные иконки меню — у каждого раздела свой акцентный градиент,
       иконка всегда белая поверх цвета для чёткого контраста. */
    .sb-link-ico[class*="sb-c-"]{ color:#fff; }
    .sb-link-ico[class*="sb-c-"] svg{ stroke:#fff; }
    .sb-link:hover .sb-link-ico[class*="sb-c-"]{ transform:scale(1.06); box-shadow:0 8px 16px -6px rgba(25,27,30,.35); }
    .sb-link.is-active .sb-link-ico[class*="sb-c-"]{ color:#fff; transform:scale(1.06); box-shadow:0 8px 18px -6px rgba(25,27,30,.4); }
    .sb-c-blue{ background:linear-gradient(135deg,#5b8cff,#2f6bff); }
    .sb-c-green{ background:linear-gradient(135deg,#4eea94,#149955); }
    .sb-c-teal{ background:linear-gradient(135deg,#3fe0d8,#0fc7c0); }
    .sb-c-purple{ background:linear-gradient(135deg,#a970ff,#8b3ffb); }
    .sb-c-orange{ background:linear-gradient(135deg,#ffab4d,#ff8a1f); }
    .sb-c-pink{ background:linear-gradient(135deg,#ff6fac,#ff3f8f); }
    .sb-c-yellow{ background:linear-gradient(135deg,#ffd75c,#ffc324); }
    .sb-c-indigo{ background:linear-gradient(135deg,#8b93ff,#5b63f0); }
    .sb-c-red{ background:linear-gradient(135deg,#ff7a7a,#e8634f); }
    .sb-badge{
      margin-left:auto; background:var(--green,#1ede7b); color:#191b1e;
      font-size:.64rem; font-weight:500; padding:.16rem .48rem; border-radius:7px;
      min-width:19px; text-align:center; flex-shrink:0;
    }
    .sb-badge.warn{ background:#f59e0b; color:#1a1400; }
    .sb-sep{ height:1px; background:var(--border,#dfe3e8); margin:10px 6px; flex-shrink:0; }
    .sb-link.danger{ color:#d95a48; }
    .sb-link.danger:hover{ background:none; color:#c44432; }
    .sb-link.danger .sb-link-ico:not([class*="sb-c-"]){ color:#d95a48; }
    .sb-link.danger:hover .sb-link-ico:not([class*="sb-c-"]){ background:rgba(232,99,79,.1); }

    /* Свёрнутое состояние — только иконки. Переключается кнопкой у
       лого, состояние держится в localStorage (см. JS ниже). */
    .sb-nav.is-collapsed{ width:84px; padding-left:10px; padding-right:10px; }
    .sb-nav.is-collapsed .sb-brand-row{ justify-content:center; padding-left:0; padding-right:0; }
    .sb-nav.is-collapsed .sb-brand{ display:none; }
    .sb-nav.is-collapsed .sb-link{ justify-content:center; gap:0; padding-left:0; padding-right:0; }
    .sb-nav.is-collapsed .sb-link-label{ display:none; }
    .sb-nav.is-collapsed .sb-collapse-btn .sb-ico-collapse{ display:none; }
    .sb-nav.is-collapsed .sb-collapse-btn .sb-ico-expand{ display:flex; }
    .sb-nav{ transition:width .18s ease; }

    /* Бейдж в свёрнутом виде — превращается в маленькую точку поверх
       иконки вместо цифры (иначе некуда её помещать). */
    .sb-nav.is-collapsed .sb-badge{
      position:absolute; top:4px; right:15px;
      width:9px; height:9px; min-width:0; padding:0; border-radius:50%;
      font-size:0; line-height:0; overflow:hidden;
    }

    /* Кастомная подсказка при наведении на иконку в свёрнутом виде —
       рисуется одним общим элементом, позиционируется через JS
       (position:fixed), чтобы не обрезаться overflow сайдбара. */
    .sb-tooltip{
      position:fixed; top:0; left:0; z-index:60;
      background:var(--text,#191b1e); color:#fff;
      font-family:'Geologica','Inter','Arial',sans-serif; font-size:.8rem; font-weight:400;
      padding:.42rem .7rem; border-radius:9px; white-space:nowrap;
      pointer-events:none; opacity:0; transform:translateY(-50%);
      transition:opacity .12s ease;
    }
    .sb-tooltip.is-visible{ opacity:1; }

    /* Приветственная плашка при первом заходе — объясняет назначение
       кнопки. Показывается один раз (флаг в localStorage), закрывается
       крестиком или сама через 20 секунд. */
    .sb-brand-row{ position:relative; }
    .sb-collapse-hint{
      position:absolute; top:100%; right:0; margin-top:10px; width:216px;
      background:var(--bg,#fff); border:1px solid var(--border,#dfe3e8);
      border-radius:14px; padding:.75rem 1.6rem .75rem .9rem;
      box-shadow:0 10px 28px rgba(25,27,30,.12);
      font-family:'Geologica','Inter','Arial',sans-serif; font-size:.78rem; line-height:1.4;
      color:var(--text,#191b1e); z-index:40;
      opacity:0; transform:translateY(-6px); pointer-events:none;
      transition:opacity .18s ease, transform .18s ease;
    }
    .sb-collapse-hint.is-visible{ opacity:1; transform:translateY(0); pointer-events:auto; }
    .sb-collapse-hint::before{
      content:''; position:absolute; top:-6px; right:15px; width:11px; height:11px;
      background:var(--bg,#fff); border-left:1px solid var(--border,#dfe3e8);
      border-top:1px solid var(--border,#dfe3e8); transform:rotate(45deg);
    }
    .sb-collapse-hint-close{
      position:absolute; top:6px; right:6px; width:20px; height:20px;
      display:flex; align-items:center; justify-content:center;
      border:none; background:none; cursor:pointer; border-radius:50%;
      color:var(--muted,#707a8a); font-size:1rem; line-height:1; padding:0;
    }
    .sb-collapse-hint-close:hover{ background:#eceef1; color:var(--text,#191b1e); }

    /* Рабочая область — плавающая панель приложения: отступы от рамки
       сверху/справа/снизу, вплотную к сайдбару слева, скругления по
       всем углам, собственный (не рамочный) фон. Читаемый максимум
       держит внутренний .shell, чтобы текст не растягивался на
       сверхширoких мониторах. */
    .sb-content{
      flex:1; min-width:0;
      height:calc(100vh - var(--sb-gap) * 2);
      overflow-y:auto; -webkit-overflow-scrolling:touch;
      margin:var(--sb-gap) var(--sb-gap) var(--sb-gap) var(--sb-gap);
      background:var(--bg,#fff);
      border:1px solid var(--border,#dfe3e8);
      border-radius:32px;
      padding:20px 56px 60px;
    }
    .sb-content > .shell{ max-width:1240px; margin:0 auto; }

    /* На десктопе капсула nav.js больше не нужна — её роль (профиль,
       уведомления, выход) уже покрывает сайдбар, а переход на главную
       сайта теперь через .sb-brand. На мобильных сайдбар скрыт, поэтому
       капсула возвращается как единственная навигация. */
    .antviz-nav{ display:none; }

    /* nav.js всегда добавляет body{padding-top:104px} под свою плавающую
       капсулу — на десктопе кабинета капсула скрыта (см. выше), но сам
       паддинг остаётся, если его не отменить явно. Отменяем только на
       десктопе: на мобильных капсула видима и паддинг под неё нужен. */
    @media (min-width:981px){
      body{ padding-top:0 !important; }
    }

    @media (max-width:980px){
      .antviz-nav{ display:flex; }
      .sb-nav{ display:none; }
      .sb-shell{ display:block; height:auto; }
      .sb-content{
        height:auto; overflow-y:visible;
        margin:0; border:none; border-radius:0;
        background:var(--bg,#fff);
        padding:88px 1.2rem 80px;
      }
    }
  `;

  const NAV_ITEMS = [
    { key:'profile',       href:b+'profile',               icon:'<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="2"/><rect x="13" y="13" width="7.5" height="7.5" rx="2"/>', label:'Обзор', color:'blue' },
    { key:'orders',        href:b+'profile/orders',        icon:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9.5h8M8 13h8M8 16.5h4.5"/>', label:'Мои заказы', badgeKey:'orders', color:'green' },
    { key:'sites',         href:b+'profile/sites',         icon:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z"/>', label:'Мои сайты', color:'teal' },
    { key:'support',       href:b+'profile/support',       icon:'<path d="M20.5 11.5a8.5 8.5 0 01-12.4 7.55L4 20l1.02-3.9a8.5 8.4 0 1115.48-4.6z"/>', label:'Чат с командой', badgeKey:'support', color:'purple' },
    { key:'tickets',       href:b+'profile/tickets',       icon:'<path d="M14.5 6.2a3.6 3.6 0 00-4.9 4.66l-5.6 5.6a1.9 1.9 0 002.7 2.7l5.6-5.6a3.6 3.6 0 004.66-4.9l-2.53 2.53-2-2z"/>', label:'Обслуживание', badgeKey:'tickets', color:'orange' },
    { key:'notifications', href:b+'profile/notifications', icon:'<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>', label:'Уведомления', badgeKey:'notif', color:'pink' },
    { key:'order',         href:b+'order',                 icon:'<path d="M12 5v14M5 12h14"/>', label:'Новый заказ', color:'yellow' },
    { sep:true },
    { key:'settings',      href:b+'profile/settings',      icon:'<circle cx="12" cy="12" r="2.7"/><path d="M19.1 14.6a1.5 1.5 0 00.3 1.65l.05.06a1.75 1.75 0 11-2.48 2.48l-.06-.05a1.5 1.5 0 00-1.65-.3 1.5 1.5 0 00-.9 1.37V20a1.75 1.75 0 01-3.5 0v-.08a1.5 1.5 0 00-.9-1.38 1.5 1.5 0 00-1.65.3l-.06.06a1.75 1.75 0 11-2.48-2.48l.05-.06a1.5 1.5 0 00.3-1.65 1.5 1.5 0 00-1.37-.9H4a1.75 1.75 0 010-3.5h.08a1.5 1.5 0 001.38-.9 1.5 1.5 0 00-.3-1.65l-.05-.06A1.75 1.75 0 117.59 5.3l.06.05a1.5 1.5 0 001.65.3H9.4a1.5 1.5 0 00.9-1.37V4a1.75 1.75 0 013.5 0v.08a1.5 1.5 0 00.9 1.38 1.5 1.5 0 001.65-.3l.06-.06a1.75 1.75 0 112.48 2.48l-.05.06a1.5 1.5 0 00-.3 1.65V9.4a1.5 1.5 0 001.37.9H20a1.75 1.75 0 010 3.5h-.08a1.5 1.5 0 00-1.38.9z"/>', label:'Настройки', color:'indigo' },
    { key:'logout',        logout:true, icon:'<path d="M9 4H6.5A2.5 2.5 0 004 6.5v11A2.5 2.5 0 006.5 20H9"/><path d="M20 12H10.5"/><path d="M16 8l4 4-4 4"/>', label:'Выйти', color:'red' },
  ];

  function renderItem(item) {
    const active = item.key === page ? ' is-active' : '';
    const badge = item.badgeKey ? `<span class="sb-badge" id="sbBadge-${item.badgeKey}" style="display:none"></span>` : '';
    const label = `<span class="sb-link-label">${item.label}</span>`;
    const icon = `<span class="sb-link-ico${item.color ? ' sb-c-' + item.color : ''}"><svg viewBox="0 0 24 24">${item.icon}</svg></span>`;
    if (item.logout) {
      return `<button class="sb-link danger" id="sbLogout" aria-label="${item.label}">${icon}${label}</button>`;
    }
    return `<a href="${item.href}" class="sb-link${active}" aria-label="${item.label}">${icon}${label}${badge}</a>`;
  }

  function buildNav() {
    const sepIdx = NAV_ITEMS.findIndex(i => i.sep);
    const main   = sepIdx === -1 ? NAV_ITEMS : NAV_ITEMS.slice(0, sepIdx);
    const bottom = sepIdx === -1 ? [] : NAV_ITEMS.slice(sepIdx + 1);
    return `
      <div class="sb-nav-main">${main.map(renderItem).join('')}</div>
      <div class="sb-nav-bottom"><div class="sb-sep"></div>${bottom.map(renderItem).join('')}</div>
    `;
  }

  function init() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const existingContent = document.getElementById('sbContent');

    const collapsed = localStorage.getItem('sb-collapsed') === '1';
    const hintSeen  = localStorage.getItem('sb-collapse-hint-seen') === '1';

    const shell = document.createElement('div');
    shell.className = 'sb-shell';
    shell.innerHTML = `<nav class="sb-nav${collapsed ? ' is-collapsed' : ''}" id="sbNav">
      <div class="sb-brand-row">
        <a class="sb-brand" href="${b || '/'}">
          <img src="${b}img/favicon.png" alt=""/>
          <span>Antviz</span>
        </a>
        <button class="sb-collapse-btn" id="sbCollapseBtn" type="button" aria-label="Свернуть/развернуть меню">
          <svg class="sb-ico-collapse" viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="4"/><path d="M9.5 4.5v15"/><path d="M15 9.5l-2.2 2.5 2.2 2.5"/></svg>
          <svg class="sb-ico-expand" viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="4"/><path d="M9.5 4.5v15"/><path d="M13.3 9.5l2.2 2.5-2.2 2.5"/></svg>
        </button>
        ${!collapsed && !hintSeen ? `
        <div class="sb-collapse-hint" id="sbCollapseHint">
          <button class="sb-collapse-hint-close" id="sbCollapseHintClose" type="button" aria-label="Закрыть подсказку">×</button>
          Эта кнопка сворачивает меню — останутся только иконки
        </div>` : ''}
      </div>
      ${buildNav()}
    </nav>`;

    if (existingContent) {
      existingContent.classList.add('sb-content');
      existingContent.parentNode.insertBefore(shell, existingContent);
      shell.appendChild(existingContent);
    } else {
      // Нет размеченного контейнера — просто вставляем сайдбар первым
      // элементом в body, страница сама отвечает за свою раскладку.
      document.body.insertBefore(shell, document.body.firstChild);
    }

    const navEl = document.getElementById('sbNav');

    function toggleCollapse() {
      const nowCollapsed = navEl.classList.toggle('is-collapsed');
      localStorage.setItem('sb-collapsed', nowCollapsed ? '1' : '0');
      dismissHint();
      return nowCollapsed;
    }

    // --- Приветственная подсказка при первом заходе ---
    let hintTimer = null;
    function dismissHint() {
      const hint = document.getElementById('sbCollapseHint');
      if (!hint) return;
      hint.classList.remove('is-visible');
      localStorage.setItem('sb-collapse-hint-seen', '1');
      if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
    }
    const hintEl = document.getElementById('sbCollapseHint');
    if (hintEl) {
      requestAnimationFrame(() => setTimeout(() => hintEl.classList.add('is-visible'), 300));
      hintTimer = setTimeout(dismissHint, 20000);
      document.getElementById('sbCollapseHintClose')?.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissHint();
      });
    }

    // --- Кнопка сворачивания + двойной клик по лого ---
    document.getElementById('sbCollapseBtn')?.addEventListener('click', toggleCollapse);
    document.querySelector('.sb-brand')?.addEventListener('dblclick', (e) => {
      e.preventDefault();
      toggleCollapse();
    });

    // --- Клавиатурный шорткат Ctrl/Cmd+B ---
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    });

    // --- Кастомные подсказки при наведении на иконки в свёрнутом виде ---
    const tooltip = document.createElement('div');
    tooltip.className = 'sb-tooltip';
    document.body.appendChild(tooltip);
    shell.querySelectorAll('.sb-link').forEach(link => {
      link.addEventListener('mouseenter', () => {
        if (!navEl.classList.contains('is-collapsed')) return;
        const label = link.getAttribute('aria-label');
        if (!label) return;
        const rect = link.getBoundingClientRect();
        tooltip.textContent = label;
        tooltip.style.left = (rect.right + 10) + 'px';
        tooltip.style.top = (rect.top + rect.height / 2) + 'px';
        tooltip.classList.add('is-visible');
      });
      link.addEventListener('mouseleave', () => tooltip.classList.remove('is-visible'));
      link.addEventListener('click', () => tooltip.classList.remove('is-visible'));
    });

    document.getElementById('sbLogout')?.addEventListener('click', async () => {
      try {
        const authMod = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        const appMod  = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
        if (appMod.getApps().length) {
          await authMod.signOut(authMod.getAuth(appMod.getApp()));
        }
      } catch (e) { console.error('sidebar.js signOut:', e); }
      window.location.href = b || '/';
    });
  }

  function setBadge(key, value, variant) {
    const el = document.getElementById(`sbBadge-${key}`);
    if (!el) return;
    if (!value) { el.style.display = 'none'; return; }
    el.className = 'sb-badge' + (variant ? ' ' + variant : '');
    el.textContent = String(value);
    el.style.display = 'inline-block';
  }

  // Подписки на бейджи — те же данные, что и в nav.js, но отдельная
  // подписка (sidebar.js и nav.js работают независимо, оба могут быть
  // на странице одновременно).
  function watchBadges(db, fsMod, user) {
    const { collection, query, where, onSnapshot } = fsMod;

    onSnapshot(
      query(collection(db, 'chats', user.uid, 'messages'), where('sender', '==', 'admin'), where('readByUser', '==', false)),
      snap => setBadge('support', snap.size, 'warn'),
      () => {}
    );

    onSnapshot(
      query(collection(db, 'notifications', user.uid, 'items'), where('read', '==', false)),
      snap => setBadge('notif', snap.size, 'warn'),
      () => {}
    );

    onSnapshot(
      query(collection(db, 'orders'), where('uid', '==', user.uid)),
      snap => {
        const orders = snap.docs.map(d => d.data());
        const active = orders.filter(o => (o.status || 0) >= 1 && (o.status || 0) <= 4).length;
        setBadge('orders', active, null);

        const activeSupport = orders.find(o =>
          o.supportActive && o.supportExpiresAt?.toDate &&
          o.supportExpiresAt.toDate() > new Date()
        );
        if (activeSupport) {
          const daysLeft = Math.ceil((activeSupport.supportExpiresAt.toDate() - new Date()) / (1000 * 60 * 60 * 24));
          setBadge('tickets', daysLeft <= 2 ? '!' : 0, 'warn');
        } else {
          setBadge('tickets', 0, null);
        }
      },
      () => {}
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  (async () => {
    try {
      const appMod  = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const authMod = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const fsMod   = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      let tries = 0;
      while (appMod.getApps().length === 0 && tries < 100) {
        await new Promise(r => setTimeout(r, 50));
        tries++;
      }
      if (appMod.getApps().length === 0) return;

      const app  = appMod.getApp();
      const auth = authMod.getAuth(app);
      const db   = fsMod.getFirestore(app);

      authMod.onAuthStateChanged(auth, user => {
        if (user) watchBadges(db, fsMod, user);
      });
    } catch (e) {
      console.error('sidebar.js auth error:', e);
    }
  })();
})();
