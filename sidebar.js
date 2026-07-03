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
    }

    /* App-shell: сайдбар и контент — две колонки высотой ровно в экран.
       Скроллится только .sb-content, сайдбар в прокрутке не участвует. */
    html, body{ height:100%; }
    body{ margin:0; overflow:hidden; }

    .sb-shell{
      display:flex; align-items:stretch;
      height:100vh; width:100%;
    }

    /* Сайдбар — докнут вплотную к левому краю на всю высоту окна,
       не карточка с отступами, а полноценная панель приложения. */
    .sb-nav{
      position:relative; flex-shrink:0;
      width:var(--sb-w); height:100%;
      background:var(--bg,#fff);
      border-right:1.5px solid var(--border,#dfe3e8);
      display:flex; flex-direction:column;
      padding:20px 14px;
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
    .sb-brand span{ font-family:'Geologica','Inter','Arial',sans-serif; font-weight:500; font-size:1rem; letter-spacing:-.01em; color:var(--text,#191b1e); }

    .sb-nav-main{ display:flex; flex-direction:column; gap:3px; }
    .sb-nav-bottom{ display:flex; flex-direction:column; gap:3px; margin-top:auto; padding-top:14px; }

    .sb-link{
      display:flex; align-items:center; gap:13px;
      padding:.9rem 1rem; border-radius:14px;
      color:var(--muted,#707a8a); text-decoration:none;
      font-family:'Geologica','Inter','Arial',sans-serif; font-weight:300; font-size:.92rem;
      background:none; border:none; cursor:pointer; width:100%; text-align:left;
      transition:background .15s, color .15s;
    }
    .sb-link svg{ width:19px; height:19px; stroke:currentColor; stroke-width:1.7; flex-shrink:0; fill:none; }
    .sb-link:hover{ background:var(--bg2,#f2f4f7); color:var(--text,#191b1e); }
    .sb-link.is-active{ background:var(--bg2,#f2f4f7); color:var(--text,#191b1e); font-weight:500; }
    .sb-link.is-active svg{ stroke:var(--green,#1ede7b); }
    .sb-badge{
      margin-left:auto; background:var(--green,#1ede7b); color:#191b1e;
      font-size:.64rem; font-weight:500; padding:.16rem .48rem; border-radius:7px;
      min-width:19px; text-align:center; flex-shrink:0;
    }
    .sb-badge.warn{ background:#f59e0b; color:#1a1400; }
    .sb-sep{ height:1px; background:var(--border,#dfe3e8); margin:10px 6px; flex-shrink:0; }
    .sb-link.danger{ color:#d95a48; }
    .sb-link.danger:hover{ background:rgba(232,99,79,.08); color:#c44432; }
    .sb-link.danger svg{ stroke:#d95a48; }

    /* Контент — единственная скроллящаяся область. Сам скролл-контейнер
       тянется на всю оставшуюся ширину, а читаемый максимум держит уже
       внутренний .shell, чтобы текст не растягивался во всю ширину
       экрана на сверхширoких мониторах. */
    .sb-content{
      flex:1; min-width:0; height:100%;
      overflow-y:auto; -webkit-overflow-scrolling:touch;
      padding:48px 56px 60px;
    }
    .sb-content > .shell{ max-width:1240px; margin:0 auto; }

    /* На десктопе капсула nav.js больше не нужна — её роль (профиль,
       уведомления, выход) уже покрывает сайдбар, а переход на главную
       сайта теперь через .sb-brand. На мобильных сайдбар скрыт, поэтому
       капсула возвращается как единственная навигация. */
    .antviz-nav{ display:none; }

    @media (max-width:980px){
      html, body{ height:auto; }
      body{ overflow:visible; }
      .antviz-nav{ display:flex; }
      .sb-nav{ display:none; }
      .sb-shell{ display:block; height:auto; }
      .sb-content{ height:auto; overflow:visible; padding:88px 1.2rem 80px; }
    }
  `;

  const NAV_ITEMS = [
    { key:'profile',       href:b+'profile',               icon:'<rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="2"/><rect x="13" y="13" width="7.5" height="7.5" rx="2"/>', label:'Обзор' },
    { key:'orders',        href:b+'profile/orders',        icon:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9.5h8M8 13h8M8 16.5h4.5"/>', label:'Мои заказы', badgeKey:'orders' },
    { key:'sites',         href:b+'profile/sites',         icon:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z"/>', label:'Мои сайты' },
    { key:'support',       href:b+'profile/support',       icon:'<path d="M20.5 11.5a8.5 8.5 0 01-12.4 7.55L4 20l1.02-3.9a8.5 8.4 0 1115.48-4.6z"/>', label:'Чат с командой', badgeKey:'support' },
    { key:'tickets',       href:b+'profile/tickets',       icon:'<path d="M14.5 6.2a3.6 3.6 0 00-4.9 4.66l-5.6 5.6a1.9 1.9 0 002.7 2.7l5.6-5.6a3.6 3.6 0 004.66-4.9l-2.53 2.53-2-2z"/>', label:'Обслуживание', badgeKey:'tickets' },
    { key:'notifications', href:b+'profile/notifications', icon:'<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>', label:'Уведомления', badgeKey:'notif' },
    { key:'order',         href:b+'order',                 icon:'<path d="M12 5v14M5 12h14"/>', label:'Новый заказ' },
    { sep:true },
    { key:'settings',      href:b+'profile/settings',      icon:'<circle cx="12" cy="12" r="2.7"/><path d="M19.1 14.6a1.5 1.5 0 00.3 1.65l.05.06a1.75 1.75 0 11-2.48 2.48l-.06-.05a1.5 1.5 0 00-1.65-.3 1.5 1.5 0 00-.9 1.37V20a1.75 1.75 0 01-3.5 0v-.08a1.5 1.5 0 00-.9-1.38 1.5 1.5 0 00-1.65.3l-.06.06a1.75 1.75 0 11-2.48-2.48l.05-.06a1.5 1.5 0 00.3-1.65 1.5 1.5 0 00-1.37-.9H4a1.75 1.75 0 010-3.5h.08a1.5 1.5 0 001.38-.9 1.5 1.5 0 00-.3-1.65l-.05-.06A1.75 1.75 0 117.59 5.3l.06.05a1.5 1.5 0 001.65.3H9.4a1.5 1.5 0 00.9-1.37V4a1.75 1.75 0 013.5 0v.08a1.5 1.5 0 00.9 1.38 1.5 1.5 0 001.65-.3l.06-.06a1.75 1.75 0 112.48 2.48l-.05.06a1.5 1.5 0 00-.3 1.65V9.4a1.5 1.5 0 001.37.9H20a1.75 1.75 0 010 3.5h-.08a1.5 1.5 0 00-1.38.9z"/>', label:'Настройки' },
    { key:'logout',        logout:true, icon:'<path d="M9 4H6.5A2.5 2.5 0 004 6.5v11A2.5 2.5 0 006.5 20H9"/><path d="M20 12H10.5"/><path d="M16 8l4 4-4 4"/>', label:'Выйти' },
  ];

  function renderItem(item) {
    const active = item.key === page ? ' is-active' : '';
    const badge = item.badgeKey ? `<span class="sb-badge" id="sbBadge-${item.badgeKey}" style="display:none"></span>` : '';
    if (item.logout) {
      return `<button class="sb-link danger" id="sbLogout"><svg viewBox="0 0 24 24">${item.icon}</svg>${item.label}</button>`;
    }
    return `<a href="${item.href}" class="sb-link${active}"><svg viewBox="0 0 24 24">${item.icon}</svg>${item.label}${badge}</a>`;
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

    const shell = document.createElement('div');
    shell.className = 'sb-shell';
    shell.innerHTML = `<nav class="sb-nav" id="sbNav">
      <a class="sb-brand" href="${b || '/'}">
        <img src="${b}img/favicon.png" alt=""/>
        <span>Antviz</span>
      </a>
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
